# CLAUDE.md
 
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (Vite)
pnpm build      # Production build
```

No lint, type-check, or test scripts are configured.

## Architecture

This is a Figma-generated Minecraft server management dashboard — a purely frontend, mock-data-driven React app with no backend.

### Entry points

- `src/main.tsx` — mounts the React app
- `src/app/App.tsx` — ~1000-line monolithic component containing all application logic: sidebar navigation, Dashboard tab (server metrics, player counts, punishments summary), Punishments tab (filterable history), and Chat tab (live in-game feed). All mock data (`PUNISHMENTS`, `CHAT_MESSAGES`, etc.) lives directly in this file.

### UI components

`src/app/components/ui/` holds 48 shadcn/ui primitives (copied into the repo, not imported from a package). These are Radix UI headless components styled with Tailwind. Do not replace them with external imports — extend them in place following the existing pattern.

`src/app/components/figma/ImageWithFallback.tsx` is a thin wrapper for images that gracefully falls back when assets are missing.

### Styling

- Tailwind CSS v4 (configured via `@tailwindcss/vite`, not a `tailwind.config.js`)
- `src/styles/theme.css` — CSS custom properties defining the dark-mode color tokens (only dark theme is defined)
- `src/styles/tailwind.css` — imports Tailwind layers and `tw-animate-css`
- `src/styles/index.css` — aggregates all CSS imports
- `src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge) — use this for all conditional className composition

### Vite config

`vite.config.ts` includes a custom `figmaAssetResolver()` plugin that resolves `figma:asset/<filename>` virtual imports to actual assets in `src/`. Path alias `@` maps to `src/`.

SVG and CSV files are imported as raw strings (`?raw` / `?url` handled automatically).

### Key dependencies

| Purpose | Library |
|---|---|
| Routing | react-router 7 |
| Charts | Recharts |
| Drag & drop | react-dnd + html5 backend |
| Animations | motion (Framer Motion successor) |
| Toasts | sonner |
| Forms | react-hook-form |
| Themes | next-themes |
| Icons | lucide-react |
