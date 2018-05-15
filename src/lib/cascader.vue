<template>
  <div class="vui-cascader" :value="value" v-clickoutside="close">
    <div class="vui-cascader-input-wrapper">
      <input
        class="vui-input"
        v-model="inputText"
        icon="android-close"
        :disabled="disabled"
        :placeholder="placeholder"
        @change="handleChange"
        @focus="handleFocus"
      />
      <i
        class="iconfont icon-close vui-cascader-input-close"
        @click="handleClear"
      ></i>
    </div>
    <transition name="fade">
      <div class="vui-cascader-wrapper" v-if="show">
        <v-menu
          v-if="localList.length > 0"
          :currentVal="currentVal"
          :initData="localList"
          :pid="uid"
          :pointer="pointer"
          :keyAttr="keyAttr"
          :handler="handler"
          :clickParent="clickParent"
          :multiple="multiple"
          :cacheMap="cacheMap"
          :localCache="localCache"
          @getValue="getValue"
          @saveCache="saveCache"
        ></v-menu>
        <div class="no-data" v-if="localList.length == 0">无匹配数据</div>
      </div>
    </transition>
</div>
</template>
<script>
import Menu from './menu.vue'
import Clickoutside from './util/clickoutside.es'
export default {
  name: 'vui-cascader',
  components: {
    'v-menu': Menu
  },
  directives: {
    Clickoutside
  },
  props: {
    initData: Array,
    value: Object,
    disabled: Boolean,
    placeholder: String,
    // 每一级的关键字索引数组
    keyAttr: {
      type: Array,
      default () {
        return []
      }
    },
    // 异步获取数据的回调函数
    handler: {
      type: Object,
      default () {
        return {}
      }
    },
    // 是否允许点击每一级
    clickParent: {
      type: Boolean,
      default: false
    },
    // 是否支持本地缓存
    localCache: {
      type: Boolean,
      default: true
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      currentVal: this.value,
      localList: [],
      show: false,
      uid: '',
      inputText: '',
      pointer: 0,
      cacheMap: {}
    }
  },
  created () {
    this.uid = this._uid
  },
  methods: {
    saveCache (cacheData) {
      if (!this.cacheMap[cacheData.key]) {
        this.cacheMap[cacheData.key] = {}
      }
      this.cacheMap[cacheData.key] = Object.assign(
        {},
        this.cacheMap[cacheData.key],
        cacheData.cacheObj
      )
    },
    getValue (value) {
      if (this.multiple) {
        this.currentVal = {
          value: value[value.length - 1],
          valueMap: value
        }
        this.inputText = `已选择${this.currentVal.value.length}项`
      } else {
        this.show = false
        this.currentVal = {
          text: this.handleSelectData(value),
          value: value[value.length - 1].value,
          valueMap: value
        }
        this.inputText = this.currentVal.text
      }
    },
    showMenu () {
      this.show = !this.show
    },
    close () {
      this.show = false
    },
    handleSelectData (data) {
      let tmpData = data.slice(0)
      let newData = tmpData.map(item => {
        return item.text
      })
      return newData.join('/')
    },
    handleChange (e) {
      this.$emit('change', e)
    },
    handleFocus (e) {
      this.showMenu()
    },
    handleClear (e) {
      this.currentVal = {}
      this.inputText = ''
    }
  },
  watch: {
    initData (val) {
      this.localList = val
    },
    value (val) {
      this.currentVal = val
      this.inputText = this.multiple
        ? `已选择${val.valueMap[val.valueMap.length - 1].length}项`
        : val.text
    },
    currentVal (val) {
      this.$emit('input', val)
    }
  }
}
</script>
<style lang="less">
.vui-cascader {
  position: relative;
  display: flex;
  .vui-input {
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: none;
    padding: 0 34px 0 15px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width: 100%;
  }
  .vui-cascader-input-wrapper {
    position: relative;
    .vui-cascader-input-close {
      position: absolute;
      top: 12px;
      right: 10px;
      color: #DCDFE6;
      font-weight: 500;
      cursor: pointer;
    }
  }
  .vui-cascader-wrapper {
    z-index: 1000;
    background: #fff;
    position: absolute;
    top: 45px;
    box-sizing: border-box;
    .no-data {
      font-size: 14px;
      padding: 8px 30px 8px 10px;
      color: #48576a;
      text-align: center;
      background: #fff;
      min-width: 160px;
      border: 1px solid #d1dbe5;
      border-radius: 2px;
      box-sizing: border-box;
    }
    .cascader-menu {
      margin: 0 -10px;
      display: inline-block;
      vertical-align: top;
      max-height: 204px;
      overflow: auto;
      background-color: #fff;
      box-sizing: border-box;
      padding: 6px 0;
      min-width: 130px;
      .cascader-menu-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        padding: 8px 10px 8px 10px;
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        height: 36px;
        line-height: 1.5;
        box-sizing: border-box;
        cursor: pointer;
        &:hover {
          background: #f1f3f9;
        }
        .cascader-menu-item-text {
          flex: 1;
        }
        .x-icon-checkmark {
          margin-right: 10px;
        }
      }
    }
  }
  .fade-enter-active {
    transition: all 0.3s ease;
  }
  .fade-leave-active {
    transition: all 0.3s ease;
  }
  .fade-enter,
  .fade-leave-to {
    transform: translateY(10px);
    opacity: 0;
  }
}
</style>
