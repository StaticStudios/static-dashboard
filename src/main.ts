import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "@/router";
import {createPinia} from "pinia";
import {clerkPlugin} from "@clerk/vue"
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import {shadcn} from "@clerk/themes";
import axios from 'axios';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
}

axios.defaults.baseURL = import.meta.env.BACKEND_URL;

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App)
    .use(clerkPlugin, {
        publishableKey: PUBLISHABLE_KEY,
        appearance: shadcn,
        clerkJSUrl: 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js'
    })
    .use(router)
    .use(pinia)
    .mount('#app')
