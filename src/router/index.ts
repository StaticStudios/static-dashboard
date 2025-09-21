import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlayersView from "@/views/PlayersView.vue";
import PunishmentsView from "@/views/PunishmentsView.vue";
import {useUserStore} from '@/stores/UserStore';

import LoginView from "@/views/LoginView.vue";


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: HomeView,
        },
        {
            path: '/players',
            name: 'Players',
            component: PlayersView
        },
        {
            path: '/punishments',
            name: 'Punishments',
            component: PunishmentsView
        },
        {
            path: '/login',
            name: 'Login',
            component: LoginView
        }
    ],
})

router.beforeEach((to, _, next) => {
    const userStore = useUserStore()
    if (!userStore.isAuthenticated() && to.name !== 'Login') {
        next({name: 'Login'})
    } else if (userStore.isAuthenticated() && to.name === 'Login') {
        next({name: 'Home'})
    } else {
        next()
    }
})

export default router