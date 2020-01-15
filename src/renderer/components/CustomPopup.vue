<template>

  <transition name="fade">
    <div class="popup" v-if="popupOpened">
      <div class="container">
        <header>
          <span @click="closePopup" class="close">x</span>
        </header>
        <div class="content">
          <slot></slot>
        </div>
      </div>
    </div>
</transition>

</template>

<style scoped lang="scss">
@import "../assets/theme.scss";


.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

header
{
  background: black;
  color: white;
  padding: 0.5rem;
  text-align: right;
  padding-right: 1rem;
}
.close
{
  cursor: pointer;
}
.popup
{
  position: fixed;
  z-index: 2;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
  background: rgba(0,0,0,0.75);
}
.container
{
    min-width: 30%;
    max-width: 70%;
    max-height: 70%;

}
.content
{
  overflow: hidden;
  background: white;
  width: auto;
  padding: 1rem;
}
</style>

<script>
  export default {
    name: 'CustomPopup',
    props:['opened'],
    components: { },
    data(){
      return {
      }
    },
    mounted(){

    },
    computed:{
      popupOpened: {
        get: function() {
            return this.opened
        },
        set: function(value) {
            this.$emit('update:opened', value)
        }
      }
    },
    methods: {
      closePopup(){
        this.popupOpened =  false;
      }
    }
  }
</script>
