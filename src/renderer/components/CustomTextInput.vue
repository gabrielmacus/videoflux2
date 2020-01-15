<template>

  <InputLayout>
    <slot></slot>
    <div class="container" slot="content">

      <input :tabindex="tabindex" :disabled="disabled"  :type="type"   @input="input" :value="value"   v-mask="mask"    :placeholder="placeholder" :class="`style-${styleType}`" >
<!--v-mask="{'alias': 'datetime','inputFormat':'HH:MM:ss'}"
-->
    </div>
  </InputLayout>


</template>

<style scoped lang="scss">
@import "../assets/theme.scss";
.container
{
  width: 100%;
}
.style-2
{
  background: white;
  border: none;
  padding-left: 0.5rem;
}
input{
  &[disabled]
  {
    opacity: 0.5;
  }
  transition:all 0.2s;
  width: 100%;
  outline: 0;
  border: 0;
  padding: 0.5rem;
  margin: 0;
  display: block;

  border-bottom: 2px solid $primary-color-accent;
  background: none;
  padding-left: 0;
}

</style>

<script>

  import InputLayout from './InputLayout.vue';

  export default {
    directives: {},
    name: 'CustomTextInput',
    props:['tabindex','disabled','mask','type','placeholder','styleType','value'],
    components: {InputLayout},
    directives:{},
    data(){
      return {
      }
    },
    methods: {
      input(event){
        this.$emit('input',event.target.value)
      }
    }
  }
</script>
