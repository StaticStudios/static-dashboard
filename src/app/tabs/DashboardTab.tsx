import { Ban, VolumeX, Shield, Zap, Users, Sword, Server, TrendingUp, Clock } from "lucide-react";
import { cn } from "../../lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { PunishmentBadge } from "../components/PunishmentBadge";
import { PUNISHMENTS } from "../data/punishments";

export function DashboardTab() {
  const stats = [
    {
      label: "Total Players",
      value: 342,
      max: 1000,
      sub: "342 / 1000 slots",
      pct: 34.2,
      icon: <Users size={16} />,
      accent: "#4ade80",
      accentClass: "text-primary",
      ringClass: "ring-primary/20 bg-primary/5",
    },
    {
      label: "Skyblock",
      value: 185,
      max: 500,
      sub: "185 / 500 slots",
      pct: 37,
      icon: <Sword size={16} />,
      accent: "#60a5fa",
      accentClass: "text-blue-400",
      ringClass: "ring-blue-500/20 bg-blue-500/5",
    },
    {
      label: "Prison",
      value: 157,
      max: 500,
      sub: "157 / 500 slots",
      pct: 31.4,
      icon: <Server size={16} />,
      accent: "#f59e0b",
      accentClass: "text-amber-400",
      ringClass: "ring-amber-500/20 bg-amber-500/5",
    },
  ];

  const activePunishments = PUNISHMENTS.filter((p) => p.status === "Active").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time server metrics and recent activity</p>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Bans", value: PUNISHMENTS.filter(p => p.type === "Ban" && p.status === "Active").length, icon: <Ban size={13} />, color: "text-red-400" },
          { label: "Active Mutes", value: PUNISHMENTS.filter(p => p.type === "Mute" && p.status === "Active").length, icon: <VolumeX size={13} />, color: "text-amber-400" },
          { label: "Total Punishments", value: PUNISHMENTS.length, icon: <Shield size={13} />, color: "text-blue-400" },
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
                  {s.pct}%
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
            {PUNISHMENTS.slice(0, 5).map((p, i) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <PlayerAvatar initials={p.avatar} seed={i} />
                    <span className="text-xs font-mono text-foreground">{p.player}</span>
                  </div>
                </TableCell>
                <TableCell><PunishmentBadge type={p.type} /></TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{p.reason}</span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-xs font-mono text-muted-foreground">{p.staff}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{p.date}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
