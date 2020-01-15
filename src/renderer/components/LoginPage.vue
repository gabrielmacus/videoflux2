<template>

  <div class="background">
    <form class="login-container" @submit.prevent="login">
      <CustomTextInput v-model="user.username">Nombre de usuario</CustomTextInput>
      <CustomTextInput type="password" v-model="user.password">Contraseña</CustomTextInput>
      <CustomButton >Ingresar</CustomButton>

    </form>
  </div>

</template>

<style scoped lang="scss">
  @import "../assets/theme.scss";
  .background
  {
    width: 100%;
    height: 100%;
    background: url("https://www.elsetge.cat/myimg/f/73-737996_water-mountain-lake-reflection-nature-landscape-backgrounds-nature.jpg");
    display: flex;
    align-items: center;
    position: relative;

    &:after
    {
      background: rgba(0,0,0,0.5);
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

    }
  }
  .login-container
  {
    z-index: 1;
    max-width: 400px;
    width: 90%;
    margin: auto;
    padding: 1.5rem;
    display: grid;
    grid-gap: 1rem;
    background: #e0e0e0;
    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
  }
</style>

<script>
  import Vue from 'vue';
  import VueCroppie from 'vue-croppie';
  import 'croppie/croppie.css' // import the croppie css manually
  import Services from '../services.js';
  Vue.use(VueCroppie);


  import MainLayout from './MainLayout';
  import CustomButton from './CustomButton';
  import CustomPopup from './CustomPopup';
  import CustomTextInput from './CustomTextInput';
  import ImageViewer from './ImageViewer';
  import { ipcRenderer } from 'electron'




  export default {
    name: 'login-page',
    components: { CustomButton, MainLayout, ImageViewer,CustomTextInput, CustomPopup, },
    data(){
      return {
        user:{}
      }
    },
    mounted(){

    },
    computed:{

    },
    methods: {
      async login(){

        try {
          await Services.API.login(this.user);
          this.$router.push("/");

        } catch (e) {

          alert(e.response.data);
        } finally {

        }
      }
    }
  }
</script>
