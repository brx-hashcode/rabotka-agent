@AGENTS.md

## Project conventions

- Structure and libraries mirror `../rabotka-admin` (it is a Vite SPA, this is Next.js — copy patterns, not framework code).
- Import from `src` with `#/…` (shadcn aliases use it too).
- UI: borderless surfaces — `bg-card shadow-soft`, small rounding, flat buttons. No `border` on cards.
- API: one controller per backend controller in `src/lib/api/`, extending `AgentBaseController` (a 401 triggers one single-flight session refresh and a retry).
- Browser calls stay same-origin (`/api/v1/...`); `src/proxy.ts` forwards to `BACKEND_URL` at runtime and turns the `ra_at` cookie into the `Authorization: Bearer` header the backend expects.
- Session: tokens live only in httpOnly cookies (`ra_at`/`ra_rt`), set and cleared by the route handlers in `src/app/session/`. Client JS never sees a token.
- Sign-in is `/auth/sign-in`; in-app links to it are intercepted by `src/app/@modal` into a dialog (full-screen below `md`).
- Run tools via `node_modules/.bin/…`, not npx/pnpm exec.
