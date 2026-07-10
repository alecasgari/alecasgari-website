// n8n Code node: "Prepare Blog HTML for GitHub"
// Template logic: docs/blog-page-builder.js (keep in sync when updating n8n)
// Keep in sync with Alecasgrai-website-news.json — paste blog-page-builder.js + this file's n8n block into n8n.

const {
  buildBlogHtml,
  mdToHtml,
  buildReferencesHtml,
} = require('./blog-page-builder');

const norm = $('Normalize Blog Data').first().json;
const post = norm.output || {};
const now = new Date();
const offset = now.getTimezoneOffset() * 60000;
post.date = new Date(now.getTime() - offset).toISOString().slice(0, 10);
const slug = norm.slug || post.slug;
const tags = Array.isArray(post.tags)
  ? post.tags
  : JSON.parse(norm.tags_json || '[]');
const image = norm.featured_image || `/images/blog/${slug}.jpg`;
const url = norm.url || `/blog/${slug}.html`;
const author = norm.author || post.authorName || 'Alec Asgari';
const author_image = norm.author_image || '/assets/images/team/alec-asgari-author.webp';
const content = post.content || $('AI Agent').first().json.output?.content || '';

const referencesHtml = buildReferencesHtml(post);
const bodyHtml = mdToHtml(content, post.title || '') + referencesHtml;
const html = buildBlogHtml(
  {
    slug,
    title: post.title || 'Untitled',
    excerpt: post.excerpt || '',
    category: post.category || 'Business',
    date: String(post.date || '').slice(0, 10),
    image,
    url,
    author,
    author_image,
    sourceArticleUrl: post.sourceArticleUrl,
    linkedinPostUrl: post.linkedinPostUrl,
    content,
  },
  bodyHtml,
  tags
);

const blog_json_entry = {
  slug,
  title: post.title || 'Untitled',
  excerpt: post.excerpt || '',
  category: post.category || 'Business',
  date: String(post.date || '').slice(0, 10),
  image,
  url,
  author,
  author_image,
};

const blog_content_entry = {
  slug,
  body: bodyHtml,
  tags,
};

return [{
  json: {
    slug,
    linkedin_row_id: norm.linkedin_row_id,
    image_path: image,
    blog_url: `https://alecasgari.com${url}`,
    base64_html: Buffer.from(html, 'utf8').toString('base64'),
    blog_json_entry,
    blog_content_entry,
  },
}];
