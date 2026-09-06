# CLAUDE.md
 
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (Vite)
pnpm build      # Production build
```

No lint, type-check, or test scripts are configured.

## Architecture

This is a Figma-generated Minecraft server management dashboard. It was originally mock-data-driven, but now reads real data from the `static-api` backend.

### Entry points

- `src/main.tsx` — mounts the React app
- `src/app/App.tsx` — a thin shell: page layout, top bar, and the `<Routes>` table. It holds no business logic or data.

### Layering

Data flows in one direction, and each tab reads only through a hook:

- `src/app/tabs/*` — one component per route (`DashboardTab`, `PlayersTab`, `PunishmentsTab`, `ChatTab`, `MotdTab`).
- `src/app/hooks/use*.ts` — hand-rolled `useState`/`useEffect` fetch hooks, each with a `cancelled` flag so a unmounted component never sets state. There is no React Query/SWR. Tabs must go through these rather than calling `api/` directly.
- `src/app/api/*.ts` — thin per-endpoint wrappers over `apiFetch` (GET) and `apiSend` (POST/PUT/PATCH/DELETE) from `api/client.ts`, which owns the base URL, the Clerk bearer token, and 401 handling. Response shapes live in `api/types.ts`.
- `src/app/components/Sidebar.tsx` — exports `NAV_ITEMS`, the single source of navigation truth. `App.tsx` also reads it to resolve the breadcrumb label, so filter it at render time rather than mutating the export.

### Roles

`useMe().rank` is a `StaffPosition` tier from the API (`STAFF < MOD < ADMIN < MANAGER < DEVELOPER < OWNER`). Compare tiers with `rankAtLeast()` from `src/lib/utils.ts`; a `NAV_ITEMS` entry can set `minRank` to hide itself from lower tiers.

Frontend gating is UX only — it decides what the UI offers, never what is permitted. The API enforces access with `@PreAuthorize`, so any role-restricted tab must have a correspondingly restricted endpoint behind it.

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
