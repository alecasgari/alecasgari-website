// n8n Code node: Prepare image for GitHub1
// REPLACE only the top of your existing node — publish chain stays the same.
// Supports:
//   A) Manual Telegram photo  → Get Project for photo → Get a file3 → here
//   B) OpenAI image           → Get Project for AI publish → Download AI image → here

function getProjectRow() {
  try {
    const manual = $('Get Project for photo').first();
    if (manual?.json?.project_id) return manual.json;
  } catch (e) {}

  try {
    const ai = $('Get Project for AI publish').first();
    if (ai?.json?.project_id) return ai.json;
  } catch (e) {}

  throw new Error('Project row not found from Get Project for photo or Get Project for AI publish.');
}

const projectData = getProjectRow();
const binaryData = await this.helpers.getBinaryDataBuffer(0, 'data');

function slugify(title) {
  return String(title || '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

const slug = slugify(projectData.project_title);
const imagePath = `/projects/${slug}.jpg`;
const projectLink = `https://alecasgari.com/projects/${slug}.html`;

return {
  project_id: projectData.project_id,
  project_title: projectData.project_title,
  slug,
  project_link: projectLink,
  image_path: imagePath,
  base64_image: binaryData.toString('base64'),
};
