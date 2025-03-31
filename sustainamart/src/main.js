import { createApp, provide, h } from 'vue';
import App from './App.vue';
import router from './router';
import { DefaultApolloClient } from '@vue/apollo-composable';
import apolloClient from './apollo-client';

// Create the Vue application
const app = createApp(App);

// Provide Apollo client to all components
app.provide(DefaultApolloClient, apolloClient);

// Use the router
app.use(router);

// Mount the app to the DOM
app.mount('#app');
