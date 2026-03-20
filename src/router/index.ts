import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlayersView from "@/views/PlayersView.vue";
import PunishmentsView from "@/views/PunishmentsView.vue";
import LoginView from "@/views/LoginView.vue";
import ChatLogsView from "@/views/ChatLogsView.vue";
import ChatLogMessagesView from "@/views/ChatLogMessagesView.vue";
import {useAuth} from "@clerk/vue";
import {waitForClerkJsLoaded} from "@/lib/utils"

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
            path: '/chatlogs',
            name: 'ChatLogs',
            component: ChatLogsView
        },
        {
            path: '/chatlogs/view',
            name: 'ChatLogMessages',
            component: ChatLogMessagesView
        },
        {
            path: '/login',
            name: 'Login',
            component: LoginView,
            meta: {
                public: true
            }
        }
    ],
})

router.beforeEach(async (to, _, next) => {
    const { isSignedIn, isLoaded } = useAuth();

    if (!isLoaded.value) {
        await waitForClerkJsLoaded();
    }

    if (!to.meta.public && !isSignedIn.value) {
        return next({ path: '/login' })
    }

    if (to.path === '/login' && isSignedIn.value) {
        return next({ path: '/' })
    }

    next()
})


export default router