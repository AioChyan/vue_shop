import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入全局css
import './assets/css/global.css'
//导入axios
import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL = 'https://lianghj.top:12969/api/private/v1/';
axios.interceptors.request.use( config => {
  console.log(config)
  config.headers.Authorization= window.sessionStorage.getItem('token')
  return config;
})
Vue.prototype.$http=axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
