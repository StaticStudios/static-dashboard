<script setup lang="ts">
import {ref} from "vue"
import {useRouter} from "vue-router"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {X} from "lucide-vue-next"

const router = useRouter()

function toLocalDatetimeString(date: Date): string {
    const offset = date.getTimezoneOffset()
    const local = new Date(date.getTime() - offset * 60_000)
    return local.toISOString().slice(0, 16)
}

const chatPlayerInput = ref("")
const chatPlayerNames = ref<string[]>([])
const pmPlayerInput = ref("")
const pmPlayerNames = ref<string[]>([])
const startDate = ref("2022-03-01T00:00")
const endDate = ref(toLocalDatetimeString(new Date()))

function addChatPlayer() {
    const name = chatPlayerInput.value.trim()
    if (name && !chatPlayerNames.value.includes(name)) {
        chatPlayerNames.value.push(name)
        chatPlayerInput.value = ""
    }
}

function removeChatPlayer(name: string) {
    chatPlayerNames.value = chatPlayerNames.value.filter(n => n !== name)
}

function addPmPlayer() {
    const name = pmPlayerInput.value.trim()
    if (name && !pmPlayerNames.value.includes(name)) {
        pmPlayerNames.value.push(name)
        pmPlayerInput.value = ""
    }
}

function removePmPlayer(name: string) {
    pmPlayerNames.value = pmPlayerNames.value.filter(n => n !== name)
}

function handleKeydown(event: KeyboardEvent, addFn: () => void) {
    if (event.key === "Enter") {
        addFn()
    }
}

function viewChatLogs() {
    const query: Record<string, string> = {}

    if (chatPlayerNames.value.length > 0) {
        query.chatPlayerNames = chatPlayerNames.value.join(",")
    }
    if (pmPlayerNames.value.length > 0) {
        query.privateMessagePlayerNames = pmPlayerNames.value.join(",")
    }
    if (startDate.value) {
        query.start = new Date(startDate.value).toISOString()
    }
    if (endDate.value) {
        query.end = new Date(endDate.value).toISOString()
    }

    router.push({name: "ChatLogMessages", query})
}

const hasPlayers = ref(false)

function updateHasPlayers() {
    hasPlayers.value = chatPlayerNames.value.length > 0 || pmPlayerNames.value.length > 0
}
</script>

<template>
    <div class="px-4 pt-5 sm:px-10 max-w-3xl">
        <div class="text-3xl sm:text-4xl font-semibold">Chat Logs</div>
        <div class="pt-8"/>

        <Card>
            <CardHeader>
                <CardTitle>Search Configuration</CardTitle>
                <CardDescription>Configure which players' messages to view</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-medium">Chat Message Players</label>
                    <div class="flex gap-2">
                        <Input
                            v-model="chatPlayerInput"
                            placeholder="Enter player name..."
                            @keydown="handleKeydown($event, addChatPlayer)"
                        />
                        <Button @click="addChatPlayer" variant="secondary">Add</Button>
                    </div>
                    <div v-if="chatPlayerNames.length" class="flex flex-wrap gap-1.5 pt-1">
                        <span
                            v-for="name in chatPlayerNames"
                            :key="name"
                            class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                        >
                            {{ name }}
                            <button
                                class="hover:text-destructive-foreground transition-colors"
                                @click="removeChatPlayer(name); updateHasPlayers()"
                            >
                                <X class="size-3"/>
                            </button>
                        </span>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium">Private Message Players</label>
                    <div class="flex gap-2">
                        <Input
                            v-model="pmPlayerInput"
                            placeholder="Enter player name..."
                            @keydown="handleKeydown($event, addPmPlayer)"
                        />
                        <Button @click="addPmPlayer" variant="secondary">Add</Button>
                    </div>
                    <div v-if="pmPlayerNames.length" class="flex flex-wrap gap-1.5 pt-1">
                        <span
                            v-for="name in pmPlayerNames"
                            :key="name"
                            class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                        >
                            {{ name }}
                            <button
                                class="hover:text-destructive-foreground transition-colors"
                                @click="removePmPlayer(name); updateHasPlayers()"
                            >
                                <X class="size-3"/>
                            </button>
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Start Date</label>
                        <Input type="datetime-local" v-model="startDate"/>
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium">End Date</label>
                        <Input type="datetime-local" v-model="endDate"/>
                    </div>
                </div>

                <Button
                    class="w-full"
                    @click="viewChatLogs"
                    :disabled="chatPlayerNames.length === 0 && pmPlayerNames.length === 0"
                >
                    View Chat Logs
                </Button>
            </CardContent>
        </Card>
    </div>
</template>

