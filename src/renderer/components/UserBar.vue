<template>

  <div class="user-bar">
    <div class="user-data">
      <figure>
        <img src="https://www.tocdoc.com/sites/default/files/default_images/default-medium.png">
      </figure>
      <span v-if="$store.state.User.user.id" class="username">@{{$store.state.User.user.username}}</span>
      <span class="username">Sesión offline</span>

      <div class="actions">
        <span @click="logout" class="action logout">Salir</span>
      </div>
    </div>
  </div>

</template>

<style scoped lang="scss">
@import "../assets/theme.scss";
.actions
{
  .action
  {
    font-size: 0.9rem;
    text-decoration: underline;
    cursor: POINTER;
  }
}
figure
{
  margin: 0;
  padding: 0;
  width: 35px;
  margin-right: 0.5rem;
}
img
{
  width: 100%;
display: block;
border-radius: 50%;
}
.user-data
{
  display: flex;
align-items: center;
}
.username
{
  margin-right: 1rem;
  font-weight: 600;
}
.user-bar
{

  background: $secondary-color;
color: $secondary-contrast;
display: flex;
align-items: center;
padding: 0.75rem;
}
</style>

<script>
  import Services from '../services.js';
  
  export default {
    name: 'UserBar',
    components: {  },
    data(){
      return {
      }
    },
    mounted(){
    },
    methods: {
      logout(){
        Services.API.logout();
      }
    }
  }
</script>
