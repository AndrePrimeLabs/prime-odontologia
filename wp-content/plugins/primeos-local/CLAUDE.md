# PrimeOS - Primeodontologia

## Project
Website: primeos.primeodontologia.com.br
Hosted on: Hostinger (shared) — deployed from Vercel preview / GitHub Actions
Stack: React + Vite, Supabase, Vercel serverless functions

## Hostinger API
Base URL: [https://developers.hostinger.com](https://developers.hostinger.com) (path prefix `/api/<service>/v1/...`)
Auth: Bearer token in env as `HOSTINGER_API_TOKEN`

Server-side endpoints exposed via Vercel:
- `GET  /api/hostinger`               — index of available endpoints
- `GET  /api/hostinger/domains`       — list domain portfolio
- `GET  /api/hostinger/dns/{domain}`  — read DNS zone
- `PUT  /api/hostinger/dns/{domain}`  — replace DNS zone (body: `{ zone: [...] }`)
- `GET  /api/hostinger/vps`           — list VPS / virtual machines
- `POST /api/hostinger/deploy`        — trigger GitHub Actions FTP deploy

All endpoints require header `x-primeos-key: $PRIMEOS_API_KEY`.

## Required env vars
Server (Vercel):
- `HOSTINGER_API_TOKEN` — Hostinger developer token
- `PRIMEOS_API_KEY`     — shared secret for `/api/hostinger/*`
- `GITHUB_TOKEN`        — fine-grained PAT, `actions:write` (only for /deploy)
- `GITHUB_REPO`         — `owner/repo` (only for /deploy)

Local FTP deploy (`scripts/deploy.mjs`):
- `FTP_PASSWORD` — used by ftp-deploy

## Common Tasks
- Read/manage DNS records  → `/api/hostinger/dns/{domain}`
- Check VPS / hosting state → `/api/hostinger/vps`
- Trigger deploy           → `POST /api/hostinger/deploy` (or `npm run deploy` locally)

## Notes
- Hostinger's public API has no shared-hosting file-upload endpoint. Static-site
  deploys go through FTP — see `scripts/deploy.mjs` and `.github/workflows/deploy-hostinger.yml`.
- MCP configuration lives in `.mcp.json` and reads `HOSTINGER_API_TOKEN` from
  the process environment — do not hardcode tokens there.
