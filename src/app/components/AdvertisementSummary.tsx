import {ChevronRight, Megaphone} from "lucide-react";
import {Link} from "react-router";
import {useAdvertisementStatistics} from "../hooks/useAdvertisements";
import {useAdvertisementTimeZone} from "../hooks/useAdvertisementTimeZone";
import {gamemodeStyle} from "../../lib/gamemodes";
import type {AdvertisementStatistics} from "../api/types";
import {Button} from "./ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";
import {Skeleton} from "./ui/skeleton";
import {Timestamp} from "./Timestamp";

export function AdvertisementSummary({ days }: { days: number }) {
  const { timeZone } = useAdvertisementTimeZone();
  const { data, loading, error, reload } = useAdvertisementStatistics(days, "all", timeZone);
  const top = data?.advertisements.filter((advertisement) => advertisement.players > 0).slice(0, 3) ?? [];

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2"><Megaphone size={14} className="text-primary" />Advertisements</CardTitle>
          <CardDescription>
            {data ? data.attributedPlayers.toLocaleString() : "…"} new players from ads over the past {days} days · {timeZone}
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={`/statistics/advertisements?days=${days}&timeZone=${encodeURIComponent(timeZone)}`}>
            View all advertisements <ChevronRight size={13} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <Skeleton className="h-24 w-full" /> : error ? (
          <div className="flex items-center gap-3 text-sm text-red-400">
            {error}<Button variant="outline" size="sm" onClick={reload}>Retry</Button>
          </div>
        ) : top.length === 0 ? (
          <p className="text-sm text-muted-foreground">No new players from tracked ads during this period.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {top.map((advertisement, index) => (
              <Link
                key={`${advertisement.gamemode}:${advertisement.code}`}
                to={`/statistics/advertisements?days=${days}&timeZone=${encodeURIComponent(timeZone)}&adGamemode=${encodeURIComponent(advertisement.gamemode)}&code=${encodeURIComponent(advertisement.code)}`}
                className="rounded-lg border border-border bg-muted/20 p-3 hover:bg-muted/40 transition-colors min-w-0"
              >
                <p className="text-[10px] text-muted-foreground font-mono">#{index + 1} · {gamemodeStyle(advertisement.gamemode).label} · {advertisement.code}</p>
                <p className="text-sm text-foreground truncate mt-1" title={advertisement.title}>{advertisement.title}</p>
                <p className="text-xl font-bold font-mono text-primary mt-2">
                  {advertisement.players.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">new players</span>
                </p>
              </Link>
            ))}
          </div>
        )}
        {data && <AdvertisementNotice data={data} />}
      </CardContent>
    </Card>
  );
}

export function AdvertisementNotice({ data }: { data: AdvertisementStatistics }) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      {data.unavailableGamemodes.length > 0 && (
        <p>Ad tracking hasn't been set up for {data.unavailableGamemodes.map((group) => gamemodeStyle(group).label).join(", ")} yet.</p>
      )}
      {data.lookupStatus === "unconfigured" && <p>Automatic video matching hasn't been set up yet. Previously matched ads are shown.</p>}
      {data.lookupStatus === "unavailable" && <p>We couldn't check YouTube for new ads. Previously matched ads are shown, and new codes will be checked again.</p>}
      {(data.unmatchedPlayers > 0 || data.pendingPlayers > 0) && (
        <p>
          Not included in these totals: {[
            data.unmatchedPlayers > 0 ? `${data.unmatchedPlayers.toLocaleString()} new players whose codes have no matching video` : null,
            data.pendingPlayers > 0 ? `${data.pendingPlayers.toLocaleString()} new players whose codes are still being matched` : null,
          ].filter(Boolean).join("; ")}.
        </p>
      )}
      {data.lastScannedAt && <p>Last checked for new videos: <Timestamp value={data.lastScannedAt} timeZone={data.timeZone} />.</p>}
    </div>
  );
}
