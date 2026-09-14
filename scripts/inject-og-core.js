const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const files = [
  "privacy-policy.html",
  "case-studies/ai-lead-vetting-spring-future.html",
  "case-studies/dfisx-tech-summit.html",
  "case-studies/erp-migration-pharmatech.html",
  "case-studies/vesta-profit-center.html",
];

function grab(html, re) {
  const m = html.match(re);
  return m ? m[1] : "";
}

for (const rel of files) {
  const p = path.join(root, rel);
  let html = fs.readFileSync(p, "utf8");
  if (html.includes('property="og:title"')) {
    console.log("skip", rel);
    continue;
  }
  const title = grab(html, /<title>([^<]+)<\/title>/);
  const desc = grab(html, /name="description" content="([^"]*)"/);
  const canon = grab(html, /rel="canonical" href="([^"]+)"/);
  const og = `  <meta property="og:type" content="article">
  <meta property="og:url" content="${canon}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="https://alecasgari.com/assets/images/hero-slider/hero-1.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="https://alecasgari.com/assets/images/hero-slider/hero-1.jpg">`;
  html = html.replace(/<link rel="canonical"[^>]*>/, (m) => m + "\n" + og);
  fs.writeFileSync(p, html);
  console.log("og", rel);
}
