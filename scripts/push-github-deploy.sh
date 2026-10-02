#!/usr/bin/env bash
# Push PropPilot to GitHub realtoragent and optionally deploy to Vercel.
# Requires: GITHUB_TOKEN (repo scope) in the environment.
set -euo pipefail

REPO="${GITHUB_REPOSITORY:-ziaullaharqam1/realtoragent}"
BRANCH_LOCAL="${1:-main}"
REMOTE_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO}.git"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "GITHUB_TOKEN is not set. Create a PAT with repo contents:write and export it." >&2
  exit 1
fi

cd "$(dirname "$0")/.."
git remote remove github 2>/dev/null || true
git remote add github "$REMOTE_URL"
git push -u github "${BRANCH_LOCAL}:main"

echo "Pushed ${BRANCH_LOCAL} → https://github.com/${REPO} (main)"

if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  cd apps/ai-agent
  npx vercel link --yes --token "$VERCEL_TOKEN" --project realtoragent || true
  npx vercel --prod --yes --token "$VERCEL_TOKEN"
else
  echo "VERCEL_TOKEN unset — connect https://github.com/${REPO} in the Vercel dashboard (Root Directory: apps/ai-agent), or set VERCEL_TOKEN and re-run."
fi
