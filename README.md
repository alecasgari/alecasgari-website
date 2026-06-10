# alecasgari.com — Static Site

Deploy on server: run `./deploy.sh` (or GitHub Actions — step 4).

| Item | Value |
|------|--------|
| GitHub | `https://github.com/alecasgari/alecasgari-website` |
| Branch | `main` |
| Server path | `/home/alecadmin/alecasgari-website` |

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
- `images/projects/`, `images/blog/` — content images
