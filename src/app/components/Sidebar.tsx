import type {ReactNode} from "react";
import {useLocation, useNavigate} from "react-router";
import {LayoutDashboard, MessageSquare, Shield, Users, X} from "lucide-react";
import logoSrc from "../../public/logo.png";
import {cn, initials, skinFaceUrl} from "../../lib/utils";
import {Separator} from "./ui/separator";
import {PlayerHead} from "./PlayerHead";
import {usePunishments} from "../hooks/usePunishments";
import {useChatMessageCount} from "../hooks/useChatMessageCount";
import {useMe} from "../hooks/useMe";
import type {TabKey} from "../types";

export const NAV_ITEMS: { key: TabKey; path: string; label: string; icon: ReactNode }[] = [
  { key: "dashboard",   path: "/dashboard",   label: "Dashboard",    icon: <LayoutDashboard size={15} /> },
  { key: "players",     path: "/players",     label: "Players",      icon: <Users size={15} />           },
  { key: "punishments", path: "/punishments", label: "Punishments",  icon: <Shield size={15} />          },
  { key: "chat",        path: "/chat",        label: "In-Game Chat", icon: <MessageSquare size={15} />   },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { totalElements: activePunishments } = usePunishments({ page: 1, limit: 1, status: "active" });
  const chatCount = useChatMessageCount();
  const { me } = useMe();
  const meHeadUrl = skinFaceUrl(me?.skinTextureValue);

  const activeCounts: Record<TabKey, number | null> = {
    dashboard:   null,
    players:     null,
    punishments: activePunishments,
    chat:        chatCount ?? 0,
  };

  return (
    <aside className="flex flex-col h-full w-60 bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Brand */}
      <div className="px-5 h-14 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
            <img src={logoSrc} alt="StaticStudios" className="w-full h-full object-contain" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold font-display text-foreground">StaticStudios</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-mono font-semibold text-muted-foreground/50 uppercase tracking-widest px-2.5 mb-2">
          Menu
        </p>
        {NAV_ITEMS.map(({ key, path, label, icon }) => {
          const isActive = pathname === path || pathname.startsWith(`${path}/`);
          const count = activeCounts[key];
          return (
            <button
              key={key}
              onClick={() => { navigate(path); onClose?.(); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className={cn("transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                  {icon}
                </span>
                <span className="text-[13px] font-medium font-display">{label}</span>
              </div>
              {count !== null && (
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded-md min-w-[22px] text-center",
                  isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <Separator />

      {/* User */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2.5 px-1">
          {meHeadUrl ? (
            <PlayerHead url={meHeadUrl} className="rounded-lg" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-[10px] font-bold font-mono text-primary shrink-0">
              {me ? initials(me.discordUsername) : "…"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-foreground truncate font-medium">{me?.discordUsername ?? "…"}</p>
            <p className="text-[10px] font-mono text-primary leading-none mt-0.5">{me?.role ?? "Staff"}</p>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
        </div>
      </div>
    </aside>
  );
}
