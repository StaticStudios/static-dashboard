<script setup lang="ts">
import {SidebarProvider} from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar.vue";
import LoginView from "@/views/LoginView.vue";
import {useColorMode} from "@vueuse/core";
import {useAuth} from "@clerk/vue";
import {useUserStore} from "@/stores/UserStore";
import {onUnmounted, watch} from "vue";

const {isSignedIn} = useAuth()
const userStore = useUserStore()

const mode = useColorMode()
mode.value = "dark"

watch(isSignedIn, async (signedIn) => {
  if (signedIn && !userStore.isBackendAuthed && !userStore.isCheckingAuth) {
    const ok = await userStore.checkUser()
    if (ok) {
      userStore.startAuthPolling()
    }
  }
  if (!signedIn) {
    userStore.resetBackendAuth()
  }
}, {immediate: true})

onUnmounted(() => {
  userStore.stopAuthPolling()
})
</script>

<template>
  <div class="minecraft-gradient h-screen">
    <!-- Authenticated and backend-verified -->
    <suspense v-if="isSignedIn && userStore.isBackendAuthed">
      <SidebarProvider default-open>
        <DashboardSidebar/>
        <RouterView/>
      </SidebarProvider>
    </suspense>

    <!-- Not signed in, checking auth, or error — always show login -->
    <LoginView v-else/>
  </div>
</template>

<style scoped>

</style>