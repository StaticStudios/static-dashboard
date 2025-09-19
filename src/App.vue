<script setup lang="ts">
import {SidebarProvider} from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar.vue";
import {useColorMode} from "@vueuse/core";

const mode = useColorMode()

mode.value = "dark"
</script>

<template>
  <div class="minecraft-gradient">
    <SidebarProvider default-open>
      <DashboardSidebar/>
      <RouterView/>
    </SidebarProvider>
  </div>
</template>

<style scoped>

</style>
