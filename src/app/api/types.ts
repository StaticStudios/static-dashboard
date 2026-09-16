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
  targetSkinTextureValue: string | null;
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

export interface PlayerAlt {
  id: string;
  name: string;
  skinTextureValue: string | null;
  ipAddresses: string[];
}

export type ChatTagType = "STANDARD" | "CUSTOM";

export type ServerGroup = "SKYBLOCK" | "PRISON" | "HUB";

/**
 * A chat tag a player owns. Tags are stored per server group, so the same player can own a
 * different set on skyblock, prison and hub - `serverGroup` says which one this row came from.
 */
export interface PlayerChatTag {
  id: string;
  /** Slug used by the /chattag commands. CUSTOM tags are namespaced `<playerUuid>_<name>`. */
  name: string;
  /** Raw MiniMessage source. */
  format: string;
  type: ChatTagType;
  serverGroup: ServerGroup;
  /** `format` parsed by the proxy; null when the proxy was unreachable or the tag failed to parse. */
  rendered: MinecraftComponent | null;
}

export interface GiftCardBalanceResponse {
  balance: number;
}

export type GiftCardHistoryType = "CREATED" | "REDEEMED" | "PAYMENT_SENT" | "PAYMENT_RECEIVED" | "MODIFIED";

export interface GiftCardHistoryEntry {
  type: GiftCardHistoryType;
  amount: number;
  description: string;
  counterpartyId: string | null;
  counterpartyName: string | null;
  timestamp: string;
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
  origin: string | null;
}

export interface CursorPage<T> {
  content: T[];
  hasBefore: boolean;
  hasAfter: boolean;
}

export interface ConversationBlock {
  messages: ChatLogEntry[];
  anchorMessageIds: string[];
}

export type ServerCountType = "PROXY" | "SKYBLOCK" | "PRISON" | "HUB";

export interface PlayerSummary {
  id: string;
  name: string;
  skinTextureValue: string | null;
  lastSeen: string | null;
}

export interface PlayerProfile {
  id: string;
  name: string;
  skinTextureValue: string | null;
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
  discord: { snowflake: string; username: string; boosting: boolean } | null;
}

export interface MeResponse {
  discordUsername: string;
  /** Staff rank tier, e.g. "ADMIN" — see StaffPosition on the API. Taken from the tier the request
   *  was authorized as, so the dev principal reports its tier too. */
  rank: string | null;
  minecraftId: string | null;
  minecraftName: string | null;
  skinTextureValue: string | null;
  skinTextureSignature: string | null;
}

/**
 * An Adventure text component as serialized by the proxy (Kyori's gson format). Styles cascade to
 * `extra` children unless a child overrides them.
 */
export interface MinecraftComponent {
  text?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
  /** Adventure serializes an unstyled child as a bare string rather than an object. */
  extra?: (MinecraftComponent | string)[];
}

export interface MotdResponse {
  /** Raw MiniMessage source of each line. */
  line1: string;
  line2: string;
  /** Each line parsed by the proxy, or null when `error` is set. */
  rendered1?: MinecraftComponent | null;
  rendered2?: MinecraftComponent | null;
  /** Parser message when a line is invalid MiniMessage. */
  error?: string | null;
}

export interface AuditAction {
  logId: string;
  timestamp: string;
  applicationGroup: string;
  applicationId: string;
  actionId: string;
  actionData: string | null;
}
