/**
 * Presentation helpers for audit-log action ids.
 *
 * `action_id` is a free-form string on the API side, not an enum — static-audit registers actions by
 * name and the set is only discoverable by grepping the game plugins. Everything here therefore
 * degrades gracefully: an id added on the server that this map has never heard of still renders,
 * just with its raw name and a hashed colour.
 */

const ACTION_ID_COLORS = [
  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
];

/** Stable per-id badge colour — the same action always gets the same one. */
export function actionIdColor(actionId: string): string {
  let hash = 0;
  for (let i = 0; i < actionId.length; i++) {
    hash = (hash * 31 + actionId.charCodeAt(i)) | 0;
  }
  return ACTION_ID_COLORS[Math.abs(hash) % ACTION_ID_COLORS.length];
}

/** The action ids the game plugins register today. Anything missing falls back to its raw id. */
const ACTION_LABELS: Record<string, string> = {
  session_begin: "Session started",
  session_end: "Session ended",
  command_executed: "Command run",
  clear_chat: "Chat cleared",
  add_item: "Item given",
  add_item_to_storage: "Item stored",
  remove_item_from_storage: "Item withdrawn",
  gift_card_created: "Gift card created",
  gift_card_redeemed: "Gift card redeemed",
  gift_card_payment: "Gift card payment",
  gift_card_added: "Gift card credited",
  gift_card_removed: "Gift card debited",
  gift_card_set: "Gift card set",
  crate_opened: "Crate opened",
  key_all: "Keys given to all",
  lootbox_opened: "Lootbox opened",
  trade_started: "Trade started",
  trade_completed: "Trade completed",
  player_context_event: "Context event",
  player_context_changed: "Context changed",
};

/**
 * A readable name for an action id, e.g. `crate_opened` → "Crate opened". Unknown ids are returned
 * unchanged rather than mangled, so a new action is still identifiable.
 */
export function actionLabel(actionId: string): string {
  return ACTION_LABELS[actionId] ?? actionId;
}
