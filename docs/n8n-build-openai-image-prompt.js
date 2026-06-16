// Code node: Build OpenAI image prompt
// Input: Get Project for OpenAI (Google Sheets row)

const row = $input.first().json;

const title = row.project_title || 'Project';
const category = row.category || '';
const excerpt = row.short_description || '';
const tags = String(row.tags || '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean)
  .slice(0, 5)
  .join(', ');

const imagePrompt = [
  'Professional portfolio cover photo for a completed client project.',
  `Project: ${title}.`,
  category ? `Category: ${category}.` : '',
  excerpt ? `Summary: ${excerpt}` : '',
  tags ? `Themes: ${tags}.` : '',
  'Style: clean, modern, realistic, soft natural light, subtle tech or business mood matching the project type.',
  'No text, no logos, no watermarks, no faces close-up, no copyrighted brands.',
  'Wide cinematic composition suitable for a website hero banner.',
].filter(Boolean).join(' ');

return {
  project_id: row.project_id,
  project_title: row.project_title,
  image_prompt: imagePrompt,
};
