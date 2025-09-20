<script setup lang="ts">
import DashboardLineChart from "@/components/dashboard/charts/DashboardLineChart.vue";
import {ChartLine} from "lucide-vue-next";

const data = [
  {
    "time": new Date('2025-09-20T00:00:00.000Z'),
    "prison": 100,
    "skyblock": 10,
  },
  {
    "time": new Date('2025-09-20T01:00:00.000Z'),
    "prison": 90,
    "skyblock": 20,
  },
  {
    "time": new Date('2025-09-20T02:00:00.000Z'),
    "prison": 101,
    "skyblock": 15,
  },
  {
    "time": new Date('2025-09-20T03:00:00.000Z'),
    "prison": 89,
    "skyblock": 20,
  },
  {
    "time": new Date('2025-09-20T04:00:00.000Z'),
    "prison": 80,
    "skyblock": 30,
  },
  {
    "time": new Date('2025-09-20T05:00:00.000Z'),
    "prison": 85,
    "skyblock": 34,
  }
]

</script>

<template>
  <DashboardLineChart :icon="ChartLine" name="Player Activity 24h" :data="data" :colors="['var(--prison)', 'var(--skyblock)']"/>
</template>

<style scoped>
</style>