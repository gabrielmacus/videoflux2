<template>


  <div class="container" slot="content">
    <slot ></slot>
    <input  type="checkbox"  @change="change"  :checked="value"   :class="`style-${styleType}`" >
  <!--v-mask="{'alias': 'datetime','inputFormat':'HH:MM:ss'}"
  -->
  </div>


</template>

<style scoped lang="scss">
@import "../assets/theme.scss";
.container
{
  width: 100%;
  display: flex;
align-items: center;
}
.style-2
{
  background: white;
  border: none;
  padding-left: 0.5rem;
}
input{
  width: auto;
margin-left: 0.5rem;
    border-bottom: 2px solid $primary-color;

}

</style>

<script>

  import InputLayout from './InputLayout.vue';

  export default {
    directives: {},
    name: 'CustomTextInput',
    props:['styleType','value'],
    components: {InputLayout},
    directives:{},
    data(){
      return {
        checked: this.value
      }
    },
    methods: {
      change(event){
        this.$emit('input', !this.value);
      }
    }
  }
</script>
