const AVATAR_HUES = [155, 210, 265, 30, 340, 185, 50, 300];

export function PlayerAvatar({ initials, seed }: { initials: string; seed: number }) {
  const hue = AVATAR_HUES[seed % AVATAR_HUES.length];
  return (
    <div
      className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold font-mono text-white shrink-0"
      style={{ background: `hsl(${hue} 45% 22%)`, border: `1px solid hsl(${hue} 45% 32%)` }}
    >
      {initials}
    </div>
  );
}
