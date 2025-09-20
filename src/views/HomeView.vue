<script setup lang="ts">
import PlayerCountChart from "@/components/dashboard/charts/PlayerCountChart.vue";
import PlayerCountOverview from "@/components/dashboard/PlayerCountOverview.vue";
</script>

<template>
  <div class="pl-10 pt-5">
    <div class="text-4xl">
      Network Overview
    </div>
    <div class="pt-15"/>
    <PlayerCountOverview/>
    <div class="pt-10"/>
    <PlayerCountChart/>

  </div>
</template>

<style scoped>

</style>