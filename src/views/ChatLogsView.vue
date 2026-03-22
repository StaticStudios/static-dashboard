<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue"
import axios from "axios"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import ChatLogEntryComponent from "@/components/chatlog/ChatLogEntry.vue"
import {useUserStore} from "@/stores/UserStore.ts"
import {Client} from "@stomp/stompjs"

const page = ref(0)
const size = 10
const chatLogs = ref<any[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const hasMore = ref(true)
const userStore = useUserStore()
let stompClient: Client | null = null

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
    const content = response.data.content.map((entry: any) => {
      if (entry.recipientName) {
        return {...entry, type: "private_message"}
      } else {
        return {...entry, type: "chat_message"}
      }
    })
    console.log(content)
    chatLogs.value = content.reverse()
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
    const content = response.data.content.map((entry: any) => {
      if (entry.recipientName) {
        return {...entry, type: "private_message"}
      }
      return entry
    })
    chatLogs.value = [...content.reverse(), ...chatLogs.value]
    hasMore.value = response.data.last === false
    page.value++
  } catch (err: any) {
    error.value = err.message || "Failed to load more chat logs"
    console.error("Error loading more chat logs:", err)
  } finally {
    loadingMore.value = false
  }
}

async function connectWebSocket() {
  const token = await userStore.getAuthToken()

  stompClient = new Client({
    brokerURL: "ws://localhost:8080/ws",
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    onConnect: () => {
      console.log("WebSocket connected")
      stompClient?.subscribe("/topic/chat", (message) => {
        const chatLog = JSON.parse(message.body)
        const entry = chatLog.recipientName ? {...chatLog, type: "private_message"} : chatLog
        chatLogs.value.push(entry)
      })
    },
    onStompError: (frame) => {
      console.error("STOMP error:", frame)
    }
  })

  stompClient.activate()
}

onMounted(() => {
  fetchChatLogs()
  connectWebSocket()
})

onUnmounted(() => {
  if (stompClient) {
    stompClient.deactivate()
  }
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

    <div v-else class="flex flex-col h-[calc(100vh-12rem)]">
      <div v-if="hasMore" class="flex justify-center pb-4">
        <Button @click="loadMore" :disabled="loadingMore" variant="secondary">
          {{ loadingMore ? "Loading..." : "Load More" }}
        </Button>
      </div>

      <div class="border rounded-lg divide-y divide-border overflow-y-auto bg-card flex-1">
        <ChatLogEntryComponent
            v-for="entry in chatLogs"
            :key="entry.id"
            :entry="entry"
        />
      </div>
    </div>
  </div>
</template>

