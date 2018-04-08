<template>
  <div class="cascader-wrapper">
    <input
      v-model="inputText"
      icon="android-close"
      @click="handleClear"
    />
    <div class="cascader-menu-loading" v-if="showLoading">
      <!-- <x-icon name="load-c" size="24" animate="spin" color="#cfefdf"></x-icon> -->
    </div>
    <div
      class="cascader-menu-nodata"
      v-if="localList.length==0"
    >
      无匹配数据
    </div>
    <ul class="cascader-menu" ref="selectMenu">
      <v-menu-item
        v-for="item in localList"
        :key="item.value"
        :initItem="item"
        :ref="'item' + item.value"
        :multiple="multiple"
        @click="handleClick"
        @mouseenter="handleMouseEnter"
      ></v-menu-item>
    </ul>
    <cascader-menu
      v-if="show"
      :initData="childData"
      :parentData="selectData"
      :pid="pid"
      :pointer="getPointer"
      :keyAttr="keyAttr"
      :handler="handler"
      :clickParent="clickParent"
      :multiple="multiple"
      :cacheMap="cacheMap"
      :localCache="localCache"
      :currentVal="currentVal"
      @getValue="getValue"
      @saveCache="saveCache"
    ></cascader-menu>
  </div>
</template>
<script>
import MenuItem from './menuItem.vue'

