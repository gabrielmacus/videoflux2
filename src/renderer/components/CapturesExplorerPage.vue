<template>
  <MainLayout>
    <GlobalEvents
      @keydown="onKeyPress"
    />

    <div slot="header" class="header">
      <div class="breadcrumb" v-if="breadcrumb.length > 0">
        <span @click="loadFolder(folder)" v-for="folder in breadcrumb"><span class="folder-name">{{folder.name}}</span> <span class="separator">></span></span>
      </div>

    </div>


    <div class="explorer">
      <CustomButton class="load-captures"  v-on:click="loadFolder()">Cargar capturas</CustomButton>

      <div  class="folders">
        <div v-if="folders.length == 0" class="empty">No hay carpetas cargadas</div>
        <div @click="loadFolder(folder)" class="folder" :class="{active:activeItem == folder.path}" v-for="folder in folders">
          <span class="name">{{folder.name}}</span>
        </div>
      </div>

        <div class="extra-actions">
          <CustomButton class="verify-infractions" :class="{'disabled':!isOnline}"  v-on:click="verifyInfractions()">Verificar infracciones</CustomButton>
          <CustomButton style="height: 100%;" :class="{'disabled':!isOnline}"  v-on:click="viewStatistics()" class="verify-infractions" >Ver estadísticas</CustomButton>



          <CustomButton 
                        v-if="currentDayStatistic && currentDayStatistic.weather == 'RAINY'"
                        :class="{'disabled':!capturesDate, 'disabled':!isOnline}"
                        style="height: 100%;"
                        class="mark-rainy-day"
                        v-on:click="unmarkRainyDay()" >Desmarcar día lluvioso</CustomButton>
          <CustomButton 
                        v-else
                        :class="{'disabled':!capturesDate, 'disabled':!isOnline}"
                        style="height: 100%;"
                        class="mark-rainy-day"
                        v-on:click="markRainyDay()" >Marcar día lluvioso</CustomButton>


        </div>
    </div>

    <div class="images">



      <div class="loading" v-if="loadingImages">Cargando...</div>
      <ImageViewer  class="image-viewer" :imageIndex.sync="imageIndex" v-on:imageCaptured="onImageCaptured"  :images="images"></ImageViewer>
      <div class="current-infraction">

        <div class="infraction-capture">
          <img :src="capture_1">
        </div>

        <div  class="infraction-capture">
          <img :src="capture_2">
        </div>

        <div  class="infraction-capture">
          <img :src="capture_3">
        </div>

        <form class="infraction-data" @submit.prevent="saveInfraction">
          <CustomTextInput :tabindex="1" class="time-input" :mask="'hh:mm:ss'"   v-model="infraction.time" placeholder="Hora"></CustomTextInput>
          <div class="plate-input-container">
            <CustomTextInput :tabindex="2" :disabled="infraction.unreadablePlate"    class="plate-input" v-model="infraction.plate" placeholder="Patente"></CustomTextInput>
            <CustomCheckboxInput v-model="infraction.unreadablePlate">No se lee</CustomCheckboxInput>
          </div>
          <div class="button-container">
            <CustomButton :disabled="!((infraction.plate || infraction.unreadablePlate) && infraction.time)" class="save-infraction" >Guardar</CustomButton>
            <CustomButton :htmlType="'button'"  v-if="lastSavedInfraction" v-on:click="undoLastInfraction()">Deshacer última infracción</CustomButton>
          </div>
        </form>

      </div>
    </div>

    <CustomPopup :opened.sync="cropperPopupOpened" class="cropper-popup">
      <vue-croppie
           ref="croppieRef"
           :boundary="{ width: 480, height: 270}"
           :enableResize="false"
           :viewport="{ width: 300, height: 155}"
           @result="cropResult"
           @update="cropUpdate">
       </vue-croppie>
    </CustomPopup>



    <FullscreenMessage v-if="verifyingInfractions" message="Verificando que las infracciones se hayan subido correctamente..."></FullscreenMessage>

    <Statistics @close="openedStatisticsView=false" :data="statistics"  v-if="openedStatisticsView"></Statistics>


  </MainLayout>
