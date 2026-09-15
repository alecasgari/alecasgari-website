/**
 * Rebuild sitemap-*.xml from data/blog.json + data/projects.json.
 * Also injects crawlable <noscript> link lists into blog.html and projects.html.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TODAY = new Date().toISOString().slice(0, 10);
const ORIGIN = "https://alecasgari.com";

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function urlset(urls) {
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function lastmodFromFile(rel) {
  const p = path.join(ROOT, rel);
  try {
    return fs.statSync(p).mtime.toISOString().slice(0, 10);
  } catch {
    return TODAY;
  }
}

function isStub(htmlPath) {
  if (!fs.existsSync(htmlPath)) return true;
  const html = fs.readFileSync(htmlPath, "utf8");
  return /http-equiv=["']refresh["']/.test(html) || /location\.replace\(/.test(html);
}

const blogs = JSON.parse(fs.readFileSync(path.join(ROOT, "data/blog.json"), "utf8"));
const projects = JSON.parse(fs.readFileSync(path.join(ROOT, "data/projects.json"), "utf8"));

const blogUrls = blogs.map((p) => ({
  loc: `${ORIGIN}${p.url.startsWith("/") ? p.url : "/" + p.url}`,
  lastmod: (p.date || "").slice(0, 10) || lastmodFromFile(path.join("blog", path.basename(p.url))),
}));

const projectUrls = projects
  .filter((p) => {
    const file = path.join(ROOT, "projects", `${p.slug}.html`);
    return !isStub(file);
  })
  .map((p) => ({
    loc: `${ORIGIN}/projects/${p.slug}.html`,
    lastmod: (p.date || "").slice(0, 10) || lastmodFromFile(path.join("projects", `${p.slug}.html`)),
  }));

const pageUrls = [
  { loc: `${ORIGIN}/`, lastmod: lastmodFromFile("index.html") },
  { loc: `${ORIGIN}/about.html`, lastmod: lastmodFromFile("about.html") },
  { loc: `${ORIGIN}/case-studies.html`, lastmod: lastmodFromFile("case-studies.html") },
  { loc: `${ORIGIN}/projects.html`, lastmod: lastmodFromFile("projects.html") },
  { loc: `${ORIGIN}/blog.html`, lastmod: lastmodFromFile("blog.html") },
  { loc: `${ORIGIN}/contact.html`, lastmod: lastmodFromFile("contact.html") },
  { loc: `${ORIGIN}/privacy-policy.html`, lastmod: lastmodFromFile("privacy-policy.html") },
  { loc: `${ORIGIN}/case-studies/ai-lead-vetting-spring-future.html`, lastmod: lastmodFromFile("case-studies/ai-lead-vetting-spring-future.html") },
  { loc: `${ORIGIN}/case-studies/dfisx-tech-summit.html`, lastmod: lastmodFromFile("case-studies/dfisx-tech-summit.html") },
  { loc: `${ORIGIN}/case-studies/erp-migration-pharmatech.html`, lastmod: lastmodFromFile("case-studies/erp-migration-pharmatech.html") },
  { loc: `${ORIGIN}/case-studies/vesta-profit-center.html`, lastmod: lastmodFromFile("case-studies/vesta-profit-center.html") },
];

fs.writeFileSync(path.join(ROOT, "sitemap-blog.xml"), urlset(blogUrls));
fs.writeFileSync(path.join(ROOT, "sitemap-projects.xml"), urlset(projectUrls));
fs.writeFileSync(path.join(ROOT, "sitemap-pages.xml"), urlset(pageUrls));
fs.writeFileSync(
  path.join(ROOT, "sitemap-calculator.xml"),
  urlset([{ loc: "https://calculator.alecasgari.com/", lastmod: TODAY }])
);
fs.writeFileSync(
  path.join(ROOT, "sitemap-index.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${ORIGIN}/sitemap-pages.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${ORIGIN}/sitemap-projects.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${ORIGIN}/sitemap-blog.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${ORIGIN}/sitemap-calculator.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>
`
);

function noscriptList(items) {
  const lis = items
    .map((item) => `      <li><a href="${xmlEscape(item.href)}">${xmlEscape(item.title)}</a></li>`)
    .join("\n");
  return `    <noscript>
    <ul class="seo-fallback-list">
${lis}
    </ul>
    </noscript>
`;
}

function injectNoscript(file, markerId, html) {
  let src = fs.readFileSync(file, "utf8");
  src = src.replace(/\s*<noscript>\s*<ul class="seo-fallback-list">[\s\S]*?<\/ul>\s*<\/noscript>\s*/g, "\n");
  if (!src.includes(markerId)) {
    console.warn("marker missing", markerId, file);
    return;
  }
  src = src.replace(markerId, markerId + "\n" + html);
  fs.writeFileSync(file, src);
}

function cardMarkup(item, imageKey) {
  const href = xmlEscape(item.href);
  const title = xmlEscape(item.title);
  const img = xmlEscape(item.image || "");
  const cat = xmlEscape(item.category || "");
  const excerpt = xmlEscape(item.excerpt || "");
  return `      <article class="project-card-item"><a href="${href}" class="project-card-link"><div class="project-card"><img src="${img}" alt="${title}" class="project-card-thumb" width="720" height="405" loading="lazy" decoding="async"><div class="project-card-body"><span class="project-tag">${cat}</span><h3>${title}</h3><p>${excerpt}</p></div></div></a></article>`;
}

function injectGrid(file, gridId, cards) {
  let src = fs.readFileSync(file, "utf8");
  src = src.replace(/\s*<noscript>\s*<ul class="seo-fallback-list">[\s\S]*?<\/ul>\s*<\/noscript>\s*/g, "\n");
  const open = `<div id="${gridId}" class="stagger">`;
  const start = src.indexOf(open);
  if (start < 0) {
    console.warn("grid missing", gridId, file);
    return;
  }
  let i = start + open.length;
  let depth = 1;
  while (i < src.length && depth) {
    if (src.startsWith("<div", i)) {
      depth += 1;
      i += 4;
    } else if (src.startsWith("</div>", i)) {
      depth -= 1;
      if (depth === 0) {
        src = src.slice(0, start + open.length) + "\n" + cards + "\n    " + src.slice(i);
        break;
      }
      i += 6;
    } else {
      i += 1;
    }
  }
  fs.writeFileSync(file, src);
}

const blogCards = blogs
  .slice()
  .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  .map((p) =>
    cardMarkup({
      href: p.url,
      title: p.title,
      image: p.card_image || p.image,
      category: p.category,
      excerpt: p.excerpt,
    })
  )
  .join("\n");

const projectCards = projects
  .filter((p) => !isStub(path.join(ROOT, "projects", `${p.slug}.html`)))
  .map((p) =>
    cardMarkup({
      href: p.url || `/projects/${p.slug}.html`,
      title: p.title,
      image: p.image,
      category: p.category,
      excerpt: p.excerpt,
    })
  )
  .join("\n");

injectGrid(path.join(ROOT, "blog.html"), "blog-grid", blogCards);
injectGrid(path.join(ROOT, "projects.html"), "projects-grid", projectCards);

console.log(
  JSON.stringify(
    {
      blogs: blogUrls.length,
      projects: projectUrls.length,
      pages: pageUrls.length,
      date: TODAY,
    },
    null,
    2
  )
);
