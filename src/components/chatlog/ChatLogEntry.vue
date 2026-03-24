<script setup lang="ts">
import type {ChatLogEntry, ChatMessage, PrivateMessage} from "@/types/chatlog"
import {getUsernameColor} from "@/lib/username-color"
import {computed} from "vue"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {ArrowRight, Hash, Lock, MessageSquare, ShieldAlert, Swords, TreePalm} from "lucide-vue-next"

const props = defineProps<{
  entry: ChatLogEntry
}>()

const isStaffChat = computed(() =>
    props.entry.type === "staff_message"
)

const isIslandChat = computed(() =>
    props.entry.type === "island_message"
)

const isGangChat = computed(() =>
    props.entry.type === "gang_message"
)

const senderColor = computed(() => getUsernameColor(props.entry.senderName))

const recipientColor = computed(() => {
  if (props.entry.type === "private_message") {
    return getUsernameColor((props.entry as PrivateMessage).recipientName)
  }
  return ""
})

const formattedTime = computed(() => {
  const date = new Date(props.entry.timestamp)
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
})

const fullTime = computed(() => {
  return new Date(props.entry.timestamp).toLocaleString()
})

const tooltipLines = computed(() => {
  const lines: string[] = []
  lines.push(fullTime.value)
  if (props.entry.type !== "private_message") {
    const entry = props.entry as ChatMessage
    lines.push(`Server: ${entry.server}`)
    lines.push(`Chatroom: ${entry.chatroom}`)
    if (entry.channelId !== "null") {
      lines.push(`Channel: ${entry.channelId}`)
    }
  }
  lines.push(`ID: ${props.entry.id}`)
  return lines
})
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <Tooltip>
      <TooltipTrigger as-child>
        <div
            class="group flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-2 px-3 py-2 sm:py-1.5 hover:bg-accent/60 rounded transition-colors">
                    <span class="text-xs text-muted-foreground shrink-0 pt-0.5 sm:min-w-[50px]" :title="fullTime">
                        {{ formattedTime }}
                    </span>

          <div v-if="entry.type !== 'private_message'" class="flex flex-wrap items-center gap-1.5 min-w-0 ">
            <ShieldAlert v-if="isStaffChat" class="size-3.5 shrink-0 text-yellow-500"/>
            <TreePalm v-else-if="isIslandChat" class="size-3.5 shrink-0 text-muted-foreground"/>
            <Swords v-else-if="isGangChat" class="size-3.5 shrink-0 text-muted-foreground"/>
            <MessageSquare v-else class="size-3.5 shrink-0 text-muted-foreground "/>
            <span class="font-semibold shrink-0" :style="{color: senderColor}">
                            {{ entry.senderName }}
                        </span>
            <span class="text-muted-foreground shrink-0">›</span>
            <span class="break-all min-w-0">{{ entry.content }}</span>
          </div>

          <div v-else class="flex flex-wrap items-center gap-1.5 min-w-0">
            <Lock class="size-3.5 shrink-0 text-muted-foreground"/>
            <span class="font-semibold shrink-0" :style="{color: senderColor}">
                            {{ entry.senderName }}
                        </span>
            <ArrowRight class="size-3.5 shrink-0 text-muted-foreground"/>
            <span class="font-semibold shrink-0" :style="{color: recipientColor}">
                            {{ (entry as PrivateMessage).recipientName }}
                        </span>
            <span class="text-muted-foreground shrink-0">›</span>
            <span class="break-all min-w-0">{{ entry.content }}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        <div class="flex flex-col gap-0.5 text-xs">
          <div v-for="line in tooltipLines" :key="line" class="flex items-center gap-1">
            <Hash v-if="line.startsWith('Channel:')" class="size-3"/>
            {{ line }}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

