<script setup lang="ts">

import {Button} from "@/components/ui/button";
import {useUserStore} from "@/stores/UserStore.ts";
import {useRouter} from "vue-router";
import {Card, CardContent, CardHeader} from "@/components/ui/card";

const userStore = useUserStore()
const router = useRouter()

function login() {
  userStore.login("Noah", "","test","")
  router.push("/")
}
</script>

<template>
<!--  <Button v-on:click="login">-->
<!--    Login-->
<!--  </Button>-->
  <div class="flex justify-center  p-75">
    <Card class="w-96">
      <CardHeader>
        <div class="flex items-center justify-center">
          <img src="/logo.png" alt="logo" class="h-28 w-28"></img>
        </div>
        <div class="text-5xl font-bold">
          Static Studios
        </div>
        <div class="text-xl font-semibold">
          Admin Dashboard
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-4">
          <Button v-on:click="login">
            Login
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>

</style>