# PrimeOS - Primeodontologia

## Project overview
Website: primeos.primeodontologia.com.br
Hosted on: Hostinger (shared) — deployed from Vercel preview / GitHub Actions
Stack: React + Vite, Supabase, Vercel serverless functions

This repository combines a Vite/React frontend with Vercel-compatible API routes in `api/`. Static assets are built locally and deployed to Hostinger by FTP.

## Key directories
- `src/` — frontend application and UI code
- `api/` — Vercel serverless function endpoints
- `api/hostinger/` — Hostinger integration routes
- `scripts/` — build/postbuild and FTP deploy helpers
- `docs/` — product and technical documentation
- `data/` / `database/` — exported app data and backend models

## Build and local development
- `npm install`
- `npm run dev`
- `npm run build` (runs `vite build` + `scripts/postbuild.mjs`)
- `npm run lint`
- `npm run typecheck`
- `npm run preview`
- `npm run deploy` (build + FTP deploy via `scripts/deploy.mjs`)

Use `.env.local` for local secrets and reference `.env.example` when adding new variables.

## Deployment and CI
- Static app builds are produced by `vite build` and published by FTP.
- Vercel serverless endpoints support runtime API calls from the frontend.
- CI/workflow files live in `.github/workflows/ci.yml` and `.github/workflows/deploy-hostinger.yml`.

## Hostinger API integration
The Hostinger API is accessed through Vercel endpoints in `api/hostinger/`.

- Base URL: [https://developers.hostinger.com](https://developers.hostinger.com)
- Hostinger auth: Bearer token from `HOSTINGER_API_TOKEN`

Server-side Vercel endpoints:
- `GET  /api/hostinger`               — index of available endpoints
- `GET  /api/hostinger/domains`       — list domain portfolio
- `GET  /api/hostinger/dns/{domain}`  — read DNS zone
- `PUT  /api/hostinger/dns/{domain}`  — replace DNS zone (body: `{ zone: [...] }`)
- `GET  /api/hostinger/vps`           — list VPS / virtual machines
- `POST /api/hostinger/deploy`        — trigger GitHub Actions FTP deploy

All Hostinger endpoints require the request header `x-primeos-key: $PRIMEOS_API_KEY`.

## Environment variables
Server / Vercel:
- `HOSTINGER_API_TOKEN` — Hostinger developer token
- `PRIMEOS_API_KEY`     — shared secret for `/api/hostinger/*`
- `GITHUB_TOKEN`        — fine-grained PAT with `actions:write` (only for deploy)
- `GITHUB_REPO`         — repo slug `owner/repo` (only for deploy)

Local FTP deploy:
- `FTP_PASSWORD` — used by `scripts/deploy.mjs`

> Do not hardcode secrets. MCP configuration lives in `.mcp.json` and reads `HOSTINGER_API_TOKEN` from the process environment.

## Notes for AI agents
- Preserve Hostinger header/auth conventions when changing API routes.
- Avoid hardcoding sensitive values in code or docs.
- Prefer linking to existing documentation instead of copying it.
- If you need product details, see `docs/PRIMEOS_APP.md`.
- `.openclaw/AGENTS.md` is agent-runtime metadata for OpenClaw integration; do not modify it unless explicitly asked.

## Common tasks
- Read/manage DNS records  → `/api/hostinger/dns/{domain}`
- Check VPS / hosting state → `/api/hostinger/vps`
- Trigger deploy           → `POST /api/hostinger/deploy` (or `npm run deploy` locally)

## References
- Root README: [README.md](README.md)
- Product docs: [docs/PRIMEOS_APP.md](docs/PRIMEOS_APP.md)
- Hostinger deploy workflow: `.github/workflows/deploy-hostinger.yml`
- CI workflow: `.github/workflows/ci.yml`
