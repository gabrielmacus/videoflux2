<template>

  <div class="container">
    <button :class="{loading:loading}" :disabled="disabled" v-on="$listeners" :type="htmlType" >

      <span v-if="!loading"><slot></slot></span>
      <span v-else>Cargando...</span>
    </button>
  </div>

</template>

<style scoped lang="scss">
@import "../assets/theme.scss";
.container
{
  width:100%;
  display: block;
}
button
{
  transition:all 0.2s;
  &:hover
  {
    background:$primary-color-accent;
    color:$primary-accent-contrast;
  }
  &.loading
  {
    pointer-events: none;
    background-color: $primary-color-accent;
    color:$primary-accent-contrast;
  }
  &[disabled]
  {
    opacity: 0.5;
    pointer-events: none;
  }
  height: 100%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  cursor: pointer;
  background: $primary-color;
  font-weight: 600;
  color:$primary-contrast;
  display: block;
  width: 100%;
  border: 0;
  padding: 0.5rem;
}
</style>

<script>

  export default {
    name: 'CustomButton',
    props:['disabled','loading','htmlType'],
    components: {  },
    data(){
      return {
      }
    },
    methods: {

    }
  }
</script>
