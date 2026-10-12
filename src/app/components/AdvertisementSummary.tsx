import {ExternalLink, Megaphone} from "lucide-react";
import {Link} from "react-router";
import {useAdvertisementStatistics} from "../hooks/useAdvertisements";
import type {AdvertisementStatistics} from "../api/types";
import {Button} from "./ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";
import {Skeleton} from "./ui/skeleton";
import {Timestamp} from "./Timestamp";

export function AdvertisementSummary({ days }: { days: number }) {
  const { data, loading, error, reload } = useAdvertisementStatistics(days);
  const top = data?.advertisements.filter((advertisement) => advertisement.players > 0).slice(0, 3) ?? [];

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2"><Megaphone size={14} className="text-primary" />Advertisements</CardTitle>
          <CardDescription>
            {data ? data.attributedPlayers.toLocaleString() : "…"} new player attributions from linked videos in the last {days} days
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={`/statistics/advertisements?days=${days}`} target="_blank" rel="noopener noreferrer">
            Explore advertisements <ExternalLink size={13} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <Skeleton className="h-24 w-full" /> : error ? (
          <div className="flex items-center gap-3 text-sm text-red-400">
            {error}<Button variant="outline" size="sm" onClick={reload}>Retry</Button>
          </div>
        ) : top.length === 0 ? (
          <p className="text-sm text-muted-foreground">No linked advertisements have new player attributions in this window.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {top.map((advertisement, index) => (
              <Link
                key={advertisement.code}
                to={`/statistics/advertisements?days=${days}&code=${encodeURIComponent(advertisement.code)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border bg-muted/20 p-3 hover:bg-muted/40 transition-colors min-w-0"
              >
                <p className="text-[10px] text-muted-foreground font-mono">#{index + 1} · {advertisement.code}</p>
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
        <p>Tracking is not available for {data.unavailableGamemodes.join(", ")}. Its counts are excluded.</p>
      )}
      {data.lookupStatus === "unconfigured" && <p>Automatic YouTube matching is not configured yet. Cached advertisements are still shown.</p>}
      {data.lookupStatus === "unavailable" && <p>YouTube matching is temporarily unavailable. Pending codes will be retried.</p>}
      {(data.unmatchedPlayers > 0 || data.pendingPlayers > 0) && (
        <p>
          Excluded from advertisement rankings: {data.unmatchedPlayers.toLocaleString()} attributions with no matching video
          {data.pendingPlayers > 0 && `, ${data.pendingPlayers.toLocaleString()} awaiting a video lookup`}.
        </p>
      )}
      {data.lastScannedAt && <p>Channel last checked <Timestamp value={data.lastScannedAt} />.</p>}
    </div>
  );
}
