# Security Audit — App Foundations

**Result:** Audit completed. No files were changed.

**Context:** The worktree already had unrelated modifications and untracked documents when the audit started.

## Findings by Severity

| # | Severity | File | Lines | Finding | Confidence |
|---|---|---|---|---|---|
| 1 | 🔴 Critical | `api/server.js` | 40-48, 61-80, 103-190 | The API uses `SUPABASE_SERVICE_ROLE_KEY` for all CRUD operations. Authenticated users and callers with `PRIMEOS_API_KEY` can read, insert, update, delete, and filter records across all registered tables. The service role bypasses Supabase RLS, and no tenant/user filter is applied. | 10/10 |
| 2 | 🟠 High | `src/lib/tenantContext.ts` | 9-42 | Tenant selection is controlled by localStorage, accepts arbitrary tenant IDs, and silently falls back to a fixed default tenant. This is not an authorization boundary. | 10/10 |
| 3 | 🟠 High | `src/api/entities/primeos.ts` | 10-56 | The primary entity client performs direct unrestricted Supabase queries and writes without adding `tenant_id`. The tenant helper exists but is not integrated into the entity abstraction, making cross-tenant access likely wherever RLS is incomplete. | 9/10 |
| 4 | 🟠 High | `supabase/migrations/002_rls_policies.sql` | 1-22 | The migration enables RLS only on `users`; it explicitly leaves other application tables without policies. Client-side Supabase access therefore lacks a repository-defined tenant isolation policy for patient, CRM, financial, and appointment data. | 9/10 |
| 5 | 🟠 High | `primeos-api/router.ts` | 31-54, 100-200 | A legacy/duplicate Mongo API accepts `VITE_PRIMEOS_API_KEY` as an authentication secret and enables wildcard CORS. Its authenticated endpoints accept arbitrary Mongo filters and update operators; the empty-filter delete path can wipe the entire appointment collection. | 9/10 |
| 6 | 🟠 High | `src/api/router.ts` | 35-59, 84-90 | The newer duplicate router still allows the API key to come from `VITE_PRIMEOS_API_KEY` and responds with `Access-Control-Allow-Origin: *`. Any Vite-exposed key must be treated as public, so it cannot protect privileged database operations. | 9/10 |
| 7 | 🟡 Medium | `package.json` / `package-lock.json` | — | `npm audit --omit=dev` reports 6 high and 55 moderate production dependency vulnerabilities. High findings include OpenTelemetry denial-of-service advisories and vulnerable Genkit dependency chains. | 9/10 |
| 8 | 🟡 Medium | `.github/workflows/generate-api-key.yml` | 36-61 | The workflow prints the generated API key into GitHub Actions logs and stores it in a step output. Anyone with sufficient workflow-log access may retrieve the key. | 10/10 |
| 9 | ⚪ Low | `api/server.js`, `primeos-api/router.ts` | various | Several handlers return raw database/error messages to clients, which can disclose schema details and operational information. | 8/10 |

## Validation

- ✅ `npm run lint`
- ✅ `npm run typecheck`
- ✅ `npm test`
- ✅ `npm run build` — passed, but emits a warning because `NODE_ENV=production` is present in an environment file; the production bundle still completes successfully.

## Worktree Notes

- Existing changes include `.agents` skill files, `.mcp.json`, and `src/lib/supabase.ts`.
- Untracked tenant SQL, Markdown, and XLSX files are present.
- Local `.env` files are present but git-ignored; their contents were not exposed or modified.

## Suggested Fix Priority

1. Remove/scope down `SUPABASE_SERVICE_ROLE_KEY` usage in `api/server.js`; enforce per-tenant/user filtering server-side.
2. Replace localStorage-based tenant selection in `src/lib/tenantContext.ts` with a server-validated tenant/session claim.
3. Integrate the tenant helper into `src/api/entities/primeos.ts` so all Supabase queries/writes are tenant-scoped.
4. Extend RLS policies in `supabase/migrations/002_rls_policies.sql` to cover all application tables, not just `users`.
5. Retire or lock down the legacy Mongo API in `primeos-api/router.ts` (remove wildcard CORS, disallow arbitrary filters/empty-filter deletes).
6. Stop relying on `VITE_PRIMEOS_API_KEY` for auth in `src/api/router.ts`; treat any Vite-exposed value as public and restrict CORS.
7. Run `npm audit fix` / dependency upgrades for the flagged OpenTelemetry and Genkit vulnerabilities.
8. Remove API key printing from `.github/workflows/generate-api-key.yml` logs/step outputs; mark the value as a secret.
9. Sanitize error responses in `api/server.js` and `primeos-api/router.ts` to avoid leaking schema/internal details.
