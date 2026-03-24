<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue"
import axios from "axios"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import ChatLogEntryComponent from "@/components/chatlog/ChatLogEntry.vue"
import {useUserStore} from "@/stores/UserStore.ts"
import {Client} from "@stomp/stompjs"
import {ArrowDown, X} from "lucide-vue-next"
import {API_BASE_URL, WS_BASE_URL} from "@/config/api"
import Combobox from "@/components/custom/combobox/combobox.vue";

const page = ref(0)
const size = 50
const chatLogs = ref<any[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const hasMore = ref(true)
const userStore = useUserStore()
let stompClient: Client | null = null
let tokenRefreshInterval: number | null = null
let chatSubscription: any = null

const chatContainer = ref<HTMLElement | null>(null)
const autoScroll = ref(true)
const showScrollButton = ref(false)

const userFilter = ref<string[]>([])
const serverGroupFilter = ref<string[]>([])
const typeFilter = ref<string[]>([])

// Compute available options for autocomplete
const availableUsers = computed(() => {
  const users = new Set<string>()
  chatLogs.value.forEach(entry => {
    if (entry.senderName) {
      users.add(entry.senderName)
    }
  })
  return Array.from(users).sort()
})

const availableServerGroups = computed(() => {
  const groups = new Set<string>()
  chatLogs.value.forEach(entry => {
    if (entry.type === "chat_message" && entry.serverGroup) {
      groups.add(entry.serverGroup)
    }
  })
  return Array.from(groups).sort()
})

const availableTypes = computed(() => {
  const types = new Set<string>()
  chatLogs.value.forEach(entry => {
    if (entry.type) {
      types.add(entry.type)
    }
  })
  return Array.from(types).sort()
})

const filteredChatLogs = computed(() => {
  let filtered = chatLogs.value

  if (userFilter.value.length > 0) {
    filtered = filtered.filter(entry => {
      const lowerFilters = userFilter.value.map(f => f.toLowerCase())
      return lowerFilters.includes(entry.senderName?.toLowerCase())
    })
  }

  if (serverGroupFilter.value.length > 0) {
    filtered = filtered.filter(entry => {
      if (entry.type !== "chat_message") return false
      const lowerFilters = serverGroupFilter.value.map(f => f.toLowerCase())
      return lowerFilters.includes(entry.serverGroup?.toLowerCase())
    })
  }

  if (typeFilter.value.length > 0) {
    filtered = filtered.filter(entry => {
      const lowerFilters = typeFilter.value.map(f => f.toLowerCase())
      return lowerFilters.includes(entry.type?.toLowerCase())
    })
  }

  return filtered
})

function addUserFilter(name: string) {
  if (name) {
    // Check for case-insensitive duplicates
    const lowerName = name.toLowerCase()
    const hasDuplicate = userFilter.value.some(f => f.toLowerCase() === lowerName)
    if (!hasDuplicate) {
      userFilter.value.push(name)
    }
  }
}

function removeUserFilter(name: string) {
  userFilter.value = userFilter.value.filter(n => n !== name)
}

function addServerGroupFilter(name: string) {
  if (name) {
    // Check for case-insensitive duplicates
    const lowerName = name.toLowerCase()
    const hasDuplicate = serverGroupFilter.value.some(f => f.toLowerCase() === lowerName)
    if (!hasDuplicate) {
      serverGroupFilter.value.push(name)
    }
  }
}

function removeServerGroupFilter(name: string) {
  serverGroupFilter.value = serverGroupFilter.value.filter(n => n !== name)
}

function addTypeFilter(name: string) {
  if (name) {
    // Check for case-insensitive duplicates
    const lowerName = name.toLowerCase()
    const hasDuplicate = typeFilter.value.some(f => f.toLowerCase() === lowerName)
    if (!hasDuplicate) {
      typeFilter.value.push(name)
    }
  }
}

function removeTypeFilter(name: string) {
  typeFilter.value = typeFilter.value.filter(n => n !== name)
}

async function fetchChatLogs() {
  loading.value = true
  error.value = null
  let headers = {
    "Authorization": `Bearer ${await userStore.getAuthToken()}`
  }

  try {
    const [chatResponse, privateResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/v1/internal/chatlogs/chat`, {
        params: {
          page: page.value,
          limit: size
        },
        headers
      }),
      axios.get(`${API_BASE_URL}/api/v1/internal/chatlogs/private`, {
        params: {
          page: page.value,
          limit: size
        },
        headers
      })
    ])

    const chatEntries = chatResponse.data.content
    const privateEntries = privateResponse.data.content.map((entry: any) => ({
      ...entry,
      type: "private_message"
    }))

    // Merge and sort by timestamp
    const allEntries = [...chatEntries, ...privateEntries].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    chatLogs.value = allEntries
    hasMore.value = chatResponse.data.last === false || privateResponse.data.last === false
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
    const [chatResponse, privateResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/v1/internal/chatlogs/chat`, {
        params: {
          page: page.value + 1,
          limit: size
        },
        headers
      }),
      axios.get(`${API_BASE_URL}/api/v1/internal/chatlogs/private`, {
        params: {
          page: page.value + 1,
          limit: size
        },
        headers
      })
    ])

    const chatEntries = chatResponse.data.content
    const privateEntries = privateResponse.data.content.map((entry: any) => ({
      ...entry,
      type: "private_message"
    }))

    // Merge and sort by timestamp
    const newEntries = [...chatEntries, ...privateEntries].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    chatLogs.value = [...newEntries, ...chatLogs.value]
    hasMore.value = chatResponse.data.last === false || privateResponse.data.last === false
    page.value++
  } catch (err: any) {
    error.value = err.message || "Failed to load more chat logs"
    console.error("Error loading more chat logs:", err)
  } finally {
    loadingMore.value = false
  }
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

