#!/usr/bin/env bash
# Deploy alecasgari.com static site on VPS
# Usage (on server): bash deploy.sh
# Called by GitHub Actions after SSH

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/home/alecadmin/alecasgari-website}"
REPO_URL="${REPO_URL:-https://github.com/alecasgari/alecasgari-website.git}"
BRANCH="${BRANCH:-main}"
STATIC_CONTAINER="${STATIC_CONTAINER:-alec-website-static}"
CALCULATOR_DIR="${CALCULATOR_DIR:-/home/alecadmin/saas-calculator}"
CALCULATOR_CONTAINER="${CALCULATOR_CONTAINER:-alec-calculator-static}"

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

# Legacy PM2 static server (no longer used when alec-website-static container runs)
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete alec-website 2>/dev/null || true
  pm2 delete alec-deploy-webhook 2>/dev/null || true
  pm2 delete static-page-server-0 2>/dev/null || true
  pm2 save 2>/dev/null || true
fi

# Files are volume-mounted into nginx container — git pull is enough.
if docker ps --format '{{.Names}}' | grep -qx "$STATIC_CONTAINER"; then
  log "Static site container $STATIC_CONTAINER is running (files updated via mount)."
else
  log "WARN: $STATIC_CONTAINER not running. Run server setup once (see README)."
fi

if [[ -d "$DEPLOY_DIR/saas-calculator" ]]; then
  log "Syncing SaaS calculator to $CALCULATOR_DIR"
  mkdir -p "$CALCULATOR_DIR"
  rsync -a --delete "$DEPLOY_DIR/saas-calculator/" "$CALCULATOR_DIR/"
  if docker ps --format '{{.Names}}' | grep -qx "$CALCULATOR_CONTAINER"; then
    log "Calculator container $CALCULATOR_CONTAINER is running (files updated via mount)."
  else
    log "WARN: $CALCULATOR_CONTAINER not running — verify NPM mount for calculator.alecasgari.com"
  fi
fi

log "Deploy finished."
log "NPM should forward alecasgari.com → http://${STATIC_CONTAINER}:80"
log "Commit: $(git rev-parse --short HEAD) — $(git log -1 --format=%s)"
