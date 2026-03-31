<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue"
import axios from "axios"
import {Loader2, ShieldOff, X} from "lucide-vue-next"
import {Skeleton} from "@/components/ui/skeleton"
import {useUserStore} from "@/stores/UserStore.ts"
import {API_BASE_URL} from "@/config/api"
import Combobox from "@/components/custom/combobox/combobox.vue"
import type {Punishment, PunishmentsPage} from "@/types/punishment.ts"
import {isPermanent} from "@/types/punishment.ts"

const PUNISHMENT_TYPES = ['Ban', 'IP Ban', 'Warn', 'Mute', 'Kick']

const COUNT_PER_PAGE = 50

type UserOption = { uuid: string; name: string }

const page = ref(0)
const punishments = ref<Punishment[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const hasMore = ref(true)
const userStore = useUserStore()
const tableContainer = ref<HTMLElement | null>(null)

function handleScroll() {
  const el = tableContainer.value
  if (!el || loadingMore.value || !hasMore.value) return
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
    loadMore()
  }
}

// Filters
const targetFilter = ref<UserOption[]>([])
const issuedByFilter = ref<UserOption[]>([])
const typeFilter = ref<string[]>([])

// Pre-fetched options
const prefetchedUsers = ref<UserOption[]>([])
const targetSearchResults = ref<UserOption[]>([])
const issuerSearchResults = ref<UserOption[]>([])
const targetSearchLoading = ref(false)
const issuerSearchLoading = ref(false)
let targetSearchTimeout: number | null = null
let issuerSearchTimeout: number | null = null

const availableUsers = computed<UserOption[]>(() => {
  const map = new Map<string, UserOption>()
  for (const u of [...prefetchedUsers.value, ...targetSearchResults.value]) map.set(u.uuid, u)
  return [...map.values()]
})

const availableIssuers = computed<UserOption[]>(() => {
  const map = new Map<string, UserOption>()
  for (const u of [...prefetchedUsers.value, ...issuerSearchResults.value]) map.set(u.uuid, u)
  return [...map.values()]
})