</template>

<style scoped lang="scss">
  @import "../assets/theme.scss";
  .button-container
  {
    display:grid;
    grid-gap:10px;
  }
  .disabled
  {
    pointer-events: none;
    opacity: 0.5;
  }
  .plate-input-container
  {
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    grid-gap: 1rem;
  }
  .loading
  {
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.65);
    z-index: 2;
    color: white;
    font-weight: 600;
    font-size: 1.5rem;
  }
  .breadcrumb
  {
    background: black;
    color: white;
    display: flex;

    span{

      cursor:pointer;

      padding: 0.5rem;

      .folder-name:hover
      {
      text-decoration:underline;
      }

      .separator{
        padding: 0;
        padding-left: 0.5rem;
      }
      &:last-child .separator
      {
        display: none;
      }
    }

  }
  img{
    display:block;
    width: 100%;
  }
  .explorer
  {
    display: grid;
        margin-bottom: 1rem;
    grid-template-columns: 120px 1fr 350px;
    .extra-actions
    {
      margin-left: 0.5rem;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-gap: 0.5rem;
    }
    height: 103px;
  }
  .save-infraction
  {
    margin-top: 1rem;
  }
  .images
  {
    position: relative;
    align-items: center;
    background: #424242 ;
    display: flex;
  }
  .current-infraction
  {
    img{
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)
    }
    .infraction-capture
    {
      padding:1rem;
      &:nth-child(2)
      {
        padding-top: 0;
      }
      &:nth-child(3)
      {
        padding-top: 0;
      }
    }
    .infraction-data
    {
      .time-input,.plate-input
      {
        margin-bottom: 0.5rem;
      }
      padding: 1rem;
      background-color: #f5f5f5;
    }
    width: 30%;
    background: #e0e0e0;

  }
  .image-viewer
  {
    width: 70%;
  }

  .load-captures
  {
    height: 100%;
  }
  .folder
  {
    &.active
    {
      background: #f9a825;
      color: white;
    }
    margin-right: 1rem;
    background: #ffd54f;
    padding: 1rem;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  }
  .folders
  {
    padding: 1rem;
    background: #e0e0e0;
    overflow-x: scroll;
    display: flex;
    .empty
    {
      width: 100%;
      text-align: center;
      align-items: center;
      display: flex;
      justify-content: center;
    }

  }

</style>

