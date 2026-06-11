// n8n Code node: after "Prepare HTML for GitHub"
// GitHub: GET data/projects.json → این Code → GitHub: PUT data/projects.json

const entry = $('Prepare HTML for GitHub').first().json.projects_json_entry;

// اگر GET از node قبلی آمده:
let existing = [];
try {
  const raw = $input.first().json.content || $input.first().json.data;
  if (typeof raw === 'string') {
    existing = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } else if (Array.isArray($input.first().json)) {
    existing = $input.first().json;
  }
} catch (e) {
  existing = [];
}

const filtered = existing.filter((p) => p.slug !== entry.slug);
filtered.unshift(entry);

const jsonText = JSON.stringify(filtered, null, 2) + '\n';

return {
  slug: entry.slug,
  project_id: $('Prepare HTML for GitHub').first().json.project_id,
  project_link: entry.url ? `https://alecasgari.com${entry.url}` : '',
  base64_projects_json: Buffer.from(jsonText, 'utf8').toString('base64'),
};
