/**
 * Rebuild n8n-generated project pages with the correct template.
 * Usage: node scripts/regenerate-n8n-project-pages.js
 */
const fs = require('fs');
const path = require('path');
const { buildProjectHtml } = require('../docs/project-html-builder');

const root = path.join(__dirname, '..');
const projects = JSON.parse(fs.readFileSync(path.join(root, 'data/projects.json'), 'utf8'));
const descriptions = JSON.parse(
  fs.readFileSync(path.join(root, 'data/project-descriptions.json'), 'utf8')
);

const N8N_SLUGS = [
  'End-to-End-IPTV-Smart-Pro-Platform-Development-and-Integration',
  'Automated-Webinar-Registration-and-Lead-Management-System',
];

function roughHtmlToMarkdown(html) {
  return html
    .replace(/<h2[^>]*>/gi, '\n## ')
    .replace(/<h3[^>]*>/gi, '\n### ')
    .replace(/<\/h[23]>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

for (const slug of N8N_SLUGS) {
  const meta = projects.find((p) => p.slug === slug);
  if (!meta) {
    console.warn('Skip (not in JSON):', slug);
    continue;
  }

  const filePath = path.join(root, 'projects', `${slug}.html`);
  let description = '';

  if (descriptions[slug]) {
    description = descriptions[slug];
  } else if (fs.existsSync(filePath)) {
    const old = fs.readFileSync(filePath, 'utf8');
    const match = old.match(
      /<div class="project-description">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<div class="col-lg-4">/
    );
    if (match) description = roughHtmlToMarkdown(match[1]);
  }

  const html = buildProjectHtml({
    ...meta,
    project_title: meta.title,
    short_description: meta.excerpt,
    project_description: description,
    project_date: meta.date,
    client_name: meta.clientName,
    client_company: meta.clientCompany,
    project_duration: meta.duration,
    technologies_used: meta.technologies.join(', '),
    tags: meta.tags.join(', '),
  });

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Regenerated:', filePath);
}
