<template>
  <div id="app">
    <router-view></router-view>
    <FullscreenMessage :message="updateMessage"></FullscreenMessage>
  </div>
</template>

<script>
import Vue from 'vue';
  import VueToast from 'vue-toast-notification';
  import 'vue-toast-notification/dist/index.css';
  Vue.use(VueToast);

  import store from './store/index.js';
  import FullscreenMessage from './components/FullscreenMessage.vue';
  import { ipcRenderer } from 'electron'

  export default {
    name: 'videoflux2',
    components:{FullscreenMessage},
    data(){
        return {
            updateMessage:""
        }
    },
    mounted(){

    let self = this;
    self.$toast.open({
              message: `Verificando actualizaciones...`,
              type: 'info',
          });

    ipcRenderer.on('update_available', () => {
      ipcRenderer.removeAllListeners('update_available');
      self.updateMessage = "Actualización disponible. Descargando...";

    });
    ipcRenderer.on('update_downloaded', () => {
       ipcRenderer.removeAllListeners('update_downloaded');
       self.updateMessage = "Actualización descargada. Se reiniciara la aplicación";
       ipcRenderer.send('restart_app');


    });

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
