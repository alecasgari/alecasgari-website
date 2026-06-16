// Code node: Cache AI image for preview
// Passes binary + project metadata to Send AI image preview.
// The preview is cached via Telegram file_id in Google Sheets (no disk, no fs).

const project = $('Build OpenAI image prompt').first().json;
const inputItem = $input.first();

return {
  json: {
    project_id: String(project.project_id),
    project_title: project.project_title,
  },
  binary: inputItem.binary,
};
