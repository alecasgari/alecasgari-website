// n8n Code node: "Prepare Blog Image for GitHub"
// Input: HTTP Request binary (downloaded imageLink)

const norm = $('Normalize Blog Data').first().json;
const slug = norm.slug;
const binaryData = await this.helpers.getBinaryDataBuffer(0, 'data');
const base64String = binaryData.toString('base64');

return {
  slug,
  image_path: `/images/blog/${slug}.jpg`,
  github_path: `images/blog/${slug}.jpg`,
  base64_image: base64String,
  linkedin_row_id: norm.linkedin_row_id,
};
