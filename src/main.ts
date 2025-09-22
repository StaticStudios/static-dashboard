import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "@/router";
import {createPinia} from "pinia";
import {clerkPlugin} from "@clerk/vue"
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import {shadcn} from "@clerk/themes";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App)
    .use(clerkPlugin, {
        publishableKey: PUBLISHABLE_KEY,
        appearance: shadcn
    })
    .use(router)
    .use(pinia)
    .mount('#app')
