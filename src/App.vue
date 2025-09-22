<script setup lang="ts">
import {SidebarProvider} from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar.vue";
import {useColorMode} from "@vueuse/core";
import {useAuth} from "@clerk/vue";

const {isSignedIn} = useAuth()

const mode = useColorMode()
mode.value = "dark"
</script>

<template>
  <div class="minecraft-gradient h-screen">
    <SidebarProvider default-open v-if="isSignedIn">
      <DashboardSidebar/>
      <RouterView/>
    </SidebarProvider>
    <RouterView v-else/>
  </div>
</template>

<style scoped>

</style>
