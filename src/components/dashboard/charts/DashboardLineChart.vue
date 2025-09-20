<script setup lang="ts">

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {LineChart} from "@/components/ui/chart-line";
import type {FunctionalComponent} from "vue";
import {CurveType} from "@unovis/ts";

defineProps<{
  icon?: FunctionalComponent
  name: string,
  data: any[],
  categories: string[],
  colors: string[]
}>()

</script>

<template>
<Card class="h-75 w-150 bg-card/75">
 <CardHeader>
   <CardTitle class="flex items-center">
     <component v-if="icon" :is="icon" class="h-5 w-5"/>
     <div class="pl-3">
       {{name}}
     </div>
   </CardTitle>
   <CardContent>
     <LineChart class="h-50"
                :data="data"
                :categories="categories"
                index="time"
                :colors="colors"
                :curve-type="CurveType.Step"
                :x-formatter="(tick)=> {
                 return String(tick).padStart(2, '0') + ':00'
               }"
     />
   </CardContent>
 </CardHeader>
</Card>
</template>

<style scoped>
</style>