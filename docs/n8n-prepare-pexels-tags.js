// Code node: Prepare Pexels tags
// Input: Get Project for Pexels (Google Sheets row)
// Output: same shape the Pexels subworkflow expects

const row = $input.first().json;
const tagsRaw = row.tags || '';

const tags = String(tagsRaw)
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);

if (!tags.length) {
  throw new Error('No tags on project row for Pexels search.');
}

return {
  project_id: row.project_id,
  project_title: row.project_title,
  tags,
};
