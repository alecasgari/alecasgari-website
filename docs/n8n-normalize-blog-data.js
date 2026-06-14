// n8n Code node: "Normalize Blog Data"
// Runs after AI Agent. Combines AI output with LinkedIn row (imageLink).

const ai = $('AI Agent').first().json.output || {};
const linkedin = $('Get row(s)').first().json;

function slugify(title) {
  return String(title || '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function parseTags(val) {
  if (Array.isArray(val)) return val.map((t) => String(t).trim()).filter(Boolean);
  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return [];
    if (s.startsWith('[')) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map((t) => String(t).trim()).filter(Boolean);
      } catch (e) {
        /* fall through */
      }
    }
    return s.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

const slug = (ai.slug || slugify(ai.title) || 'blog-post').replace(/\.html$/i, '');
const tags = parseTags(ai.tags);
const date = String(ai.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
const featured_image = `/images/blog/${slug}.jpg`;
const url = `/blog/${slug}.html`;
const author = ai.authorName || 'Alec Asgari';
const author_image = '/assets/images/team/alec-asgari-author.webp';

const output = {
  slug,
  title: ai.title || 'Untitled',
  excerpt: ai.excerpt || '',
  category: ai.category || 'Business',
  date,
  featured_image,
  image: featured_image,
  url,
  content: ai.content || '',
  tags,
  authorName: author,
  meta_description: ai.excerpt || '',
};

return {
  output,
  slug,
  title: output.title,
  excerpt: output.excerpt,
  category: output.category,
  date,
  content: output.content,
  imageLink: linkedin.imageLink || '',
  linkedin_row_id: linkedin.id,
  tags,
  tags_json: JSON.stringify(tags),
  featured_image,
  url,
  author,
  author_image,
  status: 'pending',
};
