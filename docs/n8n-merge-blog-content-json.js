// n8n Code node: "Merge blog content JSON"
// Input: GitHub Get blog-content.json

const prepared = $('Prepare Blog HTML for GitHub').first().json;
const entry = prepared.blog_content_entry;

if (!entry || !entry.slug) {
  throw new Error('blog_content_entry not found. Run Prepare Blog HTML for GitHub first.');
}

let existing = {};
const item = $input.first().json;

try {
  if (item.content) {
    const b64 = String(item.content).replace(/\s/g, '');
    existing = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  } else if (typeof item.data === 'string') {
    existing = JSON.parse(item.data);
  }
} catch (e) {
  existing = {};
}

if (!existing || typeof existing !== 'object' || Array.isArray(existing)) existing = {};

existing[entry.slug] = {
  body: entry.body,
  tags: entry.tags || [],
};

const jsonText = JSON.stringify(existing, null, 2) + '\n';

return {
  slug: entry.slug,
  base64_blog_content_json: Buffer.from(jsonText, 'utf8').toString('base64'),
};
