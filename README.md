# alecasgari.com — Static Site

Deploy on server: run `./deploy.sh` (or GitHub Actions — step 4).

| Item | Value |
|------|--------|
| GitHub | `https://github.com/alecasgari/alecasgari-website` |
| Branch | `main` |
| Server path | `/home/alecadmin/alecasgari-website` |
| NPM forwards to | `http://alec-website-static:80` (Docker nginx container) |

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
- `saas-calculator/` — calculator.alecasgari.com (deployed to `/home/alecadmin/saas-calculator`)
- `images/projects/`, `images/blog/` — content images
