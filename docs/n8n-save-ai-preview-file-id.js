// Code node: Save AI preview file_id
// Optional backup after "Send AI image preview".
// The Use branch reads file_id from the callback message first.

const sent = $('Send AI image preview').first().json;
const photos = sent.photo || sent.result?.photo || sent.message?.photo;

if (!photos?.length) {
  throw new Error(
    'Telegram preview sent but no photo file_id returned. Tap AI generate again and wait for the preview.'
  );
}

const fileId = String(photos[photos.length - 1].file_id || '').trim();
const project = $('Cache AI image for preview').first().json;

if (!fileId) {
  throw new Error('Telegram returned an empty file_id for the preview photo.');
}

return {
  project_id: project.project_id,
  image_link: `tgfile:${fileId}`,
};
