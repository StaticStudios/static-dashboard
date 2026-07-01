export type PunishmentType = "Ban" | "Mute" | "Kick" | "Warn";

export const PUNISHMENTS = [
  { id: 1,  player: "Herobrine99",   avatar: "HE", type: "Ban",  reason: "Hacking / X-Ray",              staff: "AdminSteveX", date: "2026-06-29 14:32", status: "Active",  duration: "Permanent" },
  { id: 2,  player: "GrieferKing",   avatar: "GK", type: "Ban",  reason: "Griefing spawn area",           staff: "ModLuna",     date: "2026-06-29 11:05", status: "Active",  duration: "7 days"    },
  { id: 3,  player: "xXDarkSoulXx",  avatar: "XD", type: "Mute", reason: "Excessive spam",               staff: "ModLuna",     date: "2026-06-28 22:17", status: "Active",  duration: "24 hours"  },
  { id: 4,  player: "CreeperFan42",  avatar: "CF", type: "Warn", reason: "Inappropriate language",       staff: "HelperJade",  date: "2026-06-28 18:44", status: "Expired", duration: "N/A"       },
  { id: 5,  player: "TNT_Master",    avatar: "TN", type: "Kick", reason: "AFK in PvP zone",              staff: "AdminSteveX", date: "2026-06-28 15:30", status: "Expired", duration: "N/A"       },
  { id: 6,  player: "DiamondDigger", avatar: "DD", type: "Mute", reason: "Advertising another server",   staff: "ModRiver",    date: "2026-06-27 20:11", status: "Active",  duration: "3 days"    },
  { id: 7,  player: "NetherWalker",  avatar: "NW", type: "Ban",  reason: "Duplication glitch abuse",     staff: "AdminSteveX", date: "2026-06-27 12:55", status: "Active",  duration: "14 days"   },
  { id: 8,  player: "PixelKnight",   avatar: "PK", type: "Warn", reason: "Disrespecting staff",          staff: "HelperJade",  date: "2026-06-26 09:23", status: "Expired", duration: "N/A"       },
  { id: 9,  player: "StealthArcher", avatar: "SA", type: "Ban",  reason: "Kill aura detected",           staff: "ModLuna",     date: "2026-06-26 06:14", status: "Active",  duration: "30 days"   },
  { id: 10, player: "LavaLord88",    avatar: "LL", type: "Kick", reason: "Lag machine construction",     staff: "ModRiver",    date: "2026-06-25 21:40", status: "Expired", duration: "N/A"       },
  { id: 11, player: "EnderEagle",    avatar: "EE", type: "Mute", reason: "Hate speech",                  staff: "AdminSteveX", date: "2026-06-25 17:02", status: "Active",  duration: "7 days"    },
  { id: 12, player: "RedstoneWiz",   avatar: "RW", type: "Warn", reason: "Minor rule infraction",        staff: "HelperJade",  date: "2026-06-24 14:35", status: "Expired", duration: "N/A"       },
] satisfies { id: number; player: string; avatar: string; type: PunishmentType; reason: string; staff: string; date: string; status: "Active" | "Expired"; duration: string }[];
