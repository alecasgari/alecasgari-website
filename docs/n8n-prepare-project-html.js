// n8n Code node: "Prepare HTML for GitHub"
// فقط از Get Project for photo استفاده می‌کند (بدون $('Prepare image for GitHub'))

const projectData = $('Get Project for photo').first().json;

function slugify(title) {
  return String(title || '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function splitCsv(val) {
  return String(val || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

const slug = slugify(projectData.project_title);
const tags = splitCsv(projectData.tags);
const technologies = splitCsv(projectData.technologies_used);
const image = `/projects/${slug}.jpg`;
const url = `/projects/${slug}.html`;
const pageUrl = `https://alecasgari.com${url}`;
const date = String(projectData.project_date || '');
const status = 'Completed';
const featured = true;

function mdToHtml(md) {
  return String(md || '')
    .split(/\n{2,}/)
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
      if (block.startsWith('## ')) return `<h2>${block.slice(3)}</h2>`;
      if (block.startsWith('- ')) {
        const items = block.split('\n').map((l) => l.replace(/^- /, '').trim());
        return `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
      }
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}

const bodyHtml = mdToHtml(projectData.project_description);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${projectData.project_title}</title>
<meta name="description" content="${projectData.short_description}">
<link rel="canonical" href="${pageUrl}">
<link rel="shortcut icon" href="/assets/images/logos/favicon.svg">
<link rel="stylesheet" href="/assets/libs/aos-master/dist/aos.css">
<link rel="stylesheet" href="/assets/css/styles.css">
<link rel="stylesheet" href="/assets/css/extra.css">
</head>
<body>
<header class="header border-4 border-primary border-top position-fixed start-0 top-0 w-100">
  <div class="container">
    <div class="header-wrapper d-flex align-items-center justify-content-between">
      <div class="logo">
        <a href="/"><img src="/assets/images/logos/logo-dark.svg" alt="Alec Asgari" class="logo-img"></a>
      </div>
      <a href="/projects.html" class="btn btn-sm btn-outline-dark">All Projects</a>
    </div>
  </div>
</header>
<div class="page-wrapper overflow-hidden" style="padding-top:100px">
  <section class="py-5 bg-light-gray">
    <div class="container col-lg-10">
      <span class="badge text-bg-primary">${projectData.category}</span>
      <span class="badge text-bg-secondary ms-2">${status}</span>
      <h1 class="mt-4">${projectData.project_title}</h1>
      <p class="fs-5 text-opacity-70">${projectData.short_description}</p>
      <p class="small mb-0">${projectData.client_name} · ${projectData.client_company} · ${date} · ${projectData.project_duration}</p>
    </div>
  </section>
  <section class="py-4">
    <div class="container col-lg-10">
      <img src="${image}" alt="${projectData.project_title}" class="img-fluid w-100 rounded-3">
    </div>
  </section>
  <section class="py-5">
    <div class="container col-lg-8 project-description">
      ${bodyHtml}
    </div>
  </section>
</div>
<script src="/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
<script src="/assets/libs/aos-master/dist/aos.js"></script>
<script src="/assets/js/custom.js"></script>
<script src="https://cdn.jsdelivr.net/npm/iconify-icon@1.0.8/dist/iconify-icon.min.js"></script>
</body>
</html>`;

const projectsJsonEntry = {
  slug,
  title: projectData.project_title,
  excerpt: projectData.short_description,
  image,
  category: projectData.category,
  tags,
  technologies,
  date: date.slice(0, 10),
  clientName: projectData.client_name,
  clientCompany: projectData.client_company,
  duration: projectData.project_duration,
  status,
  featured,
  projectLink: pageUrl,
  url,
};

return {
  slug,
  project_id: projectData.project_id,
  project_link: pageUrl,
  image_path: image,
  base64_html: Buffer.from(html, 'utf8').toString('base64'),
  projects_json_entry: projectsJsonEntry,
};
