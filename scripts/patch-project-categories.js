const fs = require('fs');
const path =
  'C:/Users/aleca/OneDrive/Documents/12 - CodeWithAlec/01 - Website/gullible-giant/alecasgari-website/Alec Project Writer Main.json';
const wf = JSON.parse(fs.readFileSync(path, 'utf8'));

const OLD_ALLOWED = `const allowedCategories = [
  'AI Automation',
  'System Integration',
  'Web Development',
  'Marketing',
  'Graphic Design',
];`;

const NEW_ALLOWED = `const allowedCategories = [
  'AI Automation',
  'System Integration',
  'Web Development',
  'Web Application',
  'Mobile Application',
  'Online Shop',
  'Marketing',
  'Graphic Design',
];`;

const OLD_NORMALIZE = `function normalizeCategory(category, title, tags, technologies) {
  const supplied = cleanString(category);

  const context = [
    title,
    ...tags,
    ...technologies,
  ]
    .join(' ')
    .toLowerCase();

  // Workflow, chatbot and automation projects belong to AI Automation.
  if (
    context.includes('n8n') ||
    context.includes('workflow automation') ||
    context.includes('telegram bot') ||
    context.includes('chatbot') ||
    context.includes('ai agent') ||
    context.includes('document generation') ||
    context.includes('automated publishing')
  ) {
    return 'AI Automation';
  }

  if (
    context.includes('crm integration') ||
    context.includes('erp integration') ||
    context.includes('system integration') ||
    context.includes('data synchronization') ||
    context.includes('api integration')
  ) {
    return 'System Integration';
  }

  if (
    context.includes('website') ||
    context.includes('web application') ||
    context.includes('frontend') ||
    context.includes('backend')
  ) {
    return 'Web Development';
  }

  if (
    context.includes('marketing') ||
    context.includes('campaign') ||
    context.includes('seo') ||
    context.includes('lead generation')
  ) {
    return 'Marketing';
  }

  if (
    context.includes('graphic design') ||
    context.includes('logo') ||
    context.includes('figma') ||
    context.includes('brand identity')
  ) {
    return 'Graphic Design';
  }

  if (allowedCategories.includes(supplied)) {
    return supplied;
  }

  return 'AI Automation';
}`;

const NEW_NORMALIZE = `function normalizeCategory(category, title, tags, technologies) {
  const supplied = cleanString(category);

  // Prefer a valid category chosen by the writer.
  if (allowedCategories.includes(supplied)) {
    return supplied;
  }

  const context = [
    title,
    ...tags,
    ...technologies,
  ]
    .join(' ')
    .toLowerCase();

  if (
    context.includes('online shop') ||
    context.includes('e-commerce') ||
    context.includes('ecommerce') ||
    context.includes('woocommerce') ||
    context.includes('shopify') ||
    context.includes('online store')
  ) {
    return 'Online Shop';
  }

  if (
    context.includes('mobile application') ||
    context.includes('mobile app') ||
    context.includes('ios app') ||
    context.includes('android app') ||
    context.includes('react native') ||
    context.includes('flutter')
  ) {
    return 'Mobile Application';
  }

  if (
    context.includes('web application') ||
    context.includes('web app') ||
    context.includes('dashboard') ||
    context.includes('portal') ||
    context.includes('saas')
  ) {
    return 'Web Application';
  }

  // Workflow, chatbot and automation projects belong to AI Automation.
  if (
    context.includes('n8n') ||
    context.includes('workflow automation') ||
    context.includes('telegram bot') ||
    context.includes('chatbot') ||
    context.includes('ai agent') ||
    context.includes('document generation') ||
    context.includes('automated publishing')
  ) {
    return 'AI Automation';
  }

  if (
    context.includes('crm integration') ||
    context.includes('erp integration') ||
    context.includes('system integration') ||
    context.includes('data synchronization') ||
    context.includes('api integration')
  ) {
    return 'System Integration';
  }

  if (
    context.includes('website') ||
    context.includes('landing page') ||
    context.includes('frontend') ||
    context.includes('backend') ||
    context.includes('web development')
  ) {
    return 'Web Development';
  }

  if (
    context.includes('marketing') ||
    context.includes('campaign') ||
    context.includes('seo') ||
    context.includes('lead generation')
  ) {
    return 'Marketing';
  }

  if (
    context.includes('graphic design') ||
    context.includes('logo') ||
    context.includes('figma') ||
    context.includes('brand identity')
  ) {
    return 'Graphic Design';
  }

  return 'AI Automation';
}`;

