import {useEffect, useState} from "react";
import {Navigate} from "react-router";
import {Area, AreaChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {AlertTriangle, Receipt, RotateCcw, ShoppingCart, TrendingUp, Wallet} from "lucide-react";
import {cn, formatMoney, initials, rankAtLeast} from "../../lib/utils";
import {useMe} from "../hooks/useMe";
import {useStoreInfo, useStorePayments, useStoreRefresh, useStoreSummary} from "../hooks/useStore";
import {Badge} from "../components/ui/badge";
import {Button} from "../components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";
import {Separator} from "../components/ui/separator";
import {Skeleton} from "../components/ui/skeleton";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../components/ui/table";
import {type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "../components/ui/chart";
import {PlayerAvatar} from "../components/PlayerAvatar";
import {PlayerLink} from "../components/PlayerLink";
import {StorePaymentStatusBadge} from "../components/StorePaymentStatusBadge";
import {TablePager} from "../components/TablePager";

const PAGE_SIZE = 10;
const SUMMARY_DAYS = 30;

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function StoreTab() {
  const { me, loading } = useMe();

  // Wait for the rank before deciding — redirecting on a not-yet-loaded `me` would bounce a
  // developer who is allowed in.
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (!rankAtLeast(me?.rank, "DEVELOPER")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <StoreDashboard />;
}

function StoreDashboard() {
  const { reloadKey, refreshing, refreshedAt, refresh } = useStoreRefresh();
  const { info } = useStoreInfo();
  const { summary, loading: summaryLoading, error: summaryError } = useStoreSummary(SUMMARY_DAYS, reloadKey);

  const [page, setPage] = useState(1);
  const { payments, totalElements, totalPages, loading: paymentsLoading } = useStorePayments(page, PAGE_SIZE, reloadKey);

  useEffect(() => {
    setPage(1);
  }, [reloadKey]);

  const symbol = summary?.currencySymbol ?? info?.currencySymbol ?? "$";
  // When the API hit its payment-page ceiling the figures describe the most recent N sales, not a
  // whole month — say that rather than mislabelling the window.
  const windowLabel = summary?.truncated ? `Last ${summary.sales} sales` : `Last ${SUMMARY_DAYS} days`;

  const series = (summary?.series ?? []).map((point) => ({
    date: new Date(point.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    revenue: point.revenue,
    sales: point.sales,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Store</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {info?.name ? `${info.name} — recent purchases and revenue` : "Recent purchases and revenue"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <RotateCcw size={13} className={cn(refreshing && "animate-spin")} />
            Refresh
          </Button>
          <RefreshedAt at={refreshedAt} />
        </div>
      </div>

      {summaryError && (
        <Card className="px-5 py-4 flex-row items-center gap-2.5 border-red-500/20 bg-red-500/5">
          <AlertTriangle size={15} className="text-red-400 shrink-0" />
          <span className="text-sm font-mono text-red-400">{summaryError}</span>
        </Card>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: windowLabel,
            value: summaryLoading ? "…" : formatMoney(summary?.revenue ?? 0, symbol),
            icon: <TrendingUp size={13} />,
            color: "text-primary",
          },
          {
            label: "Sales",
            value: summaryLoading ? "…" : (summary?.sales ?? 0),
            icon: <ShoppingCart size={13} />,
            color: "text-blue-400",
          },
          {
            label: "Average Order",
            value: summaryLoading ? "…" : formatMoney(summary?.averageOrder ?? 0, symbol),
            icon: <Receipt size={13} />,
            color: "text-emerald-400",
          },
          {
            label: "Currency",
            value: summary?.currency ?? info?.currency ?? "…",
            icon: <Wallet size={13} />,
            color: "text-amber-400",
          },
        ].map((s) => (
          <Card key={s.label} className="px-4 py-3.5 flex-row items-center gap-3">
            <span className={s.color}>{s.icon}</span>
            <div className="min-w-0">
              <p className="text-lg font-bold font-mono text-foreground leading-none truncate">{s.value}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue over time */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            <CardTitle>Revenue</CardTitle>
          </div>
          <CardDescription>
            Completed payments per day{summary?.truncated ? ", limited to the most recent payments" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summaryLoading || series.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center">
              <p className="text-xs font-mono text-muted-foreground">
                {summaryLoading ? "Loading revenue…" : "No revenue in this window."}
              </p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <AreaChart data={series} margin={{ left: 4, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
                <YAxis width={44} tickLine={false} axisLine={false} tickFormatter={(v) => `${symbol}${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  stroke="var(--color-revenue)"
                  fill="url(#fillRevenue)"
                  strokeWidth={2}
                  isAnimationActive={false}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent purchases */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={13} className="text-primary" />
            <span className="text-xs font-mono text-muted-foreground">
              <span className="text-foreground font-semibold">{totalElements}</span> purchases
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            Page {page} / {totalPages}
          </Badge>
        </div>
        <Separator />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Packages</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Gateway</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-10 text-center text-sm font-mono text-muted-foreground">
                  {paymentsLoading ? "Loading purchases…" : "No purchases on record."}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment, i) => (
                <TableRow key={payment.transactionId}>
                  <TableCell>
                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {payment.date ? new Date(payment.date).toLocaleString() : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <PaymentPlayer player={payment.player} seed={(page - 1) * PAGE_SIZE + i} />
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">
                      {payment.packages.length === 0
                        ? "—"
                        : payment.packages.map((pkg) => pkg.name).join(", ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono font-semibold text-foreground whitespace-nowrap">
                      {formatMoney(payment.amount, payment.currencySymbol ?? symbol)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StorePaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs font-mono text-muted-foreground">{payment.gateway ?? "—"}</span>
                  </TableCell>
                </TableRow>
              ))
            )}
            {/* filler rows keep the card height constant across pages */}
            {Array.from({ length: PAGE_SIZE - (payments.length === 0 ? 1 : payments.length) }, (_, i) => (
              <TableRow key={`filler-${i}`} className="hover:bg-transparent">
                <TableCell colSpan={6}>&nbsp;</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <>
            <Separator />
            <div className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalElements)} of {totalElements}
              </span>
              <TablePager page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

/**
 * Tebex can store a non-Minecraft identifier (or none at all), so only link to a player page when
 * the API resolved a real UUID.
 */
function PaymentPlayer({ player, seed }: { player: { id: string | null; name: string | null }; seed: number }) {
  const name = player.name ?? "Unknown";

  const body = (
    <div className="flex items-center gap-2.5">
      <PlayerAvatar initials={initials(name)} seed={seed} />
      <span className="text-sm text-foreground">{name}</span>
    </div>
  );

  return player.id ? <PlayerLink id={player.id} name={name}>{body}</PlayerLink> : body;
}

/** Ticks once a second so "updated Ns ago" stays honest without refetching anything. */
function RefreshedAt({ at }: { at: number }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = Math.max(0, Math.round((Date.now() - at) / 1000));
  const label = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`;

  return <span className="text-[10px] font-mono text-muted-foreground">updated {label} ago</span>;
}
