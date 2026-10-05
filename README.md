# rabotka-agent

Field-agent platform for Rabotka. Agents sign in with email + OTP and work
against the backend's `agent/*` API.

Next.js 16 (App Router) with the same structure and core stack as
`rabotka-admin`: Tailwind 4 + shadcn (radix / base-ui), TanStack Query & Table,
react-hook-form + zod, nuqs, zustand, sonner, `mvc-front-sdk` for API
controllers.

## Getting started

```bash
cp .env.example .env   # set BACKEND_URL
pnpm install
pnpm dev               # http://localhost:3400
```

| Variable      | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `BACKEND_URL` | rabotka-backend origin, no trailing slash. Read at runtime.    |
| `PORT`        | Port for the Docker container (dev scripts pin 3400).          |

The browser only ever calls `/api/...` on its own origin; `src/proxy.ts`
forwards those requests to `BACKEND_URL`.

## Scripts

| Script      | Does                          |
| ----------- | ----------------------------- |
| `dev`       | Next dev server on :3400      |
| `build`     | Production build (standalone) |
| `start`     | Serve the build on :3400      |
| `lint`      | ESLint                        |
| `typecheck` | `tsc --noEmit`                |
| `test`      | Vitest                        |

## Layout

```
src/
  app/          routes, layout, globals.css, providers/
  components/   shared components; ui/ holds shadcn primitives
  config/       appConfig (apiUrl, pagination…)
  features/     one folder per feature (auth, leads, wallet…)
  hooks/        React Query hooks
  lib/          utils; api/ holds one controller per backend controller
  stores/       zustand stores
  env.ts        validated server env
  proxy.ts      /api/* → BACKEND_URL
```

Add shadcn components with `node_modules/.bin/shadcn add <name>`.

## Docker

`Dockerfile` builds the Next standalone server. `docker-compose.prod.yml` runs
the GHCR image behind Traefik on `AGENT_DOMAIN`.
