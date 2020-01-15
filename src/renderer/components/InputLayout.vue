<template>

  <div class="container">
    <label><slot></slot></label>
    <slot name="content"></slot>

  </div>

</template>

<style scoped lang="scss">
@import "../assets/theme.scss";
label
{
  color:$primary-color;
}
</style>

<script>

  export default {
    name: 'InputLayout',
    components: {  },
    data(){
      return {
      }
    },
    methods: {

    }
  }
</script>
