import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import './styles/common.scss'
import App from './App.vue'
import router from './router'
import store from './store'
import { createPinia } from 'pinia';

const pinia = createPinia();

createApp(App).use(ElementPlus, { locale: zhCn }).use(store).use(pinia).use(router).mount('#app')