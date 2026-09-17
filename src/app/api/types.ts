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

export interface StoreInfo {
  accountId: number;
  name: string | null;
  domain: string | null;
  currency: string | null;
  currencySymbol: string | null;
  gameType: string | null;
  serverName: string | null;
}

export interface StorePackageRef {
  id: number;
  name: string;
}

export interface StorePaymentPlayerRef {
  /** Null when Tebex's stored identifier is not a Minecraft UUID — render the name as plain text. */
  id: string | null;
  name: string | null;
}

export interface StorePayment {
  transactionId: string;
  date: string | null;
  amount: number;
  currency: string | null;
  currencySymbol: string | null;
  status: string;
  gateway: string | null;
  email: string | null;
  player: StorePaymentPlayerRef;
  packages: StorePackageRef[];
  creatorCode: string | null;
}

export interface StoreRevenuePoint {
  date: string;
  revenue: number;
  sales: number;
}

export interface StoreSummary {
  currency: string | null;
  currencySymbol: string | null;
  revenue: number;
  sales: number;
  averageOrder: number;
  days: number;
  /** True when the payment-page ceiling was hit before the window was covered. */
  truncated: boolean;
  series: StoreRevenuePoint[];
}

export interface StoreCurrencyTotal {
  currency: string;
  symbol: string | null;
  total: number;
}

export interface PlayerStoreSummary {
  /** One entry per currency this player actually paid in; never summed or converted. */
  totals: StoreCurrencyTotal[];
  purchaseCount: number;
  firstPurchase: string | null;
  lastPurchase: string | null;
  chargebackRate: number;
  banCount: number;
}

export interface PlayerPurchase {
  transactionId: string;
  date: string | null;
  amount: number;
  currency: string | null;
  symbol: string | null;
  status: string;
  packages: StorePackageRef[];
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
  /** Live proxy state, not a stored column. Includes vanished players — this list is staff-only. */
  online: boolean;
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

/**
 * One server group / server pair a player has audit entries from. `applicationGroup` is the
 * gamemode (`skyblock`, `prison`, `hub`, `proxy`); `applicationId` is the instance inside it.
 * Only pairs that actually occur in that player's log are returned.
 */
export interface ActionSource {
  applicationGroup: string;
  applicationId: string;
}
