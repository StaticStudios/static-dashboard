# Repository agent instructions — static-dashboard-2

**Read [`CLAUDE.md`](CLAUDE.md) first — it is the canonical guidance for this repository.**
This file exists so agents that look for `AGENTS.md` find their way there; keep the detail in
`CLAUDE.md` and do not duplicate it here.

Summary of what that file covers: a Figma-generated Minecraft server management dashboard built
with React 19, Vite, Tailwind v4, and shadcn/ui, reading real data from the `static-api` backend.

The rules most often gotten wrong:

- **Layering is one-directional.** `tabs/*` → `hooks/use*.ts` → `api/*.ts` → `api/client.ts`.
  A tab never calls `api/` directly, and the hooks are hand-rolled `useState`/`useEffect` fetches
  with a `cancelled` flag — there is no React Query or SWR to reach for.
- **Role gating in the UI is UX only.** `rankAtLeast()` and a `NAV_ITEMS` `minRank` decide what the
  interface offers, never what is permitted. Any role-restricted tab needs a correspondingly
  restricted endpoint behind it in `static-api`.
- **The shadcn/ui primitives in `src/app/components/ui/` are copied into the repo, not imported
  from a package.** Extend them in place; do not replace them with external imports.
- **Commands are `pnpm dev` and `pnpm build`.** There is no lint, type-check, or test script, so
  a production build is the only automated check available.

`guidelines/Guidelines.md` is an unfilled Figma template, not active guidance.
