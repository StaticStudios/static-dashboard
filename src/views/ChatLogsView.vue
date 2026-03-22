<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from "vue"
import axios from "axios"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Skeleton} from "@/components/ui/skeleton"
import ChatLogEntryComponent from "@/components/chatlog/ChatLogEntry.vue"
import {useUserStore} from "@/stores/UserStore.ts"
import {Client} from "@stomp/stompjs"
import {X} from "lucide-vue-next"
import {API_BASE_URL, WS_BASE_URL} from "@/config/api"

const page = ref(0)
const size = 50
const chatLogs = ref<any[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const hasMore = ref(true)
const userStore = useUserStore()
let stompClient: Client | null = null

const userFilter = ref<string[]>([])
const userInput = ref("")
const serverGroupFilter = ref<string[]>([])
const serverGroupInput = ref("")

const filteredChatLogs = computed(() => {
  let filtered = chatLogs.value

  if (userFilter.value.length > 0) {
    filtered = filtered.filter(entry => userFilter.value.includes(entry.senderName))
  }

  if (serverGroupFilter.value.length > 0) {
    filtered = filtered.filter(entry =>
      entry.type === "chat_message" && serverGroupFilter.value.includes(entry.serverGroup)
    )
  }

  return filtered
})

function addUserFilter() {
  const name = userInput.value.trim()
  if (name && !userFilter.value.includes(name)) {
    userFilter.value.push(name)
    userInput.value = ""
  }
}

function removeUserFilter(name: string) {
  userFilter.value = userFilter.value.filter(n => n !== name)
}

function addServerGroupFilter() {
  const name = serverGroupInput.value.trim()
  if (name && !serverGroupFilter.value.includes(name)) {
    serverGroupFilter.value.push(name)
    serverGroupInput.value = ""
  }
}

function removeServerGroupFilter(name: string) {
  serverGroupFilter.value = serverGroupFilter.value.filter(n => n !== name)
}

function handleUserKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    addUserFilter()
  }
}

function handleServerGroupKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    addServerGroupFilter()
  }
}

async function fetchChatLogs() {
  loading.value = true
  error.value = null
  let headers = {
    "Authorization": `Bearer ${await userStore.getAuthToken()}`
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/internal/chatlogs`, {
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
    const response = await axios.get(`${API_BASE_URL}/api/v1/internal/chatlogs`, {
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
    brokerURL: `${WS_BASE_URL}/ws`,
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
  <div class="px-4 pt-5 sm:px-10 w-full max-w-7xl">
    <div class="flex items-center gap-3 mb-6">
      <div class="text-3xl sm:text-4xl font-semibold">Chat Logs</div>
    </div>

    <div class="flex gap-4">
      <!-- Filters Sidebar -->
      <div class="w-64 shrink-0">
        <div class="border rounded-lg p-4 bg-muted/50 space-y-4 h-[calc(100vh-12rem)]">
          <div class="text-lg font-semibold">Filters</div>

          <!-- Users Filter -->
          <div class="border rounded-lg p-3 bg-card">
            <div class="space-y-2">
              <label class="text-sm font-medium">Users</label>
              <div class="flex gap-2">
                <Input
                  v-model="userInput"
                  placeholder="Add user..."
                  @keydown="handleUserKeydown"
                  class="text-sm"
                />
                <Button @click="addUserFilter" variant="secondary" size="sm">Add</Button>
              </div>
              <div v-if="userFilter.length" class="flex flex-wrap gap-1.5 pt-1">
                <span
                  v-for="name in userFilter"
                  :key="name"
                  class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                >
                  {{ name }}
                  <button
                    class="hover:text-destructive-foreground transition-colors"
                    @click="removeUserFilter(name)"
                  >
                    <X class="size-3"/>
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Server Group Filter -->
          <div class="border rounded-lg p-3 bg-card">
            <div class="space-y-2">
              <label class="text-sm font-medium">Server Groups</label>
              <div class="flex gap-2">
                <Input
                  v-model="serverGroupInput"
                  placeholder="Add server group..."
                  @keydown="handleServerGroupKeydown"
                  class="text-sm"
                />
                <Button @click="addServerGroupFilter" variant="secondary" size="sm">Add</Button>
              </div>
              <div v-if="serverGroupFilter.length" class="flex flex-wrap gap-1.5 pt-1">
                <span
                  v-for="name in serverGroupFilter"
                  :key="name"
                  class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                >
                  {{ name }}
                  <button
                    class="hover:text-destructive-foreground transition-colors"
                    @click="removeServerGroupFilter(name)"
                  >
                    <X class="size-3"/>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Logs -->
      <div class="flex-1 min-w-0">
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

          <div class="border rounded-lg divide-y divide-border overflow-y-auto bg-card flex-1 custom-scrollbar">
            <ChatLogEntryComponent
                v-for="entry in filteredChatLogs"
                :key="entry.id"
                :entry="entry"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

