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

  const versionChanges = require('../../package.json').versionChanges;
  const appVersion = require('../../package.json').version;

  //const Store = require('electron-store');
  

  import FullscreenMessage from './components/FullscreenMessage.vue';
  import { app, ipcRenderer } from 'electron'


  export default {
    name: 'videoflux2',
    components:{FullscreenMessage},
    data(){
        return {
            updateMessage:""
        }
    },
    mounted(){
    const updateMessageKey = "update-message-shown";

    if(!localStorage.getItem(updateMessageKey) || localStorage.getItem(updateMessageKey) == "0")
    {
      alert(`Versión ${appVersion}\n${versionChanges}`)
      localStorage.setItem(updateMessageKey,"1");
    }
      
    let self = this;
    self.$toast.open({
              message: `Verificando actualizaciones...`,
              type: 'info',
          });

    ipcRenderer.on('update_available', () => {
      localStorage.setItem(updateMessageKey,"0");
      ipcRenderer.removeAllListeners('update_available');
      self.updateMessage = "Actualización encontrada. Descargando...";

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
