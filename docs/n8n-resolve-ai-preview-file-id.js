// Code node: Resolve AI preview file_id
// Run after "Get Project for AI publish" on the Use branch.
// Best source: the preview message the user clicked "Use this image" on.

const row = $('Get Project for AI publish').first().json;
const callback = $('Telegram Trigger1').first().json.callback_query;
const photos = callback?.message?.photo;

function cleanFileId(value) {
  return String(value || '')
    .trim()
    .replace(/^tgfile:/i, '');
}

if (photos?.length) {
  const fileId = cleanFileId(photos[photos.length - 1].file_id);
  if (!fileId) {
    throw new Error('Preview photo found on Telegram message but file_id is empty.');
  }
  return {
    ...row,
    ai_preview_file_id: fileId,
  };
}

const link = cleanFileId(row.image_link);
if (link) {
  return {
    ...row,
    ai_preview_file_id: link,
  };
}

throw new Error(
  'Could not find preview photo. Tap "Use this image" on the latest AI preview message (not an older chat message).'
);
