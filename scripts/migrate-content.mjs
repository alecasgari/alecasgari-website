/**
 * Regenerate data/*.json from ../content/*.md (local only)
 * Usage: node scripts/migrate-content.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.resolve(SITE, '..', 'OLD', 'content');

function parseMd(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const [, fm] = match;
  const data = {};
  const lines = fm.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) { i++; continue; }
    const [, key, rest] = kv;

    if (rest === '' || rest === '>-' || rest === '|-' || rest === '>') {
      i++;
      if (i < lines.length && lines[i].match(/^\s+-\s+/)) {
        const list = [];
        while (i < lines.length && lines[i].match(/^\s+-\s+/)) {
          list.push(lines[i].replace(/^\s+-\s+/, '').replace(/^['"]|['"]$/g, ''));
          i++;
        }
        data[key] = list;
        continue;
      }
      const block = [];
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
        if (lines[i].trim()) block.push(lines[i].replace(/^\s+/, ''));
        i++;
      }
      data[key] = block.join(' ').trim();
      continue;
    }

    let v = rest.trim();
    if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) v = v.slice(1, -1);
    if (v === 'true') data[key] = true;
    else if (v === 'false') data[key] = false;
    else data[key] = v;
    i++;
  }
  return data;
}

function slug(f) { return f.replace(/\.md$/, ''); }
function img(p) {
  if (!p || p.startsWith('http')) return p || '';
  return p.replace(/^\/Projects\//, '/images/projects/').replace(/^\/Blog Posts\//, '/images/blog/');
}

function readMd(dir, mapFn) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => {
    const e = parseMd(path.join(dir, f));
    return e ? mapFn(e, slug(f)) : null;
  }).filter(Boolean);
}

const projects = readMd(path.join(SOURCE, 'projects'), (e, s) => ({
  slug: s, title: e.title, excerpt: e.excerpt, image: img(e.featuredImage),
  category: e.category || '', tags: e.tags || [], technologies: e.technologies || [],
  date: (e.projectDate || '').slice(0, 10), clientName: e.clientName || '',
  clientCompany: e.clientCompany || '', duration: e.duration || '', status: e.status || '',
  featured: !!e.featured, projectLink: e.projectLink || 'https://alecasgari.com/',
  url: `/projects/${s}.html`,
})).sort((a, b) => b.date.localeCompare(a.date));

const posts = readMd(path.join(SOURCE, 'posts'), (e, s) => ({
  slug: s, title: e.title, excerpt: e.excerpt, image: img(e.featuredImage),
  category: e.category || '', tags: e.tags || [], date: (e.publishDate || '').slice(0, 10),
  author: e.author || 'Alec Asgari', url: `/blog/${s}.html`,
})).sort((a, b) => b.date.localeCompare(a.date));

fs.mkdirSync(path.join(SITE, 'data'), { recursive: true });
fs.writeFileSync(path.join(SITE, 'data', 'projects.json'), JSON.stringify(projects, null, 2));
fs.writeFileSync(path.join(SITE, 'data', 'posts.json'), JSON.stringify(posts, null, 2));
console.log(`Wrote ${projects.length} projects, ${posts.length} posts`);
