export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type PunishmentType = "BAN" | "IP_BAN" | "MUTE" | "KICK" | "WARN";

export interface PunishmentResponse {
  id: string;
  targetId: string;
  targetName: string;
  type: PunishmentType;
  reason: string;
  issuedAt: string;
  issuerId: string;
  issuerName: string;
  revoked: boolean;
  duration: string;
  ipAddress: string | null;
  ipBan: boolean;
  staffRollbackId: string | null;
  revokedById: string | null;
  revokedByName: string | null;
  revokedAt: string | null;
  expiresAt: string | null;
}

export interface ChatLogEntry {
  id: string;
  senderName: string;
  recipientName: string | null;
  content: string;
  timestamp: string;
  serverGroup: string | null;
  server: string | null;
  chatroom: string | null;
  channelId: string | null;
  type: string | null;
}

export type ServerCountType = "PROXY" | "SKYBLOCK" | "PRISON" | "HUB";
