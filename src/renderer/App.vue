<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import store from './store/index.js';
  import { ipcRenderer } from 'electron'

  export default {
    name: 'videoflux2',
    mounted(){
    ipcRenderer.once('update_available', () => {
      alert("Actualización disponible. Descargando...");

    });
    ipcRenderer.once('update_downloaded', () => {
      alert("Actualización descargada. Reinicie la aplicación");
    });
    alert("Verificando actualizaciones...");
    ipcRenderer.send("check_updates");

    }
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
