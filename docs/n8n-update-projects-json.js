// n8n Code node — نام پیشنهادی: Merge projects JSON
// ورودی: خروجی node «Get projects.json» (GitHub)
// فقط از Prepare HTML for GitHub برای entry استفاده می‌کند

const entry = $('Prepare HTML for GitHub').first().json.projects_json_entry;

if (!entry || !entry.slug) {
  throw new Error('projects_json_entry not found. Run Prepare HTML for GitHub first.');
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
  project_id: $('Prepare HTML for GitHub').first().json.project_id,
  project_link: entry.url ? `https://alecasgari.com${entry.url}` : '',
  base64_projects_json: Buffer.from(jsonText, 'utf8').toString('base64'),
};
