import { allowMethods, requireApiKey } from '../_lib/hostinger.js';

// Hostinger's public API doesn't expose shared-hosting file uploads, so this
// endpoint instead triggers the existing GitHub Actions workflow
// (.github/workflows/deploy-hostinger.yml) via workflow_dispatch.
//
// Required env vars (set in Vercel):
//   GITHUB_TOKEN        — fine-grained PAT with `actions:write` on the repo
//   GITHUB_REPO         — "owner/repo"
//   GITHUB_WORKFLOW     — workflow filename, defaults to "deploy-hostinger.yml"
//   GITHUB_REF          — branch/ref to dispatch on, defaults to "main"

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;
  if (!requireApiKey(req, res)) return;

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const workflow = process.env.GITHUB_WORKFLOW || 'deploy-hostinger.yml';
  const ref = process.env.GITHUB_REF || 'main';

  if (!token || !repo) {
    res.status(500).json({
      error:
        'Deploy trigger not configured. Set GITHUB_TOKEN and GITHUB_REPO (owner/repo) in Vercel env.',
    });
    return;
  }

  const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref }),
  });

  if (!response.ok) {
    const data = await response.text();
    res.status(response.status).json({ error: 'GitHub workflow_dispatch failed', data });
    return;
  }

  res.status(202).json({
    status: 'dispatched',
    repo,
    workflow,
    ref,
    runs: `https://github.com/${repo}/actions/workflows/${workflow}`,
  });
}
