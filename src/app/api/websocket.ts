import { Client, type IMessage } from "@stomp/stompjs";
import { WS_URL } from "./client";
import type { ChatLogEntry } from "./types";

export function connectChatSocket(onMessage: (entry: ChatLogEntry) => void): () => void {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 3000,
  });

  client.onConnect = () => {
    client.subscribe("/topic/chat", (message: IMessage) => {
      onMessage(JSON.parse(message.body) as ChatLogEntry);
    });
  };

  client.activate();

  return () => {
    client.deactivate();
  };
}
