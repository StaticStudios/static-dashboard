# StaticStudios Dashboard

Rewrite of the StaticStudios Dashboard

Statistics includes the three advertisements with the most new player attributions in its
selected window. **View all advertisements** opens `/statistics/advertisements` in a new
browser tab. ADMIN+ can filter by Skyblock, Prison, or all gamemodes and by 7, 30, 90, or
365 days; gamemode, window, time zone, and selected code are retained in the URL.

The time-zone picker defaults to the viewer's browser zone and remembers their choice
locally. Day boundaries, counts, chart buckets, upload markers, and displayed timestamps
follow that choice, including daylight-saving changes. UTC remains available.

The dedicated page shows daily trends, per-code rankings, gamemode counts, share of
linked attributions, lifetime counts, and publication dates. Select a code to inspect its
trend and upload marker, or open its video. Search titles/codes and sort by period players,
lifetime players, or newest upload. Unknown gamemode tracking, unavailable matching, and
excluded unmatched/pending attributions are displayed explicitly.

Counts come from the game's first-code attribution records, including attempts at expired
codes; they are not total viewers or all joins. A player may count in both gamemodes.
The companion API feature provides the ADMIN-only endpoint and caches YouTube mappings.
Configure `YOUTUBE_API_KEY` on the API server; the dashboard needs no YouTube credentials.

Run `pnpm build` for production validation. To verify live data, start the API through its
normal development workflow, open Statistics, follow View all advertisements, change each
filter, and compare the counts/trends with `first_freebie_codes`. A Prison instance without
the tracking table should show an availability notice rather than appear to have measured
zero attributions.
