<script setup lang="ts">

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import {Home, Scale, User} from "lucide-vue-next";
import {useRoute} from "vue-router";

const items = [
  {
    title: 'Home',
    url: '/',
    icon: Home
  },
  {
    title: 'Players',
    url: '/players',
    icon: User
  },
  {
    title: 'Punishments',
    url: '/punishments',
    icon: Scale
  }
]

const route = useRoute()

</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <div class="flex items-center gap-2">
        <img src="/logo.png" alt="logo" class="h-14 w-14">
        <div>
          <div class="text-xl">StaticStudios</div>
          <div class="text-[0.75rem]">Admin Dashboard</div>
        </div>
      </div>

    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton as-child :is-active="route.name === item.title">
                <RouterLink :to="item.url">
                  <component :is="item.icon"/>
                  <span>{{ item.title }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>

<style scoped>

</style>