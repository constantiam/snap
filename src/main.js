import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
// import 'vue-material/dist/theme/default.css' 
import Cryptoicon from 'vue-cryptoicon';
import icon from 'vue-cryptoicon/src/icons'; // For all icons
import VModal from 'vue-js-modal'
import Jazzicon from 'vue-jazzicon';
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import VueApexCharts from 'vue-apexcharts'
import "typeface-space-mono";

Vue.component('apexchart', VueApexCharts)
Vue.component('VueSlider', VueSlider)
Vue.component('jazzicon', Jazzicon); 


Cryptoicon.add(icon);

Vue.use(VModal)
Vue.use(Cryptoicon);
Vue.use(VueMaterial)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