function handleScroll() {
  if (!chatContainer.value) return

  const {scrollTop, scrollHeight, clientHeight} = chatContainer.value
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight

  // If user is within 100px of bottom, enable auto-scroll
  if (distanceFromBottom < 100) {
    autoScroll.value = true
    showScrollButton.value = false
  } else {
    autoScroll.value = false
    showScrollButton.value = true
  }
}

function scrollToBottomClick() {
  autoScroll.value = true
  showScrollButton.value = false
  scrollToBottom()
}

watch(chatLogs, async () => {
  if (autoScroll.value) {
    await nextTick()
    scrollToBottom()
  }
}, {deep: true})

async function reconnectWebSocket() {
  if (chatSubscription) {
    chatSubscription.unsubscribe()
    chatSubscription = null
  }
  if (stompClient) {
    await stompClient.deactivate()
  }
  await connectWebSocket()
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
      chatSubscription = stompClient?.subscribe("/topic/chat", (message) => {
        const chatLog = JSON.parse(message.body)
        const entry = chatLog.recipientName ? {...chatLog, type: "private_message"} : chatLog
        console.log(entry)
        chatLogs.value.push(entry)
      })
    },
    onStompError: (frame) => {
      console.error("STOMP error:", frame)
    },
    onDisconnect: () => {
      console.log("WebSocket disconnected")
    },
  })

  stompClient.activate()

  // Refresh token and reconnect every 50 minutes (tokens typically expire after 1 hour)
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval)
  }
  tokenRefreshInterval = setInterval(async () => {
    console.log("Refreshing WebSocket connection with new token")
    await reconnectWebSocket()
  }, 50 * 1000) as unknown as number
}

onMounted(async () => {
  await fetchChatLogs()
  connectWebSocket()
  await nextTick()
  scrollToBottom()
})

onUnmounted(() => {
  if (chatSubscription) {
    chatSubscription.unsubscribe()
  }
  if (stompClient) {
    stompClient.deactivate()
  }
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval)
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
              <Combobox :items="availableUsers" hint="Add Users..." @select="addUserFilter"/>
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
              <Combobox :items="availableServerGroups" hint="Add Server Group..." @select="addServerGroupFilter"/>
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

          <!-- Type Filter -->
          <div class="border rounded-lg p-3 bg-card">
            <div class="space-y-2">
              <label class="text-sm font-medium">Type</label>
              <Combobox :items="availableTypes" hint="Add Type..." @select="addTypeFilter"/>
              <div v-if="typeFilter.length" class="flex flex-wrap gap-1.5 pt-1">
                <span
                    v-for="name in typeFilter"
                    :key="name"
                    class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                >
                  {{ name }}
                  <button
                      class="hover:text-destructive-foreground transition-colors"
                      @click="removeTypeFilter(name)"
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

        <div v-else class="flex flex-col h-[calc(100vh-12rem)] relative">
          <div v-if="hasMore" class="flex justify-center pb-4">
            <Button @click="loadMore" :disabled="loadingMore" variant="secondary">
              {{ loadingMore ? "Loading..." : "Load More" }}
            </Button>
          </div>

          <div
              ref="chatContainer"
              @scroll="handleScroll"
              class="border rounded-lg divide-y divide-border overflow-y-auto bg-card flex-1 custom-scrollbar"
          >
            <ChatLogEntryComponent
                v-for="entry in filteredChatLogs"
                :key="entry.id"
                :entry="entry"
            />
          </div>

          <!-- Scroll to Bottom Button -->
          <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
          >
            <Button
                v-if="showScrollButton"
                @click="scrollToBottomClick"
                class="absolute bottom-4 right-4 rounded-full shadow-lg"
                size="icon"
            >
              <ArrowDown class="size-4"/>
            </Button>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

