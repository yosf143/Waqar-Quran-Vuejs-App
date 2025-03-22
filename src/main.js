 import { createApp } from 'vue'
import App from './App.vue'
import { setupTouchEvents } from './utils/mobileConfig'
 
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/css/main.css'

const app = createApp(App)

setupTouchEvents()


app.mount('#app')