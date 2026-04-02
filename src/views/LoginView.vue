<script setup lang="ts">
import {SignIn, useAuth} from "@clerk/vue";
import {useUserStore} from "@/stores/UserStore";
import {LoaderCircle} from "lucide-vue-next";

const {isSignedIn} = useAuth()
const userStore = useUserStore()
</script>

<template>
  <div class="flex flex-col justify-center items-center h-screen gap-6">
    <!-- Checking backend auth: spinner only, no Clerk form (user is signed in) -->
    <template v-if="userStore.isCheckingAuth">
      <LoaderCircle class="h-10 w-10 animate-spin text-gray-400"/>
      <span class="text-gray-400">Verifying access...</span>
    </template>

    <!-- Not signed in or error: show Clerk form -->
    <template v-else>
      <div v-if="userStore.authCheckError"
           class="bg-red-950/50 border border-red-500/50 rounded-lg px-6 py-3 text-center max-w-md">
        <p class="text-red-400 font-semibold">{{ userStore.authCheckError }}</p>
      </div>
      <SignIn v-if="!isSignedIn"/>
    </template>
  </div>
</template>

<style scoped>

</style>