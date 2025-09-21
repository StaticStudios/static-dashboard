<script setup lang="ts">

import {Button} from "@/components/ui/button";
import {useUserStore} from "@/stores/UserStore.ts";
import {useRouter} from "vue-router";

const userStore = useUserStore()
const router = useRouter()

function login() {
  userStore.login("Noah", "","test","")
  router.push("/")
}
</script>

<template>
  <Button v-on:click="login">
    Login
  </Button>
</template>

<style scoped>

</style>