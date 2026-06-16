// Code node: Attach cover image sha
// After "Get cover image sha" (continue on error).

const prepared = $('Prepare image for GitHub1').first().json;
const getResult = $input.first().json;

const fileSha = typeof getResult?.sha === 'string' ? getResult.sha : '';

return {
  ...prepared,
  file_sha: fileSha,
};
