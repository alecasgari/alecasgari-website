#!/usr/bin/env bash
# Deploy alecasgari.com static site on VPS
# Usage (on server): bash deploy.sh
# Called by GitHub Actions after SSH (next step)

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/home/alecadmin/alecasgari-website}"
REPO_URL="${REPO_URL:-https://github.com/alecasgari/alecasgari-website.git}"
BRANCH="${BRANCH:-main}"

log() { echo "==> $*"; }

log "Deploy started ($(date -u +"%Y-%m-%dT%H:%M:%SZ"))"
log "Target: $DEPLOY_DIR (branch: $BRANCH)"

if [[ ! -d "$DEPLOY_DIR/.git" ]]; then
  log "First deploy — cloning $REPO_URL"
  mkdir -p "$(dirname "$DEPLOY_DIR")"
  git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$DEPLOY_DIR"
else
  log "Pulling latest from origin/$BRANCH"
  cd "$DEPLOY_DIR"
  git fetch origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
  git clean -fd
fi

cd "$DEPLOY_DIR"

# Stop old Astro/PM2 site (migration from gullible-giant stack)
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete alec-website 2>/dev/null || true
  pm2 delete alec-deploy-webhook 2>/dev/null || true
  pm2 save 2>/dev/null || true
  log "Old PM2 website processes removed (if any)"
fi

log "Deploy finished."
log "NPM must serve static files from: $DEPLOY_DIR"
log "Commit: $(git rev-parse --short HEAD) — $(git log -1 --format=%s)"