export default {
  name: 'cascader-menu',
  components: {
    'v-menu-item': MenuItem
  },
  props: {
    initData: Array,
    parentData: Array, // 递归组件的上一级的数据
    pid: Number, // parentID
    pointer: Number, // 索引指针
    keyAttr: Array, // 关键字索引数组
    handler: Object, // 异步回掉函数
    clickParent: Boolean, // 是否可以点击非最后子集
    multiple: Boolean, // 是否支持多选
    cacheMap: Object, // 数据缓存池
    localCache: Boolean, // 是否支持本地缓存
    currentVal: Object // v-model的初始值
  },
  data () {
    return {
      show: false,
      childData: [], // 递归的下一级的数据
      selectData: [], // 当前已选择的全部数据
      currentData: [], // 当前已选择的当前级的数据
      showLoading: false,
      inputText: '',
      localList: [],
      selectList: [], // 当前多选已经选择的数据
      multipleSelectData: [] // 支持多选时候当前已选择的数据
    }
  },
  computed: {
    getPointer () {
      let currentPointer = this.pointer
      return ++currentPointer
    }
  },
  created () {
    if (!this.initData.length && this.pointer !== this.keyAttr.length) {
      this.showLoading = true
      let p = this.pointer
      let currentKey = this.keyAttr[this.pointer]
      let previewKey = this.keyAttr[p - 1]
      let currentArr = []
      // 支持多选
      if (this.multiple) {
        currentArr = this.parentData[this.parentData.length - 1]
        let handlerMap = []
        let paramsMap = []
        let handlerObj = this.handler[currentKey]
        for (let i = 0; i < currentArr.length; i++) {
          let item = currentArr[i]
          let params = {}
          params[previewKey] = item.value
          // 如果有数据缓存
          if (
            this.cacheMap[currentKey] &&
            this.cacheMap[currentKey][params[previewKey]] &&
            this.localCache
          ) {
            let cacheData = this.cacheMap[currentKey][params[previewKey]]
            this.currentData.push(...cacheData)
            this.localList = this.currentData
            this.showLoading = false
            // 初始化选中状态
            this.initSelectData()
            continue
          }
          handlerMap.push(handlerObj['callback'](params))
          paramsMap.push(params)
        }
        Promise.all(handlerMap).then(
          result => {
            this.showLoading = false
            result.forEach((item, index) => {
              let currentData = handlerObj['handler'](item)
              this.currentData.push(...currentData)
              // 数据缓存
              if (this.localCache) {
                this.$emit('saveCache', {
                  // 缓存的key-value对象
                  cacheObj: {
                    [paramsMap[index][previewKey]]: currentData
                  },
                  // 缓存的层级key, 加一层这个是因为北京-北京省市的Id是相同的需要区分层级不然handler处理会出错
                  key: currentKey
                })
              }
            })
            this.localList = this.currentData
            // 初始化选中状态
            this.initSelectData()
          },
          errmsg => {
            this.$Message.error(errmsg)
          }
        )
      } else {
        let params = {}
        params[previewKey] = this.parentData[this.parentData.length - 1].value
        // 如果有数据缓存
        if (
          this.cacheMap[currentKey] &&
          this.cacheMap[currentKey][params[previewKey]] &&
          this.localCache
        ) {
          let cacheData = this.cacheMap[currentKey][params[previewKey]]
          this.currentData = cacheData
          this.localList = cacheData
          this.showLoading = false
          // 初始化选中状态
          this.initSelectData()
          return
        }
        let handlerObj = this.handler[currentKey]
        handlerObj['callback'](params).then(
          res => {
            this.showLoading = false
            this.currentData = handlerObj['handler'](res)
            this.localList = this.currentData
            // 数据缓存
            if (this.localCache) {
              this.$emit('saveCache', {
                // 缓存的key-value对象
                cacheObj: {
                  [params[previewKey]]: this.currentData
                },
                // 缓存的层级key, 加一层这个是因为北京-北京省市的Id是相同的需要区分层级不然handler处理会出错
                key: currentKey
              })
            }
            // 初始化选中状态
            this.initSelectData()
          },
          errmsg => {
            this.$Message.error(errmsg)
          }
        )
      }
    } else {
      this.currentData = this.initData
      this.localList = this.currentData
      // 初始化选中状态
      this.initSelectData()
    }
  },
  methods: {
    getValue (val) {
      this.$emit('getValue', val)
    },
    saveCache (val) {
      this.$emit('saveCache', val)
    },
    handleLocalSug (val) {
      if (!val) {
        this.localList = this.currentData
        return
      }
      this.localList = this.currentData.filter(item => {
        return val ? item.text.indexOf(val) > -1 : true
      })
    },
    handleClick (data) {
      if (!this.clickParent) {
        if (!data.children_list) {
          if (this.multiple) {
            if (this.parentData) {
              this.selectData = [...this.parentData]
            }
            this.selectData.push(data)
            if (!this.isInArr(data, this.multipleSelectData)) {
              this.multipleSelectData.push(data)
            } else {
              this.multipleSelectData.splice(
                this.getIndexByValue(data.value, this.multipleSelectData),
                1
              )
            }
            this.$nextTick(() => {
              this.toggleItemActiveByArr(this.multipleSelectData)
              let tmpData = this.selectData.slice(0)
              tmpData[tmpData.length - 1] = this.multipleSelectData
              this.$emit('getValue', tmpData)
            })
          } else {
            this.$emit('getValue', this.selectData)
          }
        } else {
          if (this.multiple) {
            this.handleSelect(data)
          }
        }
      } else {
        this.$emit('getValue', this.selectData)
      }
    },
    handleSelect (data) {
      if (this.isInArr(data, this.selectList)) {
        this.selectList.splice(
          this.getIndexByValue(data.value, this.selectList),
          1
        )
      } else {
        this.selectList.push(data)
      }
      // 当点击切换的时候需要清除上一次的选中状态和数据
      this.selectData = []
      if (this.parentData) {
        this.selectData = [...this.parentData]
      }
      this.selectData.push(this.selectList)
      this.show = false
      this.$nextTick(() => {
        this.toggleItemActiveByArr(this.selectList)
        if (!data.children_list || !this.selectList.length) {
          this.show = false
          return
        }
        this.childData = data.children_list
        this.show = true
      })
    },
    initSelectData () {
      let valueMap = this.currentVal.valueMap
      if (!valueMap) {
        return
      }
      let currentData = valueMap[this.pointer]
      if (this.multiple) {
        currentData.forEach(item => {
          this.handleClick(item)
        })
      } else {
        this.handleMouseEnter(currentData)
      }
    },
    handleMouseEnter (data) {
      if (this.multiple) {
        return
      }
      // 当点击切换的时候需要清除上一次的选中状态和数据
      this.selectData = []
      if (this.parentData) {
        this.selectData = [...this.parentData]
      }
      this.selectData.push(data)
      this.show = false
      this.$nextTick(() => {
        this.toggleItemActive(data.value)
        if (!data.children_list) {
          this.show = false
          return
        }
        this.childData = data.children_list
        this.show = true
      })
    },
    toggleItemActive (value) {
      for (let i = 0; i < this.localList.length; i++) {
        let item = this.localList[i]
        if (item.value === value) {
          this.$refs[`item${item.value}`][0].changeActive(true)
        } else {
          this.$refs[`item${item.value}`][0].changeActive(false)
        }
      }
    },
    toggleItemActiveByArr (arr) {
      for (let i = 0; i < this.localList.length; i++) {
        let item = this.localList[i]
        if (!this.isInArr(item, arr)) {
          this.$refs[`item${item.value}`][0].changeActive(false)
        } else {
          this.$refs[`item${item.value}`][0].changeActive(true)
        }
      }
    },
    handleClear (e) {
      this.currentVal = {}
      this.inputText = ''
    },
    getIndexByValue (value, arr) {
      for (let i = 0; i < arr.length; i++) {
        let current = arr[i]
        if (current.value === value) {
          return i
        }
      }
    },
    isInArr (item, arr) {
      for (let i = 0; i < arr.length; i++) {
        let current = arr[i]
        if (current.value === item.value) {
          return true
        }
      }
      return false
    }
  },
  watch: {
    inputText (val) {
      this.handleLocalSug(val)
      this.show = false
    }
  }
}
</script>
<style lang="less">
.cascader-wrapper {
  padding: 10px;
  position: absolute;
  top: -1px;
  left: 100%;
  border: 1px solid #d1dbe5;
  border-radius: 2px;
  box-sizing: border-box;
  min-height: 200px;
  background: #fff;
  .active {
    background: #f1f3f9;
    color: #5166b9;
  }
  .cascader-menu-loading {
    text-align: center;
    margin-top: 10px;
  }
  .cascader-menu-nodata {
    text-align: center;
  }
}
</style>
