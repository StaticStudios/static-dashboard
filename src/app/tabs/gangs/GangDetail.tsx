import {useLocation, useNavigate, useParams} from "react-router";
import {ArrowLeft, Calendar, Coins, Landmark, Pickaxe, Swords, TrendingUp, Trophy} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {PlayerLink} from "../../components/PlayerLink";
import {Timestamp} from "../../components/Timestamp";
import {num, StatCard, StatRow} from "../../components/StatBlocks";
import {MembersCard, SettingsCard, WarpsCard} from "../../components/GroupCards";
import {useGangProfile} from "../../hooks/useGangs";

const FLAG_LABELS: Record<string, string> = {
  allow_visitors: "Allow Visitors",
  allow_member_invites: "Member Invites",
};

export function GangDetail() {
  const { gangId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading } = useGangProfile(gangId);
  const seedName = (location.state as { name?: string } | null)?.name;
  const name = profile?.name ?? seedName ?? "…";
  const owner = profile?.owner ?? null;
  const totalContributed = profile?.members.reduce((sum, member) => sum + member.contributedBlocks, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate("/gangs")}>
          <ArrowLeft size={15} />
        </Button>
        <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
          <Swords size={16} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold font-display tracking-tight text-foreground leading-none">{name}</h1>
          <p className="text-[11px] font-mono text-muted-foreground mt-1 truncate">{gangId}</p>
        </div>
      </div>

      {!loading && !profile ? (
        <Card className="px-5 py-14 text-center text-sm font-mono text-muted-foreground">Gang not found.</Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
          <div className="space-y-6">
            {/* Money-style tiles get extra width so large numbers aren't truncated; Level is always short. */}
            <div className="grid grid-cols-2 lg:grid-cols-[1.2fr_0.6fr_1.2fr_1.2fr_1.6fr] gap-3">
              <StatCard icon={<Trophy size={16} />} label="Gang Points" value={profile ? num(profile.points) : "…"} />
              <StatCard icon={<TrendingUp size={16} />} label="Level" value={profile ? profile.level : "…"} />
              <StatCard icon={<Landmark size={16} />} label="Bank Money" value={profile ? num(profile.bankMoneyBalance) : "…"} />
              <StatCard icon={<Coins size={16} />} label="Bank Tokens" value={profile ? num(profile.bankTokensBalance) : "…"} />
              <StatCard
                icon={<Calendar size={16} />}
                label="Created"
                className="col-span-2 lg:col-span-1"
                value={profile ? <Timestamp value={profile.createdAt} className="text-foreground" /> : "…"}
              />
            </div>

            {loading && !profile ? (
              <Card className="px-5 py-14 text-center text-sm font-mono text-muted-foreground">Loading gang…</Card>
            ) : profile && (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Swords size={14} className="text-amber-400" />
                      <CardTitle>Gang</CardTitle>
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
                      <StatRow label="Level-up Blocks Contributed" value={num(totalContributed)} />
                      <StatRow label="Created" value={<Timestamp value={profile.createdAt} />} />
                    </div>
                  </CardContent>
                </Card>

                <WarpsCard warps={profile.warps} title="Cell Warps" />
              </>
            )}
          </div>

          {/* Right rail */}
          <div className="space-y-6">
            <MembersCard
              members={profile?.members ?? []}
              loading={loading}
              detail={(member) => (
                <span
                  className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground"
                  title="Blocks contributed to level-up tasks"
                >
                  <Pickaxe size={10} />
                  {num(member.contributedBlocks)}
                </span>
              )}
            />
            {profile && <SettingsCard flags={profile.flags} labels={FLAG_LABELS} />}
          </div>
        </div>
      )}
    </div>
  );
}