<script>
  import VueToast from 'vue-toast-notification';
  import 'vue-toast-notification/dist/index.css';
  Vue.use(VueToast);

  import Vue from 'vue';
  import VueCroppie from 'vue-croppie';
  import 'croppie/croppie.css' // import the croppie css manually
  import GlobalEvents from 'vue-global-events'
  import FullscreenMessage from '../components/FullscreenMessage'
  import store from '../store/index.js';
  import axios from 'axios'
  import Statistics from '../components/Statistics'

  Vue.use(VueCroppie);


  import MainLayout from './MainLayout';
  import CustomButton from './CustomButton';
  import CustomPopup from './CustomPopup';
  import CustomTextInput from './CustomTextInput';
  import CustomCheckboxInput from './CustomCheckboxInput';
  import ImageViewer from './ImageViewer';
  import { ipcRenderer } from 'electron'

  import Services from '../services.js';


  const navigatedCapturesLimit = 30;

  export default {
    name: 'captures-explorer-page',
    components: { Statistics,FullscreenMessage, CustomButton, MainLayout, ImageViewer,CustomTextInput,CustomCheckboxInput, CustomPopup, GlobalEvents},
    data(){
      return {
        lastSavedInfraction:null,
        lastSavedCaptures:null,
        lastCaptureIndex:null,
        verifyingInfractions:false,
        saving:false,
        imageIndex:0,
        currentDayStatistic:false,
        breadcrumb:[],
        loadingImages:false,
        capturePlaceholder:"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAQFBAYFBQYJBgUGCQsIBgYICwwKCgsKCgwQDAwMDAwMEAwODxAPDgwTExQUExMcGxsbHB8fHx8fHx8fHx//2wBDAQcHBw0MDRgQEBgaFREVGh8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx//wgARCAQ4B4ADAREAAhEBAxEB/8QAGwABAQEBAQEBAQAAAAAAAAAAAAYFBAMCAQf/2gAIAQEAAAAA/soAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHPnfgAAP3s7QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPiL8gAAH7YdYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOWN29YAAHFN02sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADljaHbAD48OoOCSptYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHLG0O2APKO8dikHBJU2sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADljaHbAGfJva2HBJU2sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADljaHbAHzKcVBtDgkqbWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAByxtDtg+foAOCSptYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHLG0O2HzI0GgAOCSptYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHLG0O2Ezk+lf0nn4dY4JKm1gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcsbQ7Yx5s6a/wBEty2H2cElTawAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOWNods4pH8GhV4s82KQ4JKm1gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcsbQ7byj/AGlnfhU6bgkqbWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAByxtDt/kpngA9LL24JKm1gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcsbQ7eBhAANCr4ZKm1gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcsbQ7fwAAPrhkqbWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAByxutogAA5cKn1QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfMdzAAAPux6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPjiAAAdXsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oACAECEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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",
        folders:[],
        activeItem:null,
        images:[],
        infraction:{},
        cropperPopupOpened:false,
        params:{},
        openedStatisticsView:false,
        statistics:{},
        isOnline:window.isOnline
      }
    },
    destroyed(){
      ipcRenderer.removeAllListeners('infractionSaved')
    },
    mounted(){

      let self = this;

      ipcRenderer.on('infractionSaved', (event, result) => {
        self.saving = false;
        if(result.error)
        {
          console.log(result)

          self.$toast.open({
              message: result.error.response && result.error.response.status == 400 ? result.error.response.data : `Error al guardar infracción a la patente ${result.infraction.plate}`,
              type: 'error',
          });
        }
        else {

          self.lastSavedCaptures = result.infractionCaptures;
          self.lastSavedInfraction = result.infraction;
        
          self.$toast.open({
              message: `Infracción a la patente ${result.infraction.plate} guardada correctamente`,
              type: 'success',
          });
        }
      });



      let lastBreadcrumb = localStorage.getItem('lastBreadcrumb');
      if(lastBreadcrumb)
      {
        lastBreadcrumb = JSON.parse(lastBreadcrumb);
        self.breadcrumb = lastBreadcrumb;
      }


      let lastFolderLoaded = localStorage.getItem('lastFolderLoaded');
      if(lastFolderLoaded)
      {
        lastFolderLoaded = JSON.parse(lastFolderLoaded);

        self.loadFolder({path:lastFolderLoaded.path},()=>{


          let lastVideoFolderLoaded = localStorage.getItem('lastVideoFolderLoaded');
          if(lastVideoFolderLoaded)
          {
            lastVideoFolderLoaded = JSON.parse(lastVideoFolderLoaded);
            self.loadFolder({path:lastVideoFolderLoaded.path});
          }



        });
      }


    },
    /*
    watch: {
      imageIndex: function (newImageIndex, oldImageIndex) {
        //this.infraction[`capture_2_index`]
        
        if(this.lastCaptureIndex !== null && Math.abs(this.imageIndex - this.lastCaptureIndex) + 1 > navigatedCapturesLimit)
        {
          
          if(confirm("¿Limpiar capturas?"))
          {
            this.infraction = {unreadablePlate:false};
          }
          this.lastCaptureIndex = newImageIndex;
        }

      }
    },*/
    computed:{
      capturesDate(){

        if(this.breadcrumb && this.breadcrumb.length > 0)
        {

          let year = this.breadcrumb[this.breadcrumb.length - 1].path.match(/año-(\d{4})/)
          let month = this.breadcrumb[this.breadcrumb.length - 1].path.match(/mes-(\d{1,2})/)
          let date = this.breadcrumb[this.breadcrumb.length - 1].path.match(/dia-(\d{1,2})/)
          let equipment = this.breadcrumb[this.breadcrumb.length - 1].path.match(/equipo-(\d{1,4})/)

          if(!year || !month || !date || !equipment)
          {
            return false
          }

          return {year:year[1], month:month[1], date:date[1],equipment:equipment[1]}
        }
        return false
      },
      capture_1()
      {
        return this.infraction["capture_1"] ? this.infraction["capture_1"] /*this.images[this.infraction["capture_1"] - 1].path*/ : this.capturePlaceholder;
      },
      capture_2()
      {
        return this.infraction["capture_2"] ? this.images[this.infraction["capture_2"].image - 1].path : this.capturePlaceholder;
      },
      capture_3()
      {
        return this.infraction["capture_3"] ? this.images[this.infraction["capture_3"].image - 1].path : this.capturePlaceholder;
      }
    },
    methods: {
      async undoLastInfraction()
      {
        if(!confirm(`¿Eliminar última infracción subida? (Patente: ${this.lastSavedInfraction.plate})`))
        {
          return;
        }
        
        await Services.API.execute('renombrador/remove-last-infraction','POST');
        ipcRenderer.send('deleteCaptures',{captures:this.lastSavedCaptures});
        this.lastSavedCaptures = null;
        this.lastSavedInfraction = null;
        
      },
      async loadCurrentDayStatistic()
      {
        if(!this.capturesDate)
        {
          return false
        }

        let date = new Date(this.capturesDate.year,this.capturesDate.month - 1,this.capturesDate.date,0,0,0)
        let equipment_number = this.capturesDate.equipment
        let ts = date.getTime()/1000

        let response = await axios.get(ENV.apiUrl+`/datestatistic?timestamp=${ts}&equipment_number=${equipment_number}`,{headers:{'Authorization':`Bearer ${window.localStorage.getItem("token")}` }})

        if(response.data.results.length > 0)
        {
          this.currentDayStatistic = response.data.results[0]
        }
        else
        {
          this.currentDayStatistic = false
        }

      },
      async saveInfraction(){
        let self = this;

        if(!self.infraction.unreadablePlate && !self.infraction.plate.match(/(^\w{3}\d{3}$)|(^\w{2}\d{3}\w{2}$)/) && !confirm("La patente tiene un formato desconocido. ¿Guardar de todas formas?"))
         {
           return ;
         }

         if(!self.infraction.time.match(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/))
         {
             alert("El formato de tiempo debe ser HH:MM:SS");
             return;
         }

        self.saving = true;
        
        ipcRenderer.send('saveInfraction',{isOnline:this.isOnline,infraction:this.infraction,token:window.localStorage.getItem("token")});
        self.infraction = {unreadablePlate:false};
      },
      onKeyPress(e){
        let self = this;
        switch (e.code) {
          case "KeyC":
            if(self.cropperPopupOpened)
            {
              self.cropResult();

            }
            break;
          default:
        }
      },
      cropResult()
      {
        let self = this;
        self.$refs.croppieRef.result({format:'base64'}, (output) => {
          Vue.set(self.infraction,"capture_1",output);
          self.cropperPopupOpened = false;
        });
      },
      cropUpdate(e){

      },
      async onImageCaptured(data)
      {

        if(Math.abs(this.imageIndex - this.lastCaptureIndex) + 1 > navigatedCapturesLimit)
        {
          
          if(confirm("¿Limpiar capturas anteriores?"))
          {
            this.infraction = {unreadablePlate:false};
          }
        }

        if(data.captureNumber == "1")
        {
          this.cropperPopupOpened = true;
          await Vue.nextTick();
          this.$refs.croppieRef.bind({
              url: this.images[data.image - 1].path,
          });
        }
        else
        {
          this.$set(this.infraction,`capture_${data.captureNumber}`,data);
          this.lastCaptureIndex = this.imageIndex;
          //this.$set(this.infraction,`capture_${data.captureNumber}_index`,this.imageIndex);
        }
      },
      async unmarkRainyDay(){
        try {
          if(!this.currentDayStatistic)
          {
            return false
          }
          await axios.delete(ENV.apiUrl+'/datestatistic/'+this.currentDayStatistic.id,{headers:{'Authorization':`Bearer ${window.localStorage.getItem("token")}` }})

          await this.loadCurrentDayStatistic()

        }
        catch (e) {
          alert("Error al desmarcar el día como lluvioso")
        }

      },
      async markRainyDay()
      {
        try {
          if(!this.capturesDate)
          {
            return false
          }

          let date = new Date(this.capturesDate.year,this.capturesDate.month - 1,this.capturesDate.date,0,0,0)
          let ts = date.getTime()/1000

          await axios.post(ENV.apiUrl+'/datestatistic',
                  {
                    timestamp:ts,
                    weather:'RAINY',
                    equipment_number:this.capturesDate['equipment']
                  }
                  ,{headers:{'Authorization':`Bearer ${window.localStorage.getItem("token")}` }})

          await this.loadCurrentDayStatistic()
        }
        catch (e) {
          alert("Error al marcar el día como lluvioso")
        }
      },
      async viewStatistics(){
        let statistics = (await axios.get(ENV.apiUrl+'/infraction/statistics-simple/renombrador',{headers:{'Authorization':`Bearer ${window.localStorage.getItem("token")}` }})).data
        this.statistics = statistics
        this.openedStatisticsView = true

      },
        verifyInfractions()
        {
          if(confirm("¿Verificar que las infracciones se hayan subido correctamente?"))
          {
            let self = this
            self.verifyingInfractions = true
            ipcRenderer.once('infractionsVerified',(event,result)=>{
              self.verifyingInfractions = false
              if(result.success)
              {
                self.$toast.open({
                  message: `Infracciones verificadas correctamente`,
                  type: 'success',
                });
              }
              else
              {
                self.$toast.open({
                  message: `Error al verificar las infracciones. Reintentelo nuevamente`,
                  type: 'error',
                });
              }


            })
            ipcRenderer.send('verifyInfractions',{token:window.localStorage.getItem("token")})
          }

        },
      loadFolder(folderToLoad,callback)
      {

        this.loadCurrentDayStatistic()

        let self = this;
        self.infraction = {unreadablePlate:false};
        //self.loadingImages = true;
        ipcRenderer.once('folderLoaded', (event, result) => {
          if(!folderToLoad)
          {
            self.breadcrumb = [];
          }
          if(result.children.length == 0)
          {
            if(callback)
            {
              callback();
            }
            return;
          }

          if(result.children[0].type == 'folder')
          {

            self.folders = result.children;

            let idx = self.breadcrumb.findIndex((el)=>{
              return el.path == result.parent.path;
            });
            if(idx > -1)
            {
              self.breadcrumb.splice(idx);
            }

            self.breadcrumb.push(result.parent);
            localStorage.setItem('lastFolderLoaded',JSON.stringify(result.parent));
          }
          else
          {
            self.imageIndex = 0;
            localStorage.setItem('lastVideoFolderLoaded',JSON.stringify(result.parent));
            self.images = result.children;
            document.querySelector(".images").focus();
          }
          localStorage.setItem('lastBreadcrumb',JSON.stringify(self.breadcrumb));
          //self.loadingImages = false;
          if(callback)
          {
            callback();
          }


        });
        if(folderToLoad)
        {

          self.activeItem = folderToLoad.path;
          ipcRenderer.send('loadFolder',folderToLoad.path);
        }
        else {

          ipcRenderer.send('loadFolder');
        }

      }
    }
  }
</script>
