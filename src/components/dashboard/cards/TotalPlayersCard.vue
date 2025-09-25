<script setup lang="ts">

import DashboardCard from "@/components/dashboard/cards/DashboardCard.vue";
import {User} from "lucide-vue-next";
import axios from "axios";
import {ref} from "vue";
import {useUserStore} from "@/stores/UserStore.ts";

const playerCount = ref(0)
const userStore = useUserStore()

const headers = {
  "Authorization": `Bearer ${await userStore.getAuthToken()}`
}

axios.get("http://localhost:8080/api/v1/internal/dashboard/player_count", {
  headers: headers
})
    .then(response => {
      playerCount.value = response.data.count;
    })
    .catch(error => console.error("Error fetching player count:", error));

</script>

<template>
  <DashboardCard title="Total Players" :icon="User" :value="String(playerCount)" value-description="Online"/>
</template>

<style scoped>

</style>