interface BaseChatLog {
    id: string
    senderName: string
    content: string
    timestamp: string
}

export interface ChatMessage extends BaseChatLog {
    type: string
    server: string
    serverGroup: string
    chatroom: string
    channelId: string | null
}

export interface PrivateMessage extends BaseChatLog {
    type: "private_message"
    recipientName: string
}

export type ChatLogEntry = ChatMessage | PrivateMessage
