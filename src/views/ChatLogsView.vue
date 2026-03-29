<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue"
import axios from "axios"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import ChatLogEntryComponent from "@/components/chatlog/ChatLogEntry.vue"
import {useUserStore} from "@/stores/UserStore.ts"
import {Client} from "@stomp/stompjs"
import {ArrowDown, MessageSquareOff, X} from "lucide-vue-next"
import {API_BASE_URL, WS_BASE_URL} from "@/config/api"
import Combobox from "@/components/custom/combobox/combobox.vue";
import DateTimePicker from "@/components/custom/datetime-picker/DateTimePicker.vue";
import type {ChatLogEntry} from "@/types/chatlog.ts";

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
const timestampFrom = ref<number | null>(null)
const timestampTo = ref<number | null>(null)

// Pre-fetched filter options from API
const prefetchedUsers = ref<string[]>([])
const prefetchedServerGroups = ref<string[]>([])
const prefetchedTypes = ref<string[]>([])
const userSearchResults = ref<string[]>([])
const userSearchLoading = ref(false)
let userSearchTimeout: number | null = null

const availableUsers = computed(() => [...new Set([...prefetchedUsers.value, ...userSearchResults.value])])
const availableServerGroups = computed(() => prefetchedServerGroups.value)
const availableTypes = computed(() => prefetchedTypes.value)

