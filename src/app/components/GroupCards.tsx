import type {ReactNode} from "react";
import {MapPin, Settings2, Users as UsersIcon} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Badge} from "./ui/badge";
import {Separator} from "./ui/separator";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./ui/table";
import {PlayerAvatar} from "./PlayerAvatar";
import {PlayerLink} from "./PlayerLink";
import {Timestamp} from "./Timestamp";
import {StatRow} from "./StatBlocks";
import type {GroupFlag, GroupMember, GroupWarp} from "../api/types";
import {cn, initials} from "../../lib/utils";

/*
 * Cards shared by the detail pages of player groups (Skyblock islands, Prison gangs), which all
 * have an owner plus members, on/off settings, and warps.
 */

/** `some_column_name` / `SOME_ENUM` → "Some Column Name". */
export function titleCase(raw: string): string {
  return raw
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/** Owner first, as the API sends them. `detail` adds a right-aligned value per member. */
export function MembersCard<M extends GroupMember>({
  members,
  loading,
  detail,
}: {
  members: M[];
  loading: boolean;
  detail?: (member: M) => ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UsersIcon size={14} className="text-primary" />
          <CardTitle>Members</CardTitle>
          <Badge variant="secondary" className="text-[10px]">{members.length}</Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-3">
        {members.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground py-2 px-2">{loading ? "Loading…" : "No members."}</p>
        ) : (
          <div className="space-y-1">
            {members.map((member) => {
              const name = member.name ?? member.id;
              return (
                <PlayerLink
                  key={member.id}
                  id={member.id}
                  name={name}
                  className="items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/30 transition-colors w-full"
                >
                  <PlayerAvatar initials={initials(name)} seed={0} skinTextureValue={member.skinTextureValue} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-foreground font-semibold truncate flex items-center gap-1.5">
                      {name}
                      {member.owner && <Badge variant="secondary" className="text-[10px]">Owner</Badge>}
                    </p>
                    {member.online ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Online now
                      </span>
                    ) : (
                      <Timestamp value={member.lastSeen} className="text-[10px]" />
                    )}
                  </div>
                  {detail && <div className="shrink-0">{detail(member)}</div>}
                </PlayerLink>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SettingsCard({ flags, labels }: { flags: GroupFlag[]; labels: Record<string, string> }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 size={14} className="text-primary" />
          <CardTitle>Settings</CardTitle>
        </div>
      </CardHeader>
      <Separator />
      <CardContent>
        {flags.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground py-2">No settings.</p>
        ) : (
          <div className="divide-y divide-border">
            {flags.map((flag) => (
              <StatRow
                key={flag.key}
                label={labels[flag.key] ?? titleCase(flag.key)}
                value={
                  <span className={cn(flag.enabled ? "text-primary" : "text-muted-foreground")}>
                    {flag.enabled ? "On" : "Off"}
                  </span>
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WarpsCard({ warps, title = "Warps" }: { warps: GroupWarp[]; title?: string }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary" />
          <CardTitle>{title}</CardTitle>
          <Badge variant="secondary" className="text-[10px]">{warps.length}</Badge>
        </div>
      </CardHeader>
      <Separator />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Access</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="px-5 py-8 text-center text-xs font-mono text-muted-foreground">
                No warps.
              </TableCell>
            </TableRow>
          ) : (
            warps.map((warp) => (
              <TableRow key={warp.name}>
                <TableCell>
                  <span className="flex items-center gap-1.5 text-xs font-mono text-foreground">
                    {warp.name}
                    {warp.primary && <Badge variant="secondary" className="text-[10px]">Primary</Badge>}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono text-muted-foreground">
                    {warp.x}, {warp.y}, {warp.z}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn("text-xs font-mono", warp.isPublic ? "text-primary" : "text-muted-foreground")}>
                    {warp.isPublic ? "Public" : "Private"}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
