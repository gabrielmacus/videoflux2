<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import store from './store/index.js';


  export default {
    name: 'videoflux2'
  }
</script>

<style lang="scss">
@import "assets/reset.css";
@import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');
body{font-family: 'Roboto', sans-serif;}
#app
{
  display: flex;
  align-items: center;
  height: 100%;
}

  /* CSS */
</style>
