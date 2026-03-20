<script setup lang="ts">
import {computed, onMounted} from "vue"
import {useRoute, useRouter} from "vue-router"
import {useChatLogs} from "@/composables/useChatLogs"
import type {ChatLogParams} from "@/types/chatlog"
import ChatLogEntryComponent from "@/components/chatlog/ChatLogEntry.vue"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import {ArrowLeft, MessageSquare, Lock} from "lucide-vue-next"

const route = useRoute()
const router = useRouter()
const {messages, loading, error, fetchChatLogs} = useChatLogs()

const params = computed<ChatLogParams>(() => {
    const chatPlayerNames = route.query.chatPlayerNames
        ? String(route.query.chatPlayerNames).split(",").filter(Boolean)
        : []
    const privateMessagePlayerNames = route.query.privateMessagePlayerNames
        ? String(route.query.privateMessagePlayerNames).split(",").filter(Boolean)
        : []
    const start = String(route.query.start ?? "")
    const end = String(route.query.end ?? "")

    return {chatPlayerNames, privateMessagePlayerNames, start, end}
})

const sortedMessages = computed(() => {
    return [...messages.value].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
})

const chatCount = computed(() => messages.value.filter(m => m.type === "chat_message").length)
const pmCount = computed(() => messages.value.filter(m => m.type === "private_message").length)

onMounted(() => {
    if (params.value.chatPlayerNames.length > 0 || params.value.privateMessagePlayerNames.length > 0) {
        fetchChatLogs(params.value)
    }
})
</script>

<template>
    <div class="px-4 pt-5 sm:px-10 w-full max-w-5xl">
        <div class="flex items-center gap-3">
            <Button variant="ghost" size="icon" @click="router.push({name: 'ChatLogs'})">
                <ArrowLeft class="size-5"/>
            </Button>
            <div class="text-3xl sm:text-4xl font-semibold">Chat Logs</div>
        </div>

        <div v-if="params.chatPlayerNames.length || params.privateMessagePlayerNames.length" class="pt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span v-if="params.chatPlayerNames.length">
                Chat: {{ params.chatPlayerNames.join(", ") }}
            </span>
            <span v-if="params.chatPlayerNames.length && params.privateMessagePlayerNames.length">•</span>
            <span v-if="params.privateMessagePlayerNames.length">
                PMs: {{ params.privateMessagePlayerNames.join(", ") }}
            </span>
        </div>

        <div class="pt-6"/>

        <div v-if="loading" class="space-y-2">
            <Skeleton v-for="i in 12" :key="i" class="h-8 w-full"/>
        </div>

        <div v-else-if="error" class="text-destructive-foreground text-sm">
            {{ error }}
        </div>

        <div v-else-if="messages.length === 0" class="text-muted-foreground text-sm">
            No messages found for the given parameters.
        </div>

        <div v-else>
            <div class="flex items-center gap-4 pb-4 text-sm text-muted-foreground">
                <span class="flex items-center gap-1">
                    <MessageSquare class="size-3.5"/>
                    {{ chatCount }} chat messages
                </span>
                <span class="flex items-center gap-1">
                    <Lock class="size-3.5"/>
                    {{ pmCount }} private messages
                </span>
            </div>

            <div class="border rounded-lg divide-y divide-border overflow-hidden bg-card">
                <ChatLogEntryComponent
                    v-for="entry in sortedMessages"
                    :key="entry.id"
                    :entry="entry"
                />
            </div>
        </div>
    </div>
</template>

