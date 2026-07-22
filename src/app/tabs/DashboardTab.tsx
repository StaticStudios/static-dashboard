import { Ban, VolumeX, Shield, Zap, Users, Sword, Server, TrendingUp, Clock, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn, initials } from "../../lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../components/ui/chart";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { PlayerLink } from "../components/PlayerLink";
import { PunishmentBadge } from "../components/PunishmentBadge";
import { usePunishments, getPunishmentStatus } from "../hooks/usePunishments";
import { usePlayerCounts } from "../hooks/usePlayerCounts";
import { usePlayerCountHistory } from "../hooks/usePlayerCountHistory";

const chartConfig = {
  network: { label: "Network", color: "var(--chart-1)" },
  skyblock: { label: "Skyblock", color: "var(--chart-2)" },
  prison: { label: "Prison", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function DashboardTab() {
  const { punishments, total } = usePunishments();
  const counts = usePlayerCounts();
  const history = usePlayerCountHistory();

  const stats = [
    {
      label: "Total Players",
      value: counts?.proxy ?? "…",
      sub: `${counts?.proxy ?? "…"} / 1000 slots`,
      pct: counts ? Math.min(100, (counts.proxy / 1000) * 100) : 0,
      icon: <Users size={16} />,
      accent: "#4ade80",
      accentClass: "text-primary",
      ringClass: "ring-primary/20 bg-primary/5",
    },
    {
      label: "Skyblock",
      value: counts?.skyblock ?? "…",
      sub: `${counts?.skyblock ?? "…"} / 500 slots`,
      pct: counts ? Math.min(100, (counts.skyblock / 500) * 100) : 0,
      icon: <Sword size={16} />,
      accent: "#60a5fa",
      accentClass: "text-blue-400",
      ringClass: "ring-blue-500/20 bg-blue-500/5",
    },
    {
      label: "Prison",
      value: counts?.prison ?? "…",
      sub: `${counts?.prison ?? "…"} / 500 slots`,
      pct: counts ? Math.min(100, (counts.prison / 500) * 100) : 0,
      icon: <Server size={16} />,
      accent: "#f59e0b",
      accentClass: "text-amber-400",
      ringClass: "ring-amber-500/20 bg-amber-500/5",
    },
  ];

  const activePunishments = punishments.filter((p) => getPunishmentStatus(p) === "Active").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time server metrics and recent activity</p>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Bans", value: punishments.filter(p => (p.type === "BAN" || p.type === "IP_BAN") && getPunishmentStatus(p) === "Active").length, icon: <Ban size={13} />, color: "text-red-400" },
          { label: "Active Mutes", value: punishments.filter(p => p.type === "MUTE" && getPunishmentStatus(p) === "Active").length, icon: <VolumeX size={13} />, color: "text-amber-400" },
          { label: "Total Punishments", value: total, icon: <Shield size={13} />, color: "text-blue-400" },
          { label: "Active Actions", value: activePunishments, icon: <Zap size={13} />, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="px-4 py-3.5 flex-row items-center gap-3">
            <span className={s.color}>{s.icon}</span>
            <div>
              <p className="text-lg font-bold font-mono text-foreground leading-none">{s.value}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Player Count Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="group hover:border-white/10 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription className="uppercase tracking-widest">{s.label}</CardDescription>
                <div className={cn("p-2 rounded-lg ring-1", s.ringClass, s.accentClass)}>
                  {s.icon}
                </div>
              </div>
              <div className="flex items-end justify-between pt-2">
                <p className="text-3xl font-bold font-display text-foreground">{s.value}</p>
                <span className={cn("text-xs font-mono font-semibold pb-0.5", s.accentClass)}>
                  {s.pct.toFixed(1)}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={s.pct} className="h-1.5" />
              <div className="flex items-center justify-between mt-2.5">
                <p className="text-xs font-mono text-muted-foreground">{s.sub}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.accent }} />
                  <span className="text-[10px] font-mono text-muted-foreground">Live</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Player Count Over Time */}
      <Card className="group hover:border-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-primary" />
            <CardTitle>Player Count</CardTitle>
            <CardDescription>last 5 min</CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-mono text-muted-foreground">Live</span>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center">
              <p className="text-xs font-mono text-muted-foreground">Collecting data…</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <AreaChart data={history} margin={{ left: 4, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="fillNetwork" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-network)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-network)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillSkyblock" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-skyblock)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-skyblock)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillPrison" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-prison)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-prison)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
                <YAxis width={32} tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="network"
                  type="monotone"
                  stroke="var(--color-network)"
                  fill="url(#fillNetwork)"
                  strokeWidth={2}
                  isAnimationActive={false}
                  dot={false}
                />
                <Area
                  dataKey="skyblock"
                  type="monotone"
                  stroke="var(--color-skyblock)"
                  fill="url(#fillSkyblock)"
                  strokeWidth={2}
                  isAnimationActive={false}
                  dot={false}
                />
                <Area
                  dataKey="prison"
                  type="monotone"
                  stroke="var(--color-prison)"
                  fill="url(#fillPrison)"
                  strokeWidth={2}
                  isAnimationActive={false}
                  dot={false}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Punishments */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            <CardTitle>Recent Punishments</CardTitle>
            <Badge variant="secondary" className="text-[10px]">Last 5</Badge>
          </div>
          <Clock size={13} className="text-muted-foreground" />
        </CardHeader>
        <Separator className="mt-4" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden md:table-cell">Reason</TableHead>
              <TableHead className="hidden lg:table-cell">Staff</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {punishments.slice(0, 5).map((p, i) => (
              <TableRow key={p.id}>
                <TableCell>
                  <PlayerLink id={p.targetId} name={p.targetName} className="gap-2.5">
                    <PlayerAvatar initials={initials(p.targetName)} seed={i} skinTextureValue={p.targetSkinTextureValue} />
                    <span className="text-xs font-mono text-foreground">{p.targetName}</span>
                  </PlayerLink>
                </TableCell>
                <TableCell><PunishmentBadge type={p.type} /></TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{p.reason}</span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <PlayerLink id={p.issuerId} name={p.issuerName}>
                    <span className="text-xs font-mono text-muted-foreground hover:text-foreground">{p.issuerName}</span>
                  </PlayerLink>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{new Date(p.issuedAt).toLocaleString()}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
