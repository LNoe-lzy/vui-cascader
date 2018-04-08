import cascader from './cascader.vue'
const VuiCascader = {
  install (Vue, options) {
    Vue.component(cascader.name, cascader)
  }
}
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VuiCascader)
}
export default VuiCascader
