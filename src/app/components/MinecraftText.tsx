import type {MinecraftComponent} from "../api/types";

/** The 16 legacy Minecraft colours, as named by Adventure's gson serializer. */
const NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  dark_blue: "#0000aa",
  dark_green: "#00aa00",
  dark_aqua: "#00aaaa",
  dark_red: "#aa0000",
  dark_purple: "#aa00aa",
  gold: "#ffaa00",
  gray: "#aaaaaa",
  dark_gray: "#555555",
  blue: "#5555ff",
  green: "#55ff55",
  aqua: "#55ffff",
  red: "#ff5555",
  light_purple: "#ff55ff",
  yellow: "#ffff55",
  white: "#ffffff",
};

interface Style {
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
}

function resolveColor(color?: string): string | undefined {
  if (!color) return undefined;
  return color.startsWith("#") ? color : NAMED_COLORS[color.toLowerCase()];
}

function Node({ node, inherited }: { node: MinecraftComponent; inherited: Style }) {
  // Adventure omits styles a child doesn't override, so they cascade from the parent.
  const style: Style = {
    color: node.color ?? inherited.color,
    bold: node.bold ?? inherited.bold,
    italic: node.italic ?? inherited.italic,
    underlined: node.underlined ?? inherited.underlined,
    strikethrough: node.strikethrough ?? inherited.strikethrough,
    obfuscated: node.obfuscated ?? inherited.obfuscated,
  };

  const decoration = [style.underlined ? "underline" : null, style.strikethrough ? "line-through" : null]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      style={{
        color: resolveColor(style.color),
        fontWeight: style.bold ? 700 : undefined,
        fontStyle: style.italic ? "italic" : undefined,
        textDecoration: decoration || undefined,
        // The real client animates obfuscated text; a blur reads the same at a glance.
        filter: style.obfuscated ? "blur(3px)" : undefined,
      }}
    >
      {node.text}
      {node.extra?.map((child, i) => (
        <Node key={i} node={typeof child === "string" ? { text: child } : child} inherited={style} />
      ))}
    </span>
  );
}

/** Renders an Adventure component tree as nested spans, matching how the client would draw it. */
export function MinecraftText({ component, className }: { component: MinecraftComponent; className?: string }) {
  return (
    <span className={className}>
      <Node node={component} inherited={{}} />
    </span>
  );
}
