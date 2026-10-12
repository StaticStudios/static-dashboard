import {useState} from "react";
import {Link, Navigate, useSearchParams} from "react-router";
import {Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis} from "recharts";
import {ArrowLeft, ExternalLink, Megaphone, Search} from "lucide-react";
import {cn, rankAtLeast} from "../../lib/utils";
import {gamemodeStyle} from "../../lib/gamemodes";
import {useMe} from "../hooks/useMe";
import {useAdvertisementStatistics} from "../hooks/useAdvertisements";
import type {Advertisement, AdvertisementStatistics} from "../api/types";
import {AdvertisementNotice} from "../components/AdvertisementSummary";
import {FilterSelect} from "../components/FilterSelect";
import {ChartEmpty, shortDate, tooltipFormatter} from "../components/StatCharts";
import {Timestamp} from "../components/Timestamp";
import {Button} from "../components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";
import {Input} from "../components/ui/input";
import {Skeleton} from "../components/ui/skeleton";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../components/ui/table";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";

const WINDOWS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 365 days" },
];
const GAMEMODES = [
  { value: "all", label: "All gamemodes" },
  { value: "skyblock", label: "Skyblock" },
  { value: "prison", label: "Prison" },
];

export function AdvertisementsTab() {
  const { me, loading } = useMe();
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!rankAtLeast(me?.rank, "ADMIN")) return <Navigate to="/dashboard" replace />;
  return <Advertisements />;
}

