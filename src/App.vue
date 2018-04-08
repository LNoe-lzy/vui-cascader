<template>
  <div id="app">
    <img src="./assets/logo.png">
    <vui-cascader
      v-model="filter.structure.value"
      :initData="filter.structure.data"
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
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
