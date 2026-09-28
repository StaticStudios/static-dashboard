import { Client, type IMessage } from "@stomp/stompjs";
import { WS_URL, getAuthToken } from "./client";
import type { ChatLogEntry, ServerMetricsResponse } from "./types";

export function connectChatSocket(onMessage: (entry: ChatLogEntry) => void): () => void {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 3000,
  });

  client.beforeConnect = async () => {
    const token = await getAuthToken();
    client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  };

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

/**
 * Subscribes to the 5-minute server metrics the API pushes every 5 seconds (DEVELOPER and above).
 * `onStatus` reports whether the subscription is live, so the caller can fall back to polling.
 */
export function connectServerMetricsSocket(
  onMessage: (metrics: ServerMetricsResponse) => void,
  onStatus: (connected: boolean) => void
): () => void {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 3000,
  });

  client.beforeConnect = async () => {
    const token = await getAuthToken();
    client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  };

  client.onConnect = () => {
    client.subscribe("/topic/server-metrics", (message: IMessage) => {
      onMessage(JSON.parse(message.body) as ServerMetricsResponse);
    });
    onStatus(true);
  };
  client.onWebSocketClose = () => onStatus(false);
  client.onStompError = () => onStatus(false);

  client.activate();

  return () => {
    client.deactivate();
  };
}
