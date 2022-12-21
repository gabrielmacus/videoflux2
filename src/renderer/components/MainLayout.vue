<template>

  <div class="main-layout">
    <header>

      <UserBar></UserBar>
      <slot name="header">
      </slot>
    </header>
    <main class="container">

      <slot></slot>

    </main>

  </div>

</template>

<style  lang="scss">
.main-layout
{
  height: 100%;
  width: 100%;
}
body,html{
  height: 100%;
  padding:0;
  margin: 0;
}
main
{
  padding: 1rem;
  max-width: 1100px;
  margin: auto;
  width: 100%
}

</style>

<script>
  import { ipcRenderer } from 'electron'
  import UserBar from './UserBar.vue'
  //import isOnline  from 'is-online';

  export default {
    name: 'main-layout',
    components: { UserBar },
    data(){
      return {
        //isOnline:false
      }
    },
    computed:{

    },
    async mounted() {
      //this.isOnline = window.isOnline;//await isOnline();
    },
    methods: {

    }
  }
</script>
