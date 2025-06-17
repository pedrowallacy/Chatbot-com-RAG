
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Importe o roteador

import './assets/main.css'; // Ou qualquer que seja seu CSS principal

const app = createApp(App);

app.use(router); // Diga ao Vue para usar o roteador

app.mount('#app');
