<template>
    <div v-if="message" class="fullscreen-message-container">
        <p class="message">{{message}}</p>
    </div>
</template>


<script>



  export default {
    name: 'FullscreenMessage',
    props:['message'],
    mounted(){
    }
  }
</script>

<style lang="scss" scoped>

.fullscreen-message-container
{
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.85);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

</style>
