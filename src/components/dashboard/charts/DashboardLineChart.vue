<script setup lang="ts">

import {CurveType} from "@unovis/ts";
import {LineChart} from "@/components/ui/chart-line";
import type {FunctionalComponent} from "vue";

defineProps<{
  icon?: FunctionalComponent
  name: string,
  data: any[],
  colors: string[]
}>()
</script>

<template>
  <div class="bg-background/75 h-70 w-150 rounded-2xl">
    <div class="pl-4">
      <div class="flex  items-center h-10">
        <component v-if="icon" :is="icon" class="h-5 w-5"/>
        <div class="text-l font-semibold pl-4">
          {{ name }}
        </div>
      </div>
      <LineChart class="h-50"
                 :data="data"
                 :categories="['prison', 'skyblock']"
                 index="time"
                 :colors="colors"
                 :curve-type="CurveType.Step"
                 :x-formatter="(tick)=> {
                 return String(tick).padStart(2, '0') + ':00'
               }"
      />
    </div>
    </div>

</template>

<style scoped>

</style>