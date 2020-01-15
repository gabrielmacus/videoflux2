import Vue from 'vue'
import Router from 'vue-router'
import Services from '../services.js';


Vue.use(Router)

window.router = new Router({
  routes: [
    {
      path: '/login',
      name: 'login-page',
      component: require('@/components/LoginPage').default,
      meta:{
        guest:true
      }
    },
    {
      path: '/',
      name: 'captures-explorer-page',
      component: require('@/components/CapturesExplorerPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
});

router.beforeEach(async (to, from, next) => {

    if(!isOnline && to.name == "login-page")
    {
      return next("/");
    }
    if(!isOnline || to.meta.guest || await Services.API.refreshToken())
    {
      return next();
    }


    return next("/login");

  /*
    if(to.matched.some(record => record.meta.requiresAuth)) {
        if (localStorage.getItem('jwt') == null) {
            next({
                path: '/login',
                params: { nextUrl: to.fullPath }
            })
        } else {
            let user = JSON.parse(localStorage.getItem('user'))
            if(to.matched.some(record => record.meta.is_admin)) {
                if(user.is_admin == 1){
                    next()
                }
                else{
                    next({ name: 'userboard'})
                }
            }else {
                next()
            }
        }
    } else if(to.matched.some(record => record.meta.guest)) {
        if(localStorage.getItem('jwt') == null){
            next()
        }
        else{
            next({ name: 'userboard'})
        }
    }else {
        next()
    }*/
})

export default router;
