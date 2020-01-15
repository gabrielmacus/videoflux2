
//import isOnline  from 'is-online';
//window.isOnline =  await isOnline();
window.isOnline = navigator.onLine;
alert("DEMO UPDATE");

import Vue from 'vue'
import axios from 'axios'

const VueInputMask = require('vue-inputmask').default
Vue.use(VueInputMask)

import App from './App'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

const appVersion = require('../../package.json').version;
document.title = `${document.title} - ${appVersion}`;

