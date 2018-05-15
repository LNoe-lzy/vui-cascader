<template>
  <div id="app">
    <vui-cascader
      v-model="value"
      :initData="data"
      :clickParent="true"
      :multiple="false"
    />
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      data: [],
      value: {}
    }
  }
}
</script>

<style>
#app {
  width: 200px;
}
</style>
