import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';
import {i18nPlugin} from './i18n';
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(i18nPlugin);
app.use(router);
app.mount('#app');
