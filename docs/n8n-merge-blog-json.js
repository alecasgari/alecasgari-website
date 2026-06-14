// n8n Code node: "Merge blog JSON"
// Input: GitHub Get blog.json

const prepared = $('Prepare Blog HTML for GitHub').first().json;
const entry = prepared.blog_json_entry;

if (!entry || !entry.slug) {
  throw new Error('blog_json_entry not found. Run Prepare Blog HTML for GitHub first.');
}

function parseGithubJson(item) {
  if (!item) return [];
  try {
    if (typeof item.content === 'string' && item.content) {
      const b64 = item.content.replace(/\s/g, '');
      return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    }
    if (item.content && typeof item.content === 'object' && item.content.content) {
      const b64 = String(item.content.content).replace(/\s/g, '');
      return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    }
    if (typeof item.data === 'string' && item.data) {
      return JSON.parse(item.data);
    }
  } catch (e) {
    return [];
  }
  return [];
}

let existing = parseGithubJson($input.first().json);
if (!Array.isArray(existing)) existing = [];

const filtered = existing.filter((p) => p.slug !== entry.slug);
filtered.unshift(entry);

const jsonText = JSON.stringify(filtered, null, 2) + '\n';
const base64_blog_json = Buffer.from(jsonText, 'utf8').toString('base64');

if (!base64_blog_json) {
  throw new Error('Failed to build base64_blog_json');
}

return [{
  json: {
    slug: entry.slug,
    linkedin_row_id: prepared.linkedin_row_id,
    blog_url: `https://alecasgari.com${entry.url}`,
    base64_blog_json,
  },
}];
