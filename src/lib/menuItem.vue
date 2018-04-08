<template>
  <li
    class="cascader-menu-item"
    :class="active ? 'active' : ''"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
  >
    <span class="cascader-menu-item-text">{{initItem.text}}</span>
  </li>
</template>
<script>
export default {
  props: {
    initItem: Object,
    multiple: Boolean
  },
  data () {
    return {
      itemData: {},
      active: false
    }
  },
  methods: {
    changeActive (flag) {
      this.active = flag
    },
    handleClick () {
      this.active = true
      this.$emit('click', this.initItem)
    },
    handleMouseEnter () {
      if (this.multiple) {
        return
      }
      this.active = true
      this.$emit('mouseenter', this.initItem)
    }
  }
}
</script>
