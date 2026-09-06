import {useEffect, useState} from "react";
import {Navigate} from "react-router";
import {AlertTriangle, Check, RotateCcw, Save} from "lucide-react";
import {cn, rankAtLeast} from "../../lib/utils";
import logoSrc from "../../public/logo.png";
import {previewMotd, saveMotd} from "../api/motd";
import type {MotdResponse} from "../api/types";
import {useMe} from "../hooks/useMe";
import {useMotd} from "../hooks/useMotd";
import {MinecraftText} from "../components/MinecraftText";
import {Button} from "../components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {Skeleton} from "../components/ui/skeleton";

export function MotdTab() {
  const { me, loading } = useMe();

  // Wait for the rank before deciding — redirecting on a not-yet-loaded `me` would bounce a
  // developer who is allowed in.
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (!rankAtLeast(me?.rank, "DEVELOPER")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <MotdEditor />;
}

function MotdEditor() {
  const { motd, loading, error: loadError } = useMotd();

  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [saved, setSaved] = useState<{ line1: string; line2: string } | null>(null);
  const [preview, setPreview] = useState<MotdResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!motd) return;
    setLine1(motd.line1);
    setLine2(motd.line2);
    setSaved({ line1: motd.line1, line2: motd.line2 });
    setPreview(motd);
    setPreviewError(motd.error ?? null);
  }, [motd]);

  useEffect(() => {
    if (!motd) return;
    let cancelled = false;
    const handle = setTimeout(() => {
      previewMotd(line1, line2)
        .then((result) => {
          if (cancelled) return;
          setPreview(result);
          setPreviewError(result.error ?? null);
        })
        .catch(() => {
          if (!cancelled) setPreviewError("Could not reach the server to render a preview.");
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [line1, line2, motd]);

  const dirty = saved !== null && (line1 !== saved.line1 || line2 !== saved.line2);

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      const result = await saveMotd(line1, line2);
      if (result.error) {
        setPreviewError(result.error);
        setStatus({ ok: false, message: "Not saved — fix the formatting error first." });
      } else {
        setLine1(result.line1);
        setLine2(result.line2);
        setSaved({ line1: result.line1, line2: result.line2 });
        setPreview(result);
        setPreviewError(null);
        setStatus({ ok: true, message: "Saved. The server list is showing this now." });
      }
    } catch {
      setStatus({ ok: false, message: "Save failed — the proxy did not respond." });
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (!saved) return;
    setLine1(saved.line1);
    setLine2(saved.line2);
    setStatus(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight text-foreground">MOTD Editor</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          The two lines shown next to the server in the Minecraft server list
        </p>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle size={14} />
          {loadError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Message</CardTitle>
          <CardDescription>
            Formatted with MiniMessage — for example <code className="font-mono">&lt;bblue&gt;</code>,{" "}
            <code className="font-mono">&lt;bold&gt;</code> or{" "}
            <code className="font-mono">&lt;gradient:#5eead4:#3b82f6&gt;</code>. Each line is edited separately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="motd-line-1" className="text-xs font-mono text-muted-foreground">
                  Line 1
                </Label>
                <Input
                  id="motd-line-1"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  className="font-mono text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="motd-line-2" className="text-xs font-mono text-muted-foreground">
                  Line 2
                </Label>
                <Input
                  id="motd-line-2"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  className="font-mono text-[13px]"
                />
              </div>
            </>
          )}

          {previewError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-mono text-destructive">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span className="min-w-0 break-words">{previewError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Preview</CardTitle>
          <CardDescription>Rendered by the proxy with the server's own parser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-[#161616] p-3 flex items-start gap-3">
            <img src={logoSrc} alt="" className="w-12 h-12 rounded shrink-0 object-contain" />
            <div className="min-w-0 text-[13px] leading-snug text-white">
              <div className="truncate">
                {preview?.rendered1 ? (
                  <MinecraftText component={preview.rendered1} />
                ) : (
                  <span className="text-white/30">—</span>
                )}
              </div>
              <div className="truncate">
                {preview?.rendered2 ? <MinecraftText component={preview.rendered2} /> : " "}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={!dirty || saving || previewError !== null}>
          <Save size={14} />
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="ghost" onClick={handleReset} disabled={!dirty || saving}>
          <RotateCcw size={14} />
          Reset
        </Button>
        {status && (
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs font-mono",
              status.ok ? "text-primary" : "text-destructive"
            )}
          >
            {status.ok ? <Check size={13} /> : <AlertTriangle size={13} />}
            {status.message}
          </span>
        )}
      </div>
    </div>
  );
}