function Advertisements() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("players");
  const daysValue = params.get("days") ?? "30";
  const days = Number(WINDOWS.some((option) => option.value === daysValue) ? daysValue : "30");
  const modeValue = params.get("gamemode") ?? "all";
  const gamemode = GAMEMODES.some((option) => option.value === modeValue) ? modeValue : "all";
  const { data, loading, error, reload } = useAdvertisementStatistics(days, gamemode);
  const advertisements = data?.advertisements ?? [];
  const selected = advertisements.find((advertisement) => advertisement.code === params.get("code")) ?? advertisements[0];
  const leading = advertisements.find((advertisement) => advertisement.players > 0);
  const term = search.trim().toLowerCase();
  const filtered = advertisements
    .filter((advertisement) => `${advertisement.title} ${advertisement.code}`.toLowerCase().includes(term))
    .sort((a, b) => {
      if (sort === "newest") return b.publishedAt.localeCompare(a.publishedAt) || a.code.localeCompare(b.code);
      if (sort === "lifetime") return b.lifetimePlayers - a.lifetimePlayers || a.code.localeCompare(b.code);
      return b.players - a.players || b.lifetimePlayers - a.lifetimePlayers || a.code.localeCompare(b.code);
    });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Link to="/statistics" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft size={12} /> Statistics
          </Link>
          <h1 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
            <Megaphone size={20} className="text-primary" /> Advertisements
          </h1>
          <p className="text-sm text-muted-foreground">See which videos bring new players to each gamemode.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterSelect value={gamemode} onValueChange={(value) => updateParam("gamemode", value)} options={GAMEMODES} className="w-[170px]" />
          <FilterSelect value={String(days)} onValueChange={(value) => updateParam("days", value)} options={WINDOWS} className="w-[160px]" />
        </div>
      </div>

      <p className="text-xs text-muted-foreground max-w-4xl">
        These are first-code attributions recorded by the game, including attempts at expired codes. Each player counts once per
        gamemode; all-gamemode totals can include the same player twice. Counts do not measure every viewer who joins.
        Rankings and charts use the selected UTC date window; lifetime counts use the selected gamemode.
      </p>

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-lg border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-400">
          {error}<Button variant="outline" size="sm" onClick={reload}>Retry</Button>
        </div>
      )}
      {loading ? <Skeleton className="h-24 w-full" /> : data && (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <Metric label="New player attributions" value={data.attributedPlayers.toLocaleString()} detail="From linked advertisements" />
            <Metric label="Ads bringing players" value={String(advertisements.filter((advertisement) => advertisement.players > 0).length)} detail={`${advertisements.length} cached codes`} />
            <Metric label="Leading advertisement" value={leading?.code ?? "—"} detail={leading ? `${leading.players.toLocaleString()} new players in this window` : "No attributed players in this window"} />
            <Metric label="Lifetime attributions" value={advertisements.reduce((sum, advertisement) => sum + advertisement.lifetimePlayers, 0).toLocaleString()} detail="Linked ads · selected gamemode" />
          </div>
          <AdvertisementNotice data={data} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>New players from advertisements</CardTitle>
                <CardDescription>Daily attributions by gamemode · UTC</CardDescription>
              </CardHeader>
              <CardContent><OverviewChart data={data} /></CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Advertisement trend</CardTitle>
                <CardDescription>Select a code below to inspect its daily performance.</CardDescription>
              </CardHeader>
              <CardContent>
                {selected ? <AdvertisementTrend advertisement={selected} data={data} /> : <ChartEmpty />}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Advertisement performance</CardTitle>
              <CardDescription className="mt-1">Codes with no matching video are excluded. Video links open in a new tab.</CardDescription>
            </div>
            <FilterSelect value={sort} onValueChange={setSort} options={[
              { value: "players", label: "Most new players" },
              { value: "lifetime", label: "Most lifetime players" },
              { value: "newest", label: "Newest uploads" },
            ]} className="w-[190px]" />
          </div>
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-3 text-muted-foreground" />
            <Input aria-label="Search advertisements" placeholder="Search video title or code…" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-48 w-full" /> : !data ? (
            <p className="text-sm text-muted-foreground">Advertisement statistics are unavailable.</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {advertisements.length > 0 ? "No advertisements match your search." : "No advertisements have been linked yet. Matching starts when a new player's code is recorded."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Advertisement</TableHead>
                  <TableHead className="text-right">New players</TableHead>
                  {data.availableGamemodes.filter((group) => gamemode === "all").map((group) => (
                    <TableHead key={group} className="text-right">{gamemodeStyle(group).label}</TableHead>
                  ))}
                  <TableHead className="text-right">Share</TableHead>
                  <TableHead className="text-right">Lifetime</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead><span className="sr-only">Video link</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((advertisement) => (
                  <TableRow key={advertisement.code} className={cn(selected?.code === advertisement.code && "bg-primary/5")}>
                    <TableCell className="min-w-[220px] max-w-[400px]">
                      <button
                        type="button"
                        aria-label={`View trend for ${advertisement.code}`}
                        aria-pressed={selected?.code === advertisement.code}
                        onClick={() => updateParam("code", advertisement.code)}
                        className="text-left w-full cursor-pointer hover:text-primary focus-visible:outline-primary rounded-sm"
                      >
                        <span className="block text-sm truncate" title={advertisement.title}>{advertisement.title}</span>
                        <span className="block font-mono text-xs text-primary mt-1">/redeem {advertisement.code}</span>
                      </button>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">{advertisement.players.toLocaleString()}</TableCell>
                    {data.availableGamemodes.filter((group) => gamemode === "all").map((group) => (
                      <TableCell key={group} className="text-right font-mono text-muted-foreground">{(advertisement.byGamemode[group] ?? 0).toLocaleString()}</TableCell>
                    ))}
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {data.attributedPlayers > 0 ? `${(advertisement.players / data.attributedPlayers * 100).toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono">{advertisement.lifetimePlayers.toLocaleString()}</TableCell>
                    <TableCell className="text-xs"><Timestamp value={advertisement.publishedAt} /></TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon">
                        <a href={advertisement.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${advertisement.title}`}><ExternalLink size={14} /></a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="px-4 py-3.5 gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold font-mono text-foreground truncate" title={value}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{detail}</p>
    </Card>
  );
}

function OverviewChart({ data }: { data: AdvertisementStatistics }) {
  if (data.attributedPlayers === 0) return <ChartEmpty />;
  const groups = data.availableGamemodes.filter((group) => data.gamemode === "all" || data.gamemode === group);
  const config: ChartConfig = Object.fromEntries(groups.map((group) => [group, gamemodeStyle(group)]));
  const points = data.series.map((point) => ({ date: point.date, ...point.byGroup }));
  return (
    <ChartContainer config={config} className="h-[260px] w-full">
      <AreaChart data={points} margin={{ left: 0, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickFormatter={shortDate} tickLine={false} axisLine={false} minTickGap={32} />
        <YAxis width={38} allowDecimals={false} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => `${label} (UTC)`} formatter={(value, name) => tooltipFormatter(value, gamemodeStyle(String(name)).label)} />} />
        {groups.map((group) => (
          <Area key={group} dataKey={group} type="linear" stackId="players" stroke={`var(--color-${group})`} fill={`var(--color-${group})`} fillOpacity={0.15} strokeWidth={2} dot={false} isAnimationActive={false} />
        ))}
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}

function AdvertisementTrend({ advertisement, data }: { advertisement: Advertisement; data: AdvertisementStatistics }) {
  const counts = new Map(advertisement.series.map((point) => [point.date, point.count]));
  const points = data.series.map((point) => ({ date: point.date, players: counts.get(point.date) ?? 0 }));
  const publishedDay = advertisement.publishedAt.slice(0, 10);
  const peak = advertisement.series.reduce<{ date: string; count: number } | null>((best, point) => !best || point.count > best.count ? point : best, null);
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-mono text-primary">{advertisement.code}</p>
          <p className="text-sm truncate" title={advertisement.title}>{advertisement.title}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Uploaded <Timestamp value={advertisement.publishedAt} /></p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={advertisement.videoUrl} target="_blank" rel="noopener noreferrer">Watch <ExternalLink size={12} /></a>
        </Button>
      </div>
      <ChartContainer config={{ players: { label: "New players", color: "var(--chart-1)" } }} className="h-[190px] w-full">
        <AreaChart data={points} margin={{ left: 0, right: 12, top: 15 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} tickLine={false} axisLine={false} minTickGap={32} />
          <YAxis width={38} allowDecimals={false} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => `${label} (UTC)`} />} />
          <Area dataKey="players" type="linear" stroke="var(--color-players)" fill="var(--color-players)" fillOpacity={0.15} strokeWidth={2} dot={false} isAnimationActive={false} />
          {publishedDay >= data.from && publishedDay <= data.through && <ReferenceLine x={publishedDay} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: "Uploaded", position: "insideTopRight", fontSize: 10, fill: "var(--muted-foreground)" }} />}
        </AreaChart>
      </ChartContainer>
      <p className="text-xs text-muted-foreground">
        {(advertisement.players / data.days).toFixed(1)} players/day in this window
        {peak && ` · Best day: ${peak.count.toLocaleString()} on ${shortDate(peak.date)} (UTC)`}
      </p>
    </div>
  );
}