async function fetchPrefetchedOptions() {
  const headers = {"Authorization": `Bearer ${await userStore.getAuthToken()}`}
  try {
    const [usersRes, groupsRes, typesRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/v1/internal/chatlogs/users`, {headers}),
      axios.get(`${API_BASE_URL}/api/v1/internal/chatlogs/server-groups`, {headers}),
      axios.get(`${API_BASE_URL}/api/v1/internal/chatlogs/chatrooms`, {headers}),
    ])
    prefetchedUsers.value = usersRes.data
    prefetchedServerGroups.value = groupsRes.data
    prefetchedTypes.value = typesRes.data
  } catch (err) {
    console.error("Error fetching filter options:", err)
  }
}

async function searchUsersFromApi(query: string) {
  userSearchLoading.value = true
  try {
    const headers = {"Authorization": `Bearer ${await userStore.getAuthToken()}`}
    const response = await axios.get(`${API_BASE_URL}/api/v1/internal/chatlogs/users`, {
      params: {query},
      headers
    })
    userSearchResults.value = response.data
  } catch (err) {
    console.error("Error searching users:", err)
  } finally {
    userSearchLoading.value = false
  }
}

function onUserSearch(query: string) {
  if (userSearchTimeout) clearTimeout(userSearchTimeout)
  if (!query) {
    userSearchResults.value = []
    return
  }
  const lowerQuery = query.toLowerCase()
  const foundInPrefetched = prefetchedUsers.value.some(u => u.toLowerCase().includes(lowerQuery))
  if (foundInPrefetched) {
    userSearchResults.value = []
    return
  }
  userSearchTimeout = setTimeout(() => searchUsersFromApi(query), 300) as unknown as number
}

const filteredChatLogs = computed(() => chatLogs.value)

const hasActiveFilters = computed(() =>
    userFilter.value.length > 0 ||
    serverGroupFilter.value.length > 0 ||
    typeFilter.value.length > 0 ||
    timestampFrom.value !== null ||
    timestampTo.value !== null
)

function clearAllFilters() {
  userFilter.value = []
  serverGroupFilter.value = []
  typeFilter.value = []
  timestampFrom.value = null
  timestampTo.value = null
}

watch(userFilter, applyFilters, {deep: true})
watch(serverGroupFilter, applyFilters, {deep: true})
watch(typeFilter, applyFilters, {deep: true})
watch(timestampFrom, applyFilters)
watch(timestampTo, applyFilters)

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

function buildFilterParams() {
  return {
    users: userFilter.value.length > 0 ? userFilter.value : undefined,
    serverGroups: serverGroupFilter.value.length > 0 ? serverGroupFilter.value : undefined,
    chatrooms: typeFilter.value.length > 0 ? typeFilter.value : undefined,
    from: timestampFrom.value ?? undefined,
    to: timestampTo.value ?? undefined,
  }
}

async function fetchChatLogs() {
  loading.value = true
  error.value = null
  let headers = {
    "Authorization": `Bearer ${await userStore.getAuthToken()}`
  }

  try {
    const chatResponse = await axios.get(`${API_BASE_URL}/api/v1/internal/chatlogs/chat`, {
      params: {
        page: page.value,
        limit: size,
        ...buildFilterParams()
      },
      headers
    })

    const chatEntries: ChatLogEntry[] = chatResponse.data.content

    chatEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    chatLogs.value = chatEntries
    hasMore.value = chatResponse.data.last === false
  } catch (err: any) {
    error.value = err.message || "Failed to fetch chat logs"
    console.error("Error fetching chat logs:", err)
  } finally {
    loading.value = false
  }
}

async function applyFilters() {
  page.value = 0
  chatLogs.value = []
  await fetchChatLogs()
}

async function loadMore() {
  loadingMore.value = true
  error.value = null
  let headers = {
    "Authorization": `Bearer ${await userStore.getAuthToken()}`
  }

  try {
    const chatResponse = await axios.get(`${API_BASE_URL}/api/v1/internal/chatlogs/chat`, {
      params: {
        page: page.value + 1,
        limit: size,
        ...buildFilterParams()
      },
      headers
    })

    const chatEntries: ChatLogEntry[] = chatResponse.data.content

    // Merge and sort by timestamp
    const newEntries = chatEntries.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    chatLogs.value = [...newEntries, ...chatLogs.value]
    hasMore.value = chatResponse.data.last === false
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
  await Promise.all([fetchChatLogs(), fetchPrefetchedOptions()])
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
          <div class="flex items-center justify-between">
            <div class="text-lg font-semibold">Filters</div>
            <button
                v-if="hasActiveFilters"
                class="text-xs text-muted-foreground hover:text-foreground transition-colors"
                @click="clearAllFilters"
            >
              Clear all
            </button>
          </div>

          <!-- Users Filter -->
          <div class="border rounded-lg p-3 bg-card">
            <div class="space-y-2">
              <label class="text-sm font-medium">Users</label>
              <Combobox :items="availableUsers" hint="Add Users..." :loading="userSearchLoading" @select="addUserFilter" @search="onUserSearch"/>
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

          <!-- Timestamp Filter -->
          <div class="border rounded-lg p-3 bg-card">
            <div class="space-y-2">
              <label class="text-sm font-medium">Timestamp</label>
              <div class="space-y-1.5">
                <div>
                  <label class="text-xs text-muted-foreground">From</label>
                  <DateTimePicker v-model="timestampFrom" placeholder="Pick start..."/>
                </div>
                <div>
                  <label class="text-xs text-muted-foreground">To</label>
                  <DateTimePicker v-model="timestampTo" placeholder="Pick end..."/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Logs -->
      <div class="flex-1 min-w-0">
        <div v-if="loading" class="border rounded-lg bg-card h-[calc(100vh-12rem)] divide-y divide-border overflow-hidden">
          <div v-for="i in 18" :key="i" class="flex items-center gap-2 px-3 py-1.5">
            <Skeleton class="h-3 w-11 shrink-0"/>
            <Skeleton class="size-3.5 shrink-0 rounded-sm"/>
            <Skeleton :class="['h-3 shrink-0', ['w-16','w-20','w-14','w-24','w-12'][i % 5]]"/>
            <Skeleton class="h-3 w-2 shrink-0"/>
            <Skeleton :class="['h-3', ['w-32','w-48','w-40','w-56','w-36','w-28','w-44','w-52'][i % 8]]"/>
          </div>
        </div>

        <div v-else-if="error" class="text-destructive-foreground text-sm">
          {{ error }}
        </div>

        <div v-else-if="chatLogs.length === 0" class="border rounded-lg bg-card h-[calc(100vh-12rem)] flex flex-col items-center justify-center gap-3 text-center">
          <MessageSquareOff class="size-10 text-muted-foreground/40"/>
          <div>
            <p class="text-sm font-medium">No chat logs found</p>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ hasActiveFilters ? 'No messages match the current filters.' : 'There are no chat logs to display.' }}
            </p>
          </div>
          <button
              v-if="hasActiveFilters"
              class="text-xs text-primary hover:underline"
              @click="clearAllFilters"
          >
            Clear filters
          </button>
        </div>

        <div v-else class="flex flex-col h-[calc(100vh-12rem)] relative">
          <div
              ref="chatContainer"
              @scroll="handleScroll"
              class="border rounded-lg divide-y divide-border overflow-y-auto bg-card flex-1 custom-scrollbar"
          >
            <div v-if="hasMore" class="flex justify-center p-2 sticky top-0 z-10 bg-card border-b border-border">
              <Button @click="loadMore" :disabled="loadingMore" variant="secondary" size="sm">
                {{ loadingMore ? "Loading..." : "Load More" }}
              </Button>
            </div>
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

