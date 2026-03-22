interface BaseChatLog {
    id: string
    senderName: string
    content: string
    timestamp: string
}

export interface ChatMessage extends BaseChatLog {
    type: "chat_message"
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

export interface ChatLogParams {
    chatPlayerNames: string[]
    privateMessagePlayerNames: string[]
    start: string
    end: string
}

