<template>

  <div class="user-bar">
    <div class="user-data">
      <figure>
        <img src="https://www.lagotaquecolma.net/images/autores/default.png">
      </figure>
      <span class="username">@{{$store.state.User.user.username}}</span>
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

  background: #303f9f;
color: white;
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
      console.log(this.$store.state.User)
    },
    methods: {
      logout(){
        Services.API.logout();
      }
    }
  }
</script>
