# alecasgari.com — Static Site

Deploy on server: run `./deploy.sh` (or GitHub Actions on push to `main`).

| Item | Value |
|------|--------|
| GitHub | `https://github.com/alecasgari/alecasgari-website` |
| Branch | `main` |
| Server path | `/home/alecadmin/alecasgari-website` |
| NPM (main) | `alecasgari.com` → `http://alec-website-static:80` |
| NPM (calculator) | `calculator.alecasgari.com` → calculator folder root (see `deploy/nginx-calculator.conf`) |

Optional SEO URL redirects: see `deploy/nginx-url-redirects.conf` (apply on VPS nginx, then reload). After n8n publishes posts or projects, run:

```bash
node scripts/rebuild-sitemaps.js
```

## Preview
```bash
cd alecasgari-website && python -m http.server 8080
```

## Structure
- `*.html` — main pages (about, contact, projects list, etc.)
- `projects/{slug}.html` — project pages (n8n adds here)
- `blog/{slug}.html` — blog posts (n8n adds here)
- `data/*.json` — indexes for n8n
- `assets/` — CSS, JS, theme images
- `calculator/` — SaaS cost calculator (canonical: `https://calculator.alecasgari.com/`)
- `images/projects/`, `images/blog/` — content images

## Calculator
- Source of truth: `calculator/` in this repo (same push / same GitHub Action).
- Public URL stays `calculator.alecasgari.com` for SEO.
- `alecasgari.com/calculator/` should 301 to the subdomain (`deploy/nginx-url-redirects.conf`).
- Setup notes: `deploy/nginx-calculator.conf`.