const OLD_CAT_PROMPT = `CATEGORY

Return exactly one category from this list:

* AI Automation
* System Integration
* Web Development
* Marketing
* Graphic Design

Use AI Automation for projects mainly involving:

* n8n;
* workflow automation;
* Telegram bots;
* chatbots;
* AI agents;
* voice automation;
* document generation;
* automated publishing;
* operational automation.

Use System Integration for projects mainly involving:

* CRM integration;
* ERP integration;
* API integration;
* data synchronization;
* database migration;
* system-to-system connectivity.

Use Web Development for:

* websites;
* web applications;
* dashboards;
* portals;
* front-end work;
* back-end work.

Use Marketing for:

* campaigns;
* lead generation;
* SEO delivery;
* content marketing;
* email marketing;
* social media workflows.

Use Graphic Design for:

* logo design;
* brand identity;
* Figma;
* interface design;
* illustration;
* visual systems.

Choose the category based on the main deliverable.`;

const NEW_CAT_PROMPT = `CATEGORY

Return exactly one category from this list:

* AI Automation
* System Integration
* Web Development
* Web Application
* Mobile Application
* Online Shop
* Marketing
* Graphic Design

Use AI Automation for projects mainly involving:

* n8n;
* workflow automation;
* Telegram bots;
* chatbots;
* AI agents;
* voice automation;
* document generation;
* automated publishing;
* operational automation.

Use System Integration for projects mainly involving:

* CRM integration;
* ERP integration;
* API integration;
* data synchronization;
* database migration;
* system-to-system connectivity.

Use Web Development for:

* marketing websites;
* brochure sites;
* landing pages;
* corporate websites;
* front-end or back-end website delivery without a complex product app.

Use Web Application for:

* web applications;
* dashboards;
* client or admin portals;
* SaaS-style tools;
* interactive multi-user systems in the browser.

Use Mobile Application for:

* iOS apps;
* Android apps;
* cross-platform mobile apps;
* React Native or Flutter products.

Use Online Shop for:

* e-commerce websites;
* online stores;
* product catalogs with checkout;
* Shopify, WooCommerce or similar shop platforms.

Use Marketing for:

* campaigns;
* lead generation;
* SEO delivery;
* content marketing;
* email marketing;
* social media workflows.

Use Graphic Design for:

* logo design;
* brand identity;
* Figma;
* interface design;
* illustration;
* visual systems.

Choose the category based on the main deliverable.
If more than one category could apply, pick the primary product type (for example Online Shop over Web Development, Mobile Application over Web Application).`;

const prep = wf.nodes.find((n) => n.name === 'Prepare Project Data');
if (!prep.parameters.jsCode.includes(OLD_ALLOWED)) throw new Error('allowedCategories block not found');
if (!prep.parameters.jsCode.includes(OLD_NORMALIZE)) throw new Error('normalizeCategory block not found');
prep.parameters.jsCode = prep.parameters.jsCode.replace(OLD_ALLOWED, NEW_ALLOWED).replace(OLD_NORMALIZE, NEW_NORMALIZE);

const write = wf.nodes.find((n) => n.name === 'Write SEO Project');
if (!write.parameters.text.includes(OLD_CAT_PROMPT)) throw new Error('CATEGORY prompt block not found');
write.parameters.text = write.parameters.text.replace(OLD_CAT_PROMPT, NEW_CAT_PROMPT);

fs.writeFileSync(path, JSON.stringify(wf, null, 2) + '\n');
console.log('Workflow updated');
console.log('Prepare has Mobile Application:', prep.parameters.jsCode.includes('Mobile Application'));
console.log('Write has Online Shop:', write.parameters.text.includes('Online Shop'));
