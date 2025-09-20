<script setup lang="ts">

import DashboardCard from "@/components/dashboard/cards/DashboardCard.vue";
import {User} from "lucide-vue-next";
</script>

<template>
  <DashboardCard title="Total Players" :icon="User" value="10" value-description="Online"/>
</template>

<style scoped>

</style>