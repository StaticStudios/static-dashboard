import { useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./components/ui/button";
import { Separator } from "./components/ui/separator";
import { Tabs, TabsContent } from "./components/ui/tabs";
import { Sidebar, NAV_ITEMS } from "./components/Sidebar";
import { DashboardTab } from "./tabs/DashboardTab";
import { PlayersTab } from "./tabs/PlayersTab";
import { PunishmentsTab } from "./tabs/PunishmentsTab";
import { ChatTab } from "./tabs/ChatTab";
import { usePlayerCounts } from "./hooks/usePlayerCounts";
import type { TabKey } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const counts = usePlayerCounts();

  return (
    <div
      className="flex h-screen bg-background overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        .font-display { font-family: 'Exo 2', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Mobile overlay */}
      {mobileSidebar && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* Sidebar – desktop */}
      <div className="hidden lg:flex">
        <Sidebar active={activeTab} onNavigate={setActiveTab} />
      </div>

      {/* Sidebar – mobile drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out lg:hidden",
          mobileSidebar ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar active={activeTab} onNavigate={setActiveTab} onClose={() => setMobileSidebar(false)} />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 border-b border-border bg-card/60 backdrop-blur-sm px-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileSidebar(true)}
            >
              <Menu size={16} />
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="text-primary">/</span>
              <span>{NAV_ITEMS.find((n) => n.key === activeTab)?.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-semibold hidden sm:inline">{counts?.proxy ?? "…"}</span>
              <span className="text-muted-foreground hidden sm:inline">online</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs font-mono text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-5 md:p-8">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
              <TabsContent value="dashboard"><DashboardTab /></TabsContent>
              <TabsContent value="players"><PlayersTab /></TabsContent>
              <TabsContent value="punishments"><PunishmentsTab /></TabsContent>
              <TabsContent value="chat"><ChatTab /></TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
