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

export interface PlayerSummary {
  id: string;
  name: string;
  lastSeen: string | null;
}

export interface PlayerProfile {
  id: string;
  name: string;
  firstEverJoined: string | null;
  lastSeen: string | null;
  mcVersion: string | null;
  playtime: { skyblock: number; prison: number; hub: number; total: number };
  skyblock: {
    money: number;
    prestigePoints: number;
    dungeonShards: number;
    island: { id: string; name: string; owner: boolean } | null;
  } | null;
  prison: {
    money: number;
    tokens: number;
    prestigePoints: number;
    prestige: number;
    mineRank: number;
    gang: { id: string; name: string; owner: boolean } | null;
  } | null;
}

export interface AuditAction {
  logId: string;
  timestamp: string;
  applicationGroup: string;
  applicationId: string;
  actionId: string;
  actionData: string | null;
}
