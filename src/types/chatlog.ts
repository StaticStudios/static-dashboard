export interface ChatLogEntry {
    id: string
    senderName: string
    recipientName: string
    content: string
    timestamp: string
    server: string
    serverGroup: string
    chatroom: string
    channelId: string | null
    type: string
}
