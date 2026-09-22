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

/**
 * An in-game rank a player holds (a LuckPerms group), from the proxy. Not the staff `rank` on `useMe()`,
 * which is a Discord-derived `StaffPosition`.
 */
export interface PlayerGameRank {
  /** LuckPerms group, `<type>.<name>`, e.g. `skyblock.emperor`. */
  id: string;
  name: string;
  type: "PLAYER" | "SKYBLOCK" | "PRISON" | "STAFF" | "MISC";
  /** Gamemode the rank belongs to; null for network-wide ranks (staff, player, misc). */
  serverGroup: ServerGroup | null;
  priority: number;
  /** Raw MiniMessage source of the rank's prefix. */
  prefixFormat: string;
  /** `prefixFormat` parsed by the proxy; null when it failed to parse. */
  prefixRendered: MinecraftComponent | null;
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

/** One row of a "top N" breakdown. `key` is the raw grouped value, `label` is what to display. */
export interface StatCount {
  key: string;
  label: string;
  count: number;
}

/** One day of a single-series chart. Quiet days are present with `count: 0`. */
export interface StatPoint {
  date: string;
  count: number;
}

/** One day of a stacked chart. `byGroup` has a zero-filled entry per gamemode in `groups`. */
export interface GroupedStatPoint {
  date: string;
  total: number;
  byGroup: Record<string, number>;
}

export interface PlayerStatCount {
  id: string;
  name: string | null;
  skinTextureValue: string | null;
  count: number;
}

export interface StatisticsOverview {
  days: number;
  totalEvents: number;
  activePlayers: number;
  actionTypes: number;
  servers: number;
  /** Every gamemode present in the window, in the order the chart should stack them. */
  groups: string[];
  series: GroupedStatPoint[];
  activePlayerSeries: StatPoint[];
  topActions: StatCount[];
  topPlayers: PlayerStatCount[];
}

export interface SessionStatistics {
  days: number;
  logins: number;
  uniquePlayers: number;
  /** Sessions with both a begin and an end row — the only ones with a measurable length. */
  completedSessions: number;
  medianSeconds: number;
  loginSeries: StatPoint[];
  uniquePlayerSeries: StatPoint[];
  lengthBuckets: StatCount[];
  byGamemode: StatCount[];
}

export interface CrateReward {
  crateId: string;
  rewardName: string;
  count: number;
  /** This reward's fraction of its own crate's opens, 0-1. */
  share: number;
}

export interface GameplayStatistics {
  days: number;
  topCommands: StatCount[];
  crateOpens: StatCount[];
  crateRewards: CrateReward[];
  tradesStarted: number;
  tradesCompleted: number;
  tradeResults: StatCount[];
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

/**
 * Someone in a ticket transcript. A transcript only ever names people by Discord snowflake, so the
 * player fields are filled in by the API where that account has been linked to a Minecraft account,
 * and are null where it has not. `username` falls back to the name recorded in the transcript when
 * the Discord member is no longer known.
 */
export interface TicketPerson {
  snowflake: string;
  username: string | null;
  playerId: string | null;
  playerName: string | null;
  skinTextureValue: string | null;
}

/** A row in the Tickets list. Carries no messages — those come from the detail endpoint. */
export interface TicketTranscriptSummary {
  channelSnowflake: string;
  channelName: string;
  openedBy: TicketPerson | null;
  closedBy: TicketPerson | null;
  openedAt: string | null;
  closedAt: string | null;
  messageCount: number;
  participantCount: number;
}

export interface TicketAttachment {
  url: string | null;
  filename: string | null;
  size: number | null;
}

export interface TicketEmbed {
  title: string | null;
  description: string | null;
  url: string | null;
}

export interface TicketMessage {
  id: string;
  author: TicketPerson | null;
  bot: boolean;
  content: string | null;
  sentAt: string;
  editedAt: string | null;
  /** Another message's `id` in the same transcript. Can dangle — render a fallback. */
  replyToMessageId: string | null;
  attachments: TicketAttachment[];
  embeds: TicketEmbed[];
}

export type TicketEventType = "OPENED" | "CLOSED" | "USER_ADDED";

export interface TicketEvent {
  type: TicketEventType;
  actor: TicketPerson | null;
  /** A channel snowflake, and only present on USER_ADDED. */
  targetId: string | null;
  at: string | null;
}

/**
 * One full transcript. `messages` is already chronological. `participants` has Ticket Tool removed
 * and will not necessarily include `openedBy` — an opener who never posted has no participant row.
 */
export interface TicketTranscriptDetail {
  channelSnowflake: string;
  channelName: string;
  guildSnowflake: string;
  openedBy: TicketPerson | null;
  closedBy: TicketPerson | null;
  openedAt: string | null;
  closedAt: string | null;
  savedAt: string;
  messageCount: number;
  participants: { user: TicketPerson | null; messageCount: number }[];
  events: TicketEvent[];
  messages: TicketMessage[];
}