async function fetchPrefetchedOptions() {
  const headers = {"Authorization": `Bearer ${await userStore.getAuthToken()}`}
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/internal/dashboard/users`, {headers})

    prefetchedUsers.value = response.data
  } catch (err) {
    console.error("Error fetching filter options:", err)
  }
}

async function searchTargetsFromApi(query: string) {
  targetSearchLoading.value = true
  try {
    const headers = {"Authorization": `Bearer ${await userStore.getAuthToken()}`}
    const response = await axios.get(`${API_BASE_URL}/api/v1/internal/punishments/targets`, {params: {query}, headers})
    targetSearchResults.value = response.data
  } catch (err) {
    console.error("Error searching targets:", err)
  } finally {
    targetSearchLoading.value = false
  }
}

async function searchIssuersFromApi(query: string) {
  issuerSearchLoading.value = true
  try {
    const headers = {"Authorization": `Bearer ${await userStore.getAuthToken()}`}
    const response = await axios.get(`${API_BASE_URL}/api/v1/internal/punishments/issuers`, {params: {query}, headers})
    issuerSearchResults.value = response.data
  } catch (err) {
    console.error("Error searching issuers:", err)
  } finally {
    issuerSearchLoading.value = false
  }
}

function onTargetSearch(query: string) {
  if (targetSearchTimeout) clearTimeout(targetSearchTimeout)
  if (!query) { targetSearchResults.value = []; return }
  const lower = query.toLowerCase()
  if (prefetchedUsers.value.some(u => u.name.toLowerCase().includes(lower))) { targetSearchResults.value = []; return }
  targetSearchTimeout = setTimeout(() => searchTargetsFromApi(query), 300) as unknown as number
}

function onIssuerSearch(query: string) {
  if (issuerSearchTimeout) clearTimeout(issuerSearchTimeout)
  if (!query) { issuerSearchResults.value = []; return }
  const lower = query.toLowerCase()
  if (prefetchedUsers.value.some(u => u.name.toLowerCase().includes(lower))) { issuerSearchResults.value = []; return }
  issuerSearchTimeout = setTimeout(() => searchIssuersFromApi(query), 300) as unknown as number
}

function addTargetFilter(name: string) {
  const option = availableUsers.value.find(u => u.name === name)
  if (option && !targetFilter.value.some(u => u.uuid === option.uuid)) {
    targetFilter.value.push(option)
  }
}

function removeTargetFilter(id: string) {
  targetFilter.value = targetFilter.value.filter(u => u.uuid !== id)
}

function addIssuedByFilter(name: string) {
  const option = availableIssuers.value.find(u => u.name === name)
  if (option && !issuedByFilter.value.some(u => u.uuid === option.uuid)) {
    issuedByFilter.value.push(option)
  }
}

function removeIssuedByFilter(id: string) {
  issuedByFilter.value = issuedByFilter.value.filter(u => u.uuid !== id)
}

const hasActiveFilters = computed(() =>
    targetFilter.value.length > 0 ||
    issuedByFilter.value.length > 0 ||
    typeFilter.value.length > 0
)

function clearAllFilters() {
  targetFilter.value = []
  issuedByFilter.value = []
  typeFilter.value = []
}

function addTypeFilter(type: string) {
  if (type && !typeFilter.value.includes(type)) {
    typeFilter.value.push(type)
  }
}

function removeTypeFilter(type: string) {
  typeFilter.value = typeFilter.value.filter(t => t !== type)
}

function buildFilterParams() {
  return {
    issuer: issuedByFilter.value.length > 0 ? issuedByFilter.value.map(u => u.uuid) : undefined,
    target: targetFilter.value.length > 0 ? targetFilter.value.map(u => u.uuid) : undefined,
    type: typeFilter.value.length > 0 ? typeFilter.value.map(t => t.replace(/ /g, '_')) : undefined,
  }
}

async function fetchPunishments() {
  loading.value = true
  error.value = null
  try {
    const headers = {"Authorization": `Bearer ${await userStore.getAuthToken()}`}
    const response = await axios.get<PunishmentsPage>(`${API_BASE_URL}/api/v1/internal/punishments`, {
      params: {
        page: page.value,
        limit: COUNT_PER_PAGE,
        ...buildFilterParams(),
      },
      headers,
    })
    punishments.value = response.data.content
    hasMore.value = response.data.last === false
  } catch (err: any) {
    error.value = err.message || "Failed to fetch punishments"
    console.error("Error fetching punishments:", err)
  } finally {
    loading.value = false
  }
}

async function applyFilters() {
  page.value = 0
  punishments.value = []
  await fetchPunishments()
}

async function loadMore() {
  loadingMore.value = true
  error.value = null
  try {
    const headers = {"Authorization": `Bearer ${await userStore.getAuthToken()}`}
    const response = await axios.get<PunishmentsPage>(`${API_BASE_URL}/api/v1/internal/punishments`, {
      params: {
        page: page.value + 1,
        limit: COUNT_PER_PAGE,
        ...buildFilterParams(),
      },
      headers,
    })
    punishments.value = [...punishments.value, ...response.data.content]
    hasMore.value = response.data.last === false
    page.value++
  } catch (err: any) {
    error.value = err.message || "Failed to load more punishments"
    console.error("Error loading more punishments:", err)
  } finally {
    loadingMore.value = false
  }
}

watch(targetFilter, applyFilters, {deep: true})
watch(issuedByFilter, applyFilters, {deep: true})
watch(typeFilter, applyFilters, {deep: true})

onMounted(() => Promise.all([fetchPunishments(), fetchPrefetchedOptions()]))

const TYPE_STYLES: Record<string, string> = {
  ban: 'bg-red-500/15 text-red-500',
  'ip_ban': 'bg-orange-500/15 text-orange-500',
  warn: 'bg-yellow-500/15 text-yellow-500',
  mute: 'bg-blue-500/15 text-blue-500',
  kick: 'bg-purple-500/15 text-purple-500',
}

function typeBadgeClass(type: string) {
  return TYPE_STYLES[type.toLowerCase()] ?? 'bg-muted text-muted-foreground'
}

function formatDate(value: string | number | null | undefined): string {
  if (!value) return '—'
  const d = new Date(typeof value === 'number' ? value : value)
  return isNaN(d.getTime()) ? String(value) : d.toLocaleString()
}
</script>

<template>
  <div class="px-4 pt-5 sm:px-10 w-full flex flex-col h-screen overflow-hidden">
    <div class="flex items-center gap-3 mb-6">
      <div class="text-3xl sm:text-4xl font-semibold">Punishments</div>
    </div>

    <div class="flex gap-4 flex-1 min-h-0">
      <!-- Filters Sidebar -->
      <div class="w-64 shrink-0 overflow-y-auto">
        <div class="border rounded-lg p-4 bg-muted/50 space-y-4">
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

          <!-- Target Filter -->
          <div class="border rounded-lg p-3 bg-card">
            <div class="space-y-2">
              <label class="text-sm font-medium">Target</label>
              <Combobox :items="availableUsers.map(u => u.name)" hint="Add target..." :loading="targetSearchLoading" @select="addTargetFilter" @search="onTargetSearch"/>
              <div v-if="targetFilter.length" class="flex flex-wrap gap-1.5 pt-1">
                <span
                    v-for="user in targetFilter"
                    :key="user.uuid"
                    class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                >
                  {{ user.name }}
                  <button class="hover:text-destructive-foreground transition-colors" @click="removeTargetFilter(user.uuid)">
                    <X class="size-3"/>
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Issued By Filter -->
          <div class="border rounded-lg p-3 bg-card">
            <div class="space-y-2">
              <label class="text-sm font-medium">Issued By</label>
              <Combobox :items="availableIssuers.map(u => u.name)" hint="Add issuer..." :loading="issuerSearchLoading" @select="addIssuedByFilter" @search="onIssuerSearch"/>
              <div v-if="issuedByFilter.length" class="flex flex-wrap gap-1.5 pt-1">
                <span
                    v-for="user in issuedByFilter"
                    :key="user.uuid"
                    class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                >
                  {{ user.name }}
                  <button class="hover:text-destructive-foreground transition-colors" @click="removeIssuedByFilter(user.uuid)">
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
              <Combobox :items="PUNISHMENT_TYPES.filter(t => !typeFilter.includes(t))" hint="Add type..." @select="addTypeFilter"/>
              <div v-if="typeFilter.length" class="flex flex-wrap gap-1.5 pt-1">
                <span
                    v-for="type in typeFilter"
                    :key="type"
                    class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                >
                  {{ type }}
                  <button
                      class="hover:text-destructive-foreground transition-colors"
                      @click="removeTypeFilter(type)"
                  >
                    <X class="size-3"/>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Punishments List -->
      <div class="flex-1 min-w-0 flex flex-col min-h-0">
        <!-- Loading skeleton -->
        <div v-if="loading" class="border rounded-lg bg-card overflow-hidden flex-1 overflow-y-auto">
          <div class="grid grid-cols-[7rem_1fr_1fr_1fr_1fr] gap-0 border-b bg-muted/40 px-3 py-2">
            <Skeleton class="h-3 w-10"/>
            <Skeleton class="h-3 w-12"/>
            <Skeleton class="h-3 w-14"/>
            <Skeleton class="h-3 w-16"/>
            <Skeleton class="h-3 w-16"/>
          </div>
          <div v-for="i in 15" :key="i" class="grid grid-cols-[7rem_1fr_1fr_1fr_1fr] gap-0 px-3 py-2.5 border-b last:border-0">
            <Skeleton class="h-3 w-14"/>
            <Skeleton :class="['h-3', ['w-20','w-24','w-16','w-28','w-18'][i % 5]]"/>
            <Skeleton :class="['h-3', ['w-16','w-20','w-14','w-22'][i % 4]]"/>
            <Skeleton class="h-3 w-24"/>
            <Skeleton class="h-3 w-24"/>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="text-destructive text-sm p-4 border rounded-lg bg-card">
          {{ error }}
        </div>

        <!-- Empty state -->
        <div v-else-if="punishments.length === 0" class="border rounded-lg bg-card h-64 flex flex-col items-center justify-center gap-3 text-center">
          <ShieldOff class="size-10 text-muted-foreground/40"/>
          <div>
            <p class="text-sm font-medium">No punishments found</p>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ hasActiveFilters ? 'No punishments match the current filters.' : 'There are no punishments to display.' }}
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

        <!-- Table -->
        <div v-else class="border rounded-lg bg-card overflow-hidden flex flex-col flex-1 min-h-0 max-h-[calc(100vh-7.5rem)]">
          <!-- Fixed header -->
          <div class="shrink-0 overflow-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <table class="w-full text-sm table-fixed">
              <colgroup>
                <col class="w-28"/>
                <col class="w-[15%]"/>
                <col class="w-[15%]"/>
                <col/>
                <col class="w-40"/>
                <col class="w-40"/>
              </colgroup>
              <thead>
                <tr class="border-b bg-muted/40">
                  <th class="px-3 py-2.5 text-left font-medium text-muted-foreground">Type</th>
                  <th class="px-3 py-2.5 text-left font-medium text-muted-foreground">Target</th>
                  <th class="px-3 py-2.5 text-left font-medium text-muted-foreground">Issued By</th>
                  <th class="px-3 py-2.5 text-left font-medium text-muted-foreground">Reason</th>
                  <th class="px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">Issued At</th>
                  <th class="px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">Expires At</th>
                </tr>
              </thead>
            </table>
          </div>
          <!-- Scrollable body -->
          <div ref="tableContainer" class="overflow-auto flex-1 custom-scrollbar" @scroll="handleScroll">
            <table class="w-full text-sm table-fixed">
              <colgroup>
                <col class="w-28"/>
                <col class="w-[15%]"/>
                <col class="w-[15%]"/>
                <col/>
                <col class="w-40"/>
                <col class="w-40"/>
              </colgroup>
              <tbody class="divide-y divide-border">
                <tr
                    v-for="punishment in punishments"
                    :key="punishment.id"
                    class="hover:bg-muted/30 transition-colors"
                >
                  <td class="px-3 py-2.5">
                    <span :class="['inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', typeBadgeClass(punishment.type)]">
                      {{ punishment.type.replace(/_/g, ' ') }}
                    </span>
                  </td>
                  <td class="px-3 py-2.5 font-medium">{{ punishment.targetName }}</td>
                  <td class="px-3 py-2.5 text-muted-foreground">{{ punishment.issuerName }}</td>
                  <td class="px-3 py-2.5 text-muted-foreground max-w-xs truncate">{{ punishment.reason ?? '—' }}</td>
                  <td class="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{{ formatDate(punishment.issuedAt) }}</td>
                  <td class="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                    <span v-if="isPermanent(punishment)" class="text-xs text-muted-foreground">Permanent</span>
                    <span v-else>{{ formatDate(punishment.expiresAt) }}</span>
                  </td>
                </tr>
                <tr v-if="loadingMore">
                  <td colspan="6" class="px-3 py-3 text-center text-muted-foreground text-sm">
                    <span class="inline-flex items-center gap-2">
                      <Loader2 class="size-3.5 animate-spin"/>
                      Loading...
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
