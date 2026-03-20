import {ref} from "vue"
import axios from "axios"
import type {ChatLogEntry, ChatLogParams} from "@/types/chatlog"
import {useUserStore} from "@/stores/UserStore"

export function useChatLogs() {
    const messages = ref<ChatLogEntry[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchChatLogs(params: ChatLogParams) {
        loading.value = true
        error.value = null

        try {
            const userStore = useUserStore()
            const token = await userStore.getAuthToken()

            const response = await axios.post<ChatLogEntry[]>(
                "http://localhost:8080/api/v1/internal/chatlogs",
                {
                    chatPlayerNames: params.chatPlayerNames,
                    privateMessagePlayerNames: params.privateMessagePlayerNames,
                    start: params.start,
                    end: params.end,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            messages.value = response.data
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                error.value = e.response?.data?.message ?? e.message
            } else {
                error.value = "An unexpected error occurred"
            }
        } finally {
            loading.value = false
        }
    }

    return {messages, loading, error, fetchChatLogs}
}


