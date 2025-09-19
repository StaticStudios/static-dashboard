import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlayersView from "@/views/PlayersView.vue";
import PunishmentsView from "@/views/PunishmentsView.vue";

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
        }
    ],
})

export default router