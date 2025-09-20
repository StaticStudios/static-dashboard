<script setup lang="ts">

import {Card, CardContent, CardDescription, CardTitle} from "@/components/ui/card";
import type {FunctionalComponent} from "vue";

defineProps<{
  icon?: FunctionalComponent
  title?: string,
  description?: string,
  value: string,
  valueDescription?: string,
  valueColor?: string,
}>()

</script>

<template>
  <Card class="w-100 bg-card/75">
    <div class="pl-5">
      <div class="flex items-center gap-2 pl-5">
        <component v-if="icon" :is="icon" class="h-5 w-5 text-white/50"/>
        <CardTitle v-if="title" class="text-lg font-semibold text-white/50">
          {{ title }}
        </CardTitle>
      </div>
        <CardDescription v-if="description" class="text-sm">
          {{description}}
        </CardDescription>
      <div class="pt-6">
        <CardContent :class="valueColor" class="text-2xl font-bold">
          {{value}}
          <div v-if="valueDescription" class="text-xs text-white/50 ">
            {{valueDescription}}
          </div>
        </CardContent>
      </div>
    </div>
  </Card>
</template>

<style scoped>

</style>