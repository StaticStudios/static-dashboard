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

/** One distinct IP a player has logged in from; the proxy logs a row per login, collapsed here. */
export interface PlayerIpHistoryEntry {
  ipAddress: string;
  firstSeen: string;
  lastSeen: string;
  logins: number;
}

/** ADMIN+ only. `history` is most recently used first. */
export interface PlayerIpHistory {
  currentIpAddress: string | null;
  history: PlayerIpHistoryEntry[];
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
  /** Players whose first ever join fell on each day. */
  newPlayerSeries: StatPoint[];
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

/** A row in the island search. Owner fields are null if the owner has no player record. */
export interface IslandSummary {
  id: string;
  name: string;
  ownerId: string | null;
  ownerName: string | null;
  ownerSkinTextureValue: string | null;
  value: number;
  level: number;
  memberCount: number;
  createdAt: string | null;
}

/** A member of a player group (Skyblock island, Prison gang). The owner is flagged, not separate. */
export interface GroupMember {
  id: string;
  name: string | null;
  skinTextureValue: string | null;
  owner: boolean;
  online: boolean;
  lastSeen: string | null;
}

/** An on/off group setting, keyed by its game-side name. */
export interface GroupFlag {
  key: string;
  enabled: boolean;
}

export interface GroupWarp {
  name: string;
  x: number;
  y: number;
  z: number;
  isPublic: boolean;
  primary: boolean;
}

/**
 * A Skyblock island. `members` includes the owner. Upgrade amounts are increments over the game's
 * config defaults (except `mining_level`), keyed by their `island_upgrades` column. `flags` always
 * lists every known flag, with the game's default where the island never changed it.
 */
export interface IslandProfile {
  id: string;
  name: string;
  type: string | null;
  variant: string | null;
  value: number;
  level: number;
  bankBalance: number;
  createdAt: string | null;
  owner: GroupMember | null;
  members: GroupMember[];
  upgrades: { key: string; amount: number }[];
  flags: GroupFlag[];
  warps: GroupWarp[];
}

/** A row in the prison gang search. Owner fields are null if the owner has no player record. */
export interface GangSummary {
  id: string;
  name: string;
  ownerId: string | null;
  ownerName: string | null;
  ownerSkinTextureValue: string | null;
  points: number;
  level: number;
  memberCount: number;
  createdAt: string | null;
}

/** `contributedBlocks` is what the member has put towards the gang's level-up tasks. */
export interface GangMember extends GroupMember {
  contributedBlocks: number;
}

/** A prison gang. `members` includes the owner; `warps` are its cell warps. */
export interface GangProfile {
  id: string;
  name: string;
  points: number;
  level: number;
  bankMoneyBalance: number;
  bankTokensBalance: number;
  createdAt: string | null;
  owner: GangMember | null;
  members: GangMember[];
  flags: GroupFlag[];
  warps: GroupWarp[];
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

/** One chartable point of a backend's health history. */
export interface BackendHealthPoint {
  timestamp: string;
  tps: number;
  /** Mean tick time in ms: spark's 10s mean when available, otherwise Paper's rolling average. */
  mspt: number;
  msptP95: number | null;
  /** This JVM's CPU usage over the last 10s, 0–1. Null until spark has enabled. */
  cpuProcess: number | null;
  connectedPlayers: number;
  heapUsedBytes: number;
  gcPauseMillis: number;
}

/** A backend's newest full health sample. See the skyblock repo's docs/backend-health-metrics.md. */
export interface BackendHealthSample {
  timestamp: string;
  loadedWorlds: number;
  connectedPlayers: number;
  loadedChunks: number;
  entities: number;
  heapMaxBytes: number;
  heapCommittedBytes: number;
  heapUsedBytes: number;
  heapSampleAfterGc: boolean;
  heapMeasuredAt: string;
  tps1m: number;
  tps5m: number;
  tps15m: number;
  mspt: number;
  msptMean10s: number | null;
  msptP95: number | null;
  msptMax: number | null;
  cpuProcess: number | null;
  cpuSystem: number | null;
  /** Stop-the-world GC time since the previous sample. */
  gcPauseMillis: number;
  gcCollections: number;
}

export interface BackendServerMetrics {
  sessionId: string;
  serverId: string;
  /** When the backend finished starting; null for sessions older than the session-begin audit row. */
  startedAt: string | null;
  /** Null right after startup, before the first sample. */
  latest: BackendHealthSample | null;
  history: BackendHealthPoint[];
}

export interface ServerGroupMetrics {
  group: string;
  activeServers: number;
  connectedPlayers: number;
  loadedWorlds: number;
  averageTps: number | null;
  minTps: number | null;
  averageMspt: number | null;
  maxMspt: number | null;
  servers: BackendServerMetrics[];
}

/** Groups arrive in display order: skyblock, prison, others, hub last. */
export interface ServerMetricsResponse {
  generatedAt: string;
  minutes: number;
  groups: ServerGroupMetrics[];
}

/** A spark profiler report captured by a backend. `status` is PENDING until the API has downloaded it. */
export interface SparkReportSummary {
  code: string;
  /** Last known viewer link; may have expired, so open reports through `openSparkReport`. */
  viewerUrl: string;
  serverId: string;
  serverGroup: string;
  /** e.g. "MSPT p95 72.4ms", "TPS 16.80" or "Saved by <user>". */
  trigger: string;
  triggeredAt: string;
  /** The timed run's length; 0 for a saved upload of the running profiler. */
  durationSeconds: number;
  tpsAtTrigger: number | null;
  msptP95AtTrigger: number | null;
  status: "PENDING" | "STORED" | "FAILED";
  rawSize: number | null;
  fetchError: string | null;
}

export interface SparkViewerLink {
  url: string;
  /** True when spark's copy had expired and the API uploaded the stored one again. */
  reuploaded: boolean;
}

/**
 * A backend's answer to a spark action. `result` per action — live: OPENED, NOT_RUNNING, FAILED; save:
 * STARTED, NOT_RUNNING; trust: TRUSTED, NOT_FOUND, INVALID; any: UNKNOWN when spark did not answer in time.
 */
export interface ProfilerActionResponse {
  result: string;
  /** The live viewer link, for an OPENED live action. */
  url: string | null;
}
