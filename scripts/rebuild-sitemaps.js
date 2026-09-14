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

const blogLinks = blogs.map((p) => ({ href: p.url, title: p.title }));
const projectLinks = projects
  .filter((p) => !isStub(path.join(ROOT, "projects", `${p.slug}.html`)))
  .map((p) => ({ href: p.url || `/projects/${p.slug}.html`, title: p.title }));

injectNoscript(
  path.join(ROOT, "blog.html"),
  '<div id="blog-grid" class="stagger"></div>',
  noscriptList(blogLinks)
);
injectNoscript(
  path.join(ROOT, "projects.html"),
  '<div id="projects-grid" class="stagger"></div>',
  noscriptList(projectLinks)
);

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
