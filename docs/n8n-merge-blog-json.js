// n8n Code node: "Merge blog JSON"
// Input: GitHub Get blog.json

const entry = $('Prepare Blog HTML for GitHub').first().json.blog_json_entry;

if (!entry || !entry.slug) {
  throw new Error('blog_json_entry not found. Run Prepare Blog HTML for GitHub first.');
}

let existing = [];
const item = $input.first().json;

try {
  if (item.content) {
    const b64 = String(item.content).replace(/\s/g, '');
    existing = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  } else if (typeof item.data === 'string') {
    existing = JSON.parse(item.data);
  }
} catch (e) {
  existing = [];
}

if (!Array.isArray(existing)) existing = [];

const filtered = existing.filter((p) => p.slug !== entry.slug);
filtered.unshift(entry);

const jsonText = JSON.stringify(filtered, null, 2) + '\n';

return {
  slug: entry.slug,
  blog_url: `https://alecasgari.com${entry.url}`,
  base64_blog_json: Buffer.from(jsonText, 'utf8').toString('base64'),
};
