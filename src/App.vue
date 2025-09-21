<script setup lang="ts">
import {SidebarProvider} from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar.vue";
import {useColorMode} from "@vueuse/core";
import {useUserStore} from "@/stores/UserStore";
const mode = useColorMode()
const userStore = useUserStore()

mode.value = "dark"
</script>

<template>
  <div class="minecraft-gradient h-screen">
    <SidebarProvider default-open v-if="userStore.isAuthenticated">
      <DashboardSidebar/>
      <RouterView/>
    </SidebarProvider>
    <RouterView v-else/>
  </div>
</template>

<style scoped>

</style>
