import {useLocation, useNavigate, useParams} from "react-router";
import {ArrowLeft, Calendar, Gem, Home, Landmark, TrendingUp, Users as UsersIcon, Wrench} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {PlayerLink} from "../../components/PlayerLink";
import {Timestamp} from "../../components/Timestamp";
import {num, StatCard, StatRow} from "../../components/StatBlocks";
import {MembersCard, SettingsCard, titleCase, WarpsCard} from "../../components/GroupCards";
import {useIslandProfile} from "../../hooks/useIslands";

/** Display names for `island_upgrades` columns; unknown keys fall back to a prettified column name. */
const UPGRADE_LABELS: Record<string, string> = {
  additional_island_member_limit: "Member Limit",
  additional_island_border_radius: "Border Radius",
  mining_level: "Mining Level",
  additional_value_sink_amount: "Value Sink Multiplier",
  additional_hopper_limit: "Hopper Limit",
  additional_dispenser_limit: "Dispenser Limit",
  additional_available_island_chests: "Island Chests",
  additional_max_spawner_count: "Spawner Count",
  additional_max_spawner_stack_size: "Spawner Stack Size",
  additional_spawner_player_radius: "Spawner Radius",
  additional_island_warp_limit: "Warp Limit",
  additional_robot_limit: "Robot Limit",
  additional_power_generator_limit: "Power Generators",
};

const FLAG_LABELS: Record<string, string> = {
  allow_visitors: "Allow Visitors",
  allow_member_invites: "Member Invites",
  allow_pvp: "PvP",
  chunk_hoppers_pickup_on_player_drop: "Hoppers: Player Drops",
  chunk_hoppers_pickup_on_mob_drop: "Hoppers: Mob Drops",
  chunk_hoppers_pickup_on_other_drop: "Hoppers: Other Drops",
};

/** Mining level is an absolute level; every other upgrade column is added on top of a config default. */
function formatUpgrade(key: string, amount: number): string {
  if (key === "mining_level") return String(amount);
  const shown = Number.isInteger(amount) ? num(amount) : amount.toFixed(2);
  return amount > 0 ? `+${shown}` : shown;
}

export function IslandDetail() {
  const { islandId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading } = useIslandProfile(islandId);
  const seedName = (location.state as { name?: string } | null)?.name;
  const name = profile?.name ?? seedName ?? "…";
  const owner = profile?.owner ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate("/islands")}>
          <ArrowLeft size={15} />
        </Button>
        <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
          <Home size={16} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold font-display tracking-tight text-foreground leading-none">{name}</h1>
          <p className="text-[11px] font-mono text-muted-foreground mt-1 truncate">{islandId}</p>
        </div>
      </div>

      {!loading && !profile ? (
        <Card className="px-5 py-14 text-center text-sm font-mono text-muted-foreground">Island not found.</Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <StatCard icon={<Gem size={16} />} label="Island Value" value={profile ? num(profile.value) : "…"} />
              <StatCard icon={<TrendingUp size={16} />} label="Level" value={profile ? profile.level : "…"} />
              <StatCard icon={<Landmark size={16} />} label="Bank" value={profile ? num(profile.bankBalance) : "…"} />
              <StatCard
                icon={<Calendar size={16} />}
                label="Created"
                className="lg:col-span-2"
                value={profile ? <Timestamp value={profile.createdAt} className="text-foreground" /> : "…"}
              />
            </div>

            {loading && !profile ? (
              <Card className="px-5 py-14 text-center text-sm font-mono text-muted-foreground">Loading island…</Card>
            ) : profile && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Home size={14} className="text-blue-400" />
                        <CardTitle>Island</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-border">
                        <StatRow
                          label="Owner"
                          value={
                            owner ? (
                              <PlayerLink id={owner.id} name={owner.name ?? owner.id} className="gap-1.5">
                                {owner.name ?? owner.id}
                              </PlayerLink>
                            ) : (
                              "Unknown"
                            )
                          }
                        />
                        <StatRow label="Type" value={profile.type ? titleCase(profile.type) : "—"} />
                        <StatRow label="Variant" value={profile.variant ? titleCase(profile.variant) : "—"} />
                        <StatRow label="Created" value={<Timestamp value={profile.createdAt} />} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Wrench size={14} className="text-primary" />
                        <CardTitle>Upgrades</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {profile.upgrades.length === 0 ? (
                        <p className="text-xs font-mono text-muted-foreground py-2">No upgrades.</p>
                      ) : (
                        <div className="divide-y divide-border">
                          {profile.upgrades.map((upgrade) => (
                            <StatRow
                              key={upgrade.key}
                              label={UPGRADE_LABELS[upgrade.key] ?? titleCase(upgrade.key)}
                              value={formatUpgrade(upgrade.key, upgrade.amount)}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <WarpsCard warps={profile.warps} />
              </>
            )}
          </div>

          {/* Right rail */}
          <div className="space-y-6">
            <MembersCard members={profile?.members ?? []} loading={loading} />
            {profile && <SettingsCard flags={profile.flags} labels={FLAG_LABELS} />}
          </div>
        </div>
      )}
    </div>
  );
}
