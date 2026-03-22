<script setup lang="ts">
import {onMounted, ref} from "vue"
import axios from "axios"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import ChatLogEntryComponent from "@/components/chatlog/ChatLogEntry.vue"
import {useUserStore} from "@/stores/UserStore.ts";

const page = ref(0)
const size = 10
const chatLogs = ref<any[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const hasMore = ref(true)
const userStore = useUserStore()

async function fetchChatLogs() {
  loading.value = true
  error.value = null
  let headers = {
    "Authorization": `Bearer ${await userStore.getAuthToken()}`
  }

  try {
    const response = await axios.get(`http://localhost:8080/api/v1/internal/chatlogs`, {
      params: {
        page: page.value,
        limit: size
      },
      headers
    })
    chatLogs.value = response.data.content.reverse()
    hasMore.value = response.data.last === false
  } catch (err: any) {
    error.value = err.message || "Failed to fetch chat logs"
    console.error("Error fetching chat logs:", err)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  loadingMore.value = true
  error.value = null
  let headers = {
    "Authorization": `Bearer ${await userStore.getAuthToken()}`
  }

  try {
    const response = await axios.get(`http://localhost:8080/api/v1/internal/chatlogs`, {
      params: {
        page: page.value + 1,
        limit: size
      },
      headers
    })
    chatLogs.value = [...response.data.content.reverse(), ...chatLogs.value]
    hasMore.value = response.data.last === false
    page.value++
  } catch (err: any) {
    error.value = err.message || "Failed to load more chat logs"
    console.error("Error loading more chat logs:", err)
  } finally {
    loadingMore.value = false
  }
}

onMounted(() => {
  fetchChatLogs()
})
</script>

<template>
  <div class="px-4 pt-5 sm:px-10 w-full max-w-5xl">
    <div class="flex items-center gap-3">
      <div class="text-3xl sm:text-4xl font-semibold">Chat Logs</div>
    </div>

    <div class="pt-6"/>

    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="i in 12" :key="i" class="h-8 w-full"/>
    </div>

    <div v-else-if="error" class="text-destructive-foreground text-sm">
      {{ error }}
    </div>

    <div v-else-if="chatLogs.length === 0" class="text-muted-foreground text-sm">
      No chat logs found.
    </div>

    <div v-else>
      <div v-if="hasMore" class="flex justify-center pb-4">
        <Button @click="loadMore" :disabled="loadingMore" variant="secondary">
          {{ loadingMore ? "Loading..." : "Load More" }}
        </Button>
      </div>

      <div class="border rounded-lg divide-y divide-border overflow-hidden bg-card">
        <ChatLogEntryComponent
            v-for="entry in chatLogs"
            :key="entry.id"
            :entry="entry"
        />
      </div>
    </div>
  </div>
</template>

