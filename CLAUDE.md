@AGENTS.md

## Project conventions

- Structure and libraries mirror `../rabotka-admin` (it is a Vite SPA, this is Next.js — copy patterns, not framework code).
- Import from `src` with `#/…` (shadcn aliases use it too).
- UI: borderless surfaces — `bg-card shadow-soft`, small rounding, flat buttons. No `border` on cards.
- API: one controller per backend controller in `src/lib/api/`, extending `AgentBaseController`. Agent auth is a bearer token (no cookie, no CSRF).
- Browser calls stay same-origin (`/api/v1/...`); `src/proxy.ts` forwards to `BACKEND_URL` at runtime.
- Run tools via `node_modules/.bin/…`, not npx/pnpm exec.
