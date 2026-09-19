/**
 * Restore high-impression GSC stub project pages from archived content.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function chips(items, kind) {
  const icon = kind === "tech" ? "cpu" : "tag";
  const cls = kind === "tech" ? "project-chip--tech" : "project-chip--tag";
  return items
    .map(
      (t) =>
        `<span class="project-chip ${cls}"><iconify-icon icon="lucide:${icon}"></iconify-icon>${esc(t)}</span>`
    )
    .join("");
}

function page(p) {
  const url = `https://alecasgari.com/projects/${p.slug}.html`;
  const img = `https://alecasgari.com${p.image}`;
  const keywords = [...p.tags, ...p.technologies].join(", ");
  const jsonld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.headline || p.title,
    description: p.excerpt,
    url,
    mainEntityOfPage: url,
    image: img,
    datePublished: p.date,
    author: { "@type": "Person", name: "Alec Asgari", url: "https://alecasgari.com/about.html" },
    publisher: { "@type": "Person", name: "Alec Asgari" },
    articleSection: p.category,
    keywords,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(p.seoTitle)}</title>
  <meta name="description" content="${esc(p.excerpt)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(p.headline || p.title)}">
  <meta property="og:description" content="${esc(p.excerpt)}">
  <meta property="og:image" content="${img}">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(p.headline || p.title)}">
  <meta name="twitter:description" content="${esc(p.excerpt)}">
  <meta name="twitter:image" content="${img}">
  <script type="application/ld+json">${jsonld}</script>
  <link rel="shortcut icon" href="/assets/images/logos/favicon.svg">
  <link rel="stylesheet" href="/assets/css/site.css?v=11">
  <link rel="stylesheet" href="/assets/css/project-detail.css?v=2">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-81C6JE60BQ"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-81C6JE60BQ');</script>
</head>
<body data-category="${esc(p.categorySlug)}">
  <header class="site-header">
    <div class="container inner">
      <a href="/" class="site-logo">
        <img src="/assets/images/logos/logo-dark.svg" alt="Alec Asgari" width="140" height="36">
      </a>
      <nav>
        <ul class="site-nav">
          <li><a href="/">Home</a></li>
          <li><a href="/about.html">About Me</a></li>
          <li><a href="/case-studies.html">Case Studies</a></li>
          <li><a href="/projects.html" class="active">Projects</a></li>
          <li><a href="/blog.html">Blog</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </nav>
      <button class="nav-toggle" id="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </header>
<main>
    <section class="project-detail-hero" style="background-image:url('${esc(p.image)}')">
      <div class="project-detail-hero-overlay"></div>
      <div class="container">
        <p class="eyebrow hero-in">
          <iconify-icon icon="lucide:folder-kanban"></iconify-icon>
          <a href="/projects.html">Projects</a> / ${esc(p.category)}
        </p>
        <h1 class="hero-in hero-in-d1">${esc(p.h1)}</h1>
        <p class="project-detail-excerpt hero-in hero-in-d2">${esc(p.excerpt)}</p>
      </div>
    </section>
    <section class="project-featured-wrap">
      <div class="container">
        <figure class="project-featured-figure reveal">
          <img src="${esc(p.image)}" alt="${esc(p.h1)}" class="project-featured-img" width="1200" height="630">
        </figure>
      </div>
    </section>
    <section class="section">
      <div class="container project-detail-layout">
        <article class="project-detail-content reveal">
          <h2><iconify-icon icon="lucide:file-text"></iconify-icon> Project Details</h2>
          <div class="project-description">${p.bodyHtml}</div>
        </article>
        <aside class="project-meta sidebar-panel card-lift reveal">
          <div class="project-meta-block">
            <h3><iconify-icon icon="lucide:clipboard-list"></iconify-icon> Project Info</h3>
            <ul>
              <li><iconify-icon icon="lucide:layers"></iconify-icon><div><strong>Category</strong>${esc(p.category)}</div></li>
              <li><iconify-icon icon="lucide:activity"></iconify-icon><div><strong>Status</strong>${esc(p.status)}</div></li>
              <li><iconify-icon icon="lucide:user"></iconify-icon><div><strong>Client</strong>${esc(p.clientCompany)}</div></li>
              <li><iconify-icon icon="lucide:calendar"></iconify-icon><div><strong>Date</strong>${esc(p.displayDate)}</div></li>
              <li><iconify-icon icon="lucide:clock"></iconify-icon><div><strong>Duration</strong>${esc(p.duration)}</div></li>
            </ul>
          </div>
          <div class="project-meta-block">
            <h3><iconify-icon icon="lucide:cpu"></iconify-icon> Technologies</h3>
            <div class="project-chip-list">${chips(p.technologies, "tech")}</div>
          </div>
          <div class="project-meta-block">
            <h3><iconify-icon icon="lucide:tags"></iconify-icon> Tags</h3>
            <div class="project-chip-list">${chips(p.tags, "tag")}</div>
          </div>
        </aside>
      </div>
    </section>
    <section class="section section-alt section-tight">
      <div class="container project-detail-cta reveal">
        <a href="/projects.html" class="btn btn-outline">All Projects</a>
        <a href="/contact.html" class="btn btn-primary">Discuss Your Project</a>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container inner">
      <a href="/" class="footer-logo"><img src="/assets/images/logos/logo-dark.svg" alt="Alec Asgari" width="120" height="32"></a>
      <p class="footer-copy">© 2025–2026 Alec Asgari</p>
      <ul class="footer-links">
        <li><a href="/privacy-policy.html">Privacy Policy</a></li>
        <li><a href="https://www.linkedin.com/in/alecasgari/" target="_blank" rel="noopener">LinkedIn</a></li>
        <li><a href="mailto:hello@alecasgari.com">Email</a></li>
      </ul>
    </div>
  </footer>
  <script src="https://cdn.jsdelivr.net/npm/iconify-icon@1.0.8/dist/iconify-icon.min.js"></script>
  <script src="/assets/js/site-nav.js?v=9"></script>
  <script src="/assets/js/site-reveal.js"></script>
</body>
</html>
`;
}

const projects = [
  {
    slug: "AI-Powered-Telegram--N8N-Workflow-for-Automated-Voice-to-Presentation",
    seoTitle: "n8n Telegram Bot: Voice to PowerPoint | Alec Asgari",
    headline: "n8n Telegram Bot for Automated Voice-to-Presentation",
    h1: "n8n Telegram Bot that Turns Voice Messages into PowerPoint Presentations",
    title: "AI-Powered Telegram & n8n Workflow for Automated Voice-to-Presentation",
    excerpt:
      "An n8n Telegram bot that transcribes voice messages, extracts structured data with OpenAI, and automatically builds PowerPoint presentations — built for a medical practice in the UAE.",
    image: "/projects/AI-Powered-Telegram--N8N-Workflow-for-Automated-Voice-to-Presentation.jpg",
    category: "AI Automation",
    categorySlug: "ai-automation",
    tags: ["n8n", "Telegram bot", "voice transcription", "PowerPoint automation", "OpenAI"],
    technologies: ["n8n", "Telegram Bot API", "OpenAI API", "Google Drive API", "Google Slides", "JavaScript"],
    date: "2025-10-12",
    displayDate: "October 12, 2025",
    clientName: "Prof. Guive Sharifi",
    clientCompany: "Prof. Guive Sharifi",
    duration: "2 weeks",
    status: "Completed",
    featured: true,
    bodyHtml: `<h3>Overview</h3>
<p>I built a Telegram bot orchestrated in n8n that converts a voice note into a structured PowerPoint presentation. Users send audio in any language; OpenAI transcribes it, an AI agent extracts fields such as patient details and clinical notes, and a Google Slides template is filled, exported, and sent back in Telegram.</p>
<h3>The problem</h3>
<p>Creating case presentations by hand meant retyping voice notes, collecting images, and copying slides. The workflow had to keep voice, images, and metadata aligned across multiple Telegram messages.</p>
<h3>The solution</h3>
<ul>
<li><strong>Voice intake:</strong> Telegram voice messages are transcribed with OpenAI regardless of language.</li>
<li><strong>Image intake:</strong> Case images are stored in Google Drive and tracked in Google Sheets.</li>
<li><strong>AI extraction:</strong> Structured fields populate a copied Google Slides template.</li>
<li><strong>Delivery:</strong> PDF and PowerPoint files are exported and the download links are returned in Telegram.</li>
</ul>
<p>This is the same class of n8n + Telegram automation that ranks for queries such as “telegram bot that creates presentations automatically” and “n8n telegram voice message transcription workflow”.</p>
<h3>Results</h3>
<p>End-to-end voice-to-presentation in minutes instead of a manual slide-building session, with consistent file handling inside Telegram.</p>`,
  },
  {
    slug: "AI-Powered-Chatbot",
    seoTitle: "AI Sales Assistant Chatbot with n8n | Alec Asgari",
    headline: "24/7 AI Sales Assistant Chatbot",
    h1: "AI Sales Assistant Chatbot with Automated Lead Qualification",
    title: "AI-Powered 24/7 Sales Assistant Chatbot",
    excerpt:
      "A 24/7 AI sales assistant chatbot that qualifies inbound leads conversationally, books calendar meetings, and hands off to a human via Telegram when needed.",
    image: "/projects/AI-Powered-Chatbot.webp",
    category: "AI Automation",
    categorySlug: "ai-automation",
    tags: ["AI chatbot", "lead qualification", "n8n", "sales automation", "calendar integration"],
    technologies: ["n8n", "OpenAI", "WebSockets", "Telegram Bot API", "Google Calendar API", "Vector database"],
    date: "2025-10-09",
    displayDate: "October 9, 2025",
    clientName: "Basant Mohammed",
    clientCompany: "Basant Accounting",
    duration: "3 weeks",
    status: "Completed",
    featured: true,
    bodyHtml: `<h3>Overview</h3>
<p>I designed and shipped a 24/7 AI sales assistant that engages inbound chats, qualifies prospects, and books discovery calls without a human in the loop — until the visitor asks for one.</p>
<h3>The problem</h3>
<p>The client needed after-hours coverage, consistent qualification, and less calendar admin. Handoff to a person had to keep full conversation context.</p>
<h3>The solution</h3>
<ul>
<li>n8n orchestrates webhooks, the AI agent, scoring rules, and tools.</li>
<li>Teams larger than five people without an integrated stack are treated as high-value leads.</li>
<li>Qualified leads see live calendar slots; a Google Meet event is created automatically.</li>
<li>“Talk to a human” routes the thread to Telegram with history; <code>end_chat</code> returns control to the bot.</li>
</ul>
<p>This work maps to search demand around AI sales assistants and automated lead qualification.</p>`,
  },
  {
    slug: "Full-business-automation-implementation",
    seoTitle: "DFISX Dubai Tech Summit Automation | Alec Asgari",
    headline: "End-to-End Automation for Future Innovation Summit",
    h1: "IT Infrastructure and Automation for a Dubai Tech Summit",
    title: "End-to-End IT Infrastructure and AI-Powered Automation for DFISX",
    excerpt:
      "Full digital infrastructure for Future Innovation Summit in Dubai: website, AI content, ticketing, and automated speaker/attendee workflows for 150+ speakers.",
    image: "/projects/Full-business-automation-implementation.png",
    category: "System Integration",
    categorySlug: "system-integration",
    tags: ["event automation", "Dubai", "n8n", "IT infrastructure", "system integration"],
    technologies: ["Node.js", "n8n", "ChatGPT API", "QR codes", "email automation"],
    date: "2024-10-23",
    displayDate: "October 23, 2024",
    clientName: "Adnan Al Noorani",
    clientCompany: "Future Innovation Summit",
    duration: "6 months + 1 year support",
    status: "Completed",
    featured: true,
    bodyHtml: `<h3>Overview</h3>
<p>I built and ran the digital backbone for Future Innovation Summit (DFISX) at Jumeirah, Dubai — from the public site and AI-assisted content to registration, ticketing, and on-site operations for 150+ speakers.</p>
<h3>The problem</h3>
<p>A large summit needed one system for speaker onboarding, attendee registration, ticket sales, campaigns, and day-of logistics without a swarm of spreadsheets.</p>
<h3>The solution</h3>
<p>A unified stack: web portal, automated emails, QR-based operations, and AI-assisted content generation, with post-event support for a year.</p>
<h3>Results</h3>
<p>The event ran on a paperless operational layer used by speakers, attendees, and the organizing team.</p>`,
  },
  {
    slug: "ERP-System-Implementation",
    seoTitle: "ERPNext Implementation for PharmaTech Dubai | Alec Asgari",
    headline: "ERPNext Implementation for a Pharmaceutical Company",
    h1: "Complete ERP System Implementation for PharmaTech",
    title: "Complete ERP System Implementation for Pharma Tech",
    excerpt:
      "ERPNext rollout for PharmaTech in Dubai covering procurement through logistics, with n8n workflow automation across pharmaceutical operations.",
    image: "/projects/ERP-System-Implementation.webp",
    category: "System Integration",
    categorySlug: "system-integration",
    tags: ["ERPNext", "pharmaceutical ERP", "n8n", "workflow automation", "Dubai"],
    technologies: ["ERPNext", "n8n"],
    date: "2026-04-30",
    displayDate: "April 30, 2026",
    clientName: "Dr. Herfan Pakchian",
    clientCompany: "PharmaTech For Medical LLC | Dubai",
    duration: "6 months",
    status: "Completed",
    featured: true,
    bodyHtml: `<h3>Overview</h3>
<p>I implemented ERPNext for PharmaTech so import, export, production, sales, and logistics sit in one operational system, with n8n moving approvals and documents between teams.</p>
<h3>The problem</h3>
<p>Departments ran disconnected processes. Visibility across commerce, technical service, and logistics was poor.</p>
<h3>The solution</h3>
<p>Custom forms and workflows for pharmaceutical operations, n8n connectors for handoffs, and generated PDF previews for documentation.</p>
<p>Related narrative case study: <a href="/case-studies/erp-migration-pharmatech.html">ERP migration for PharmaTech</a>.</p>`,
  },
  {
    slug: "Development-of-an-Advanced-Car-Rental--Booking-Portal-for-the-Dubai-Market",
    seoTitle: "Dubai Car Rental Booking Portal | Alec Asgari",
    headline: "Car Rental & Booking Portal for the Dubai Market",
    h1: "Advanced Car Rental Booking Portal for Dubai",
    title: "Development of an Advanced Car Rental & Booking Portal for the Dubai Market",
    excerpt:
      "End-to-end car rental portal for NK Rent Cars in Dubai: custom booking engine, WhatsApp alerts, ads-to-CRM automation, and B2B vehicle listings.",
    image: "/projects/Development-of-an-Advanced-Car-Rental--Booking-Portal-for-the-Dubai-Market.webp",
    category: "Web Development",
    categorySlug: "web-development",
    tags: ["car rental portal", "Dubai", "booking system", "WhatsApp", "n8n"],
    technologies: ["WordPress", "JetEngine", "Meta Ads", "Make.com", "MailerLite"],
    date: "2025-04-01",
    displayDate: "April 1, 2025",
    clientName: "Mr. Nikkhah",
    clientCompany: "NK Rent Cars",
    duration: "Approximately 2 years",
    status: "Completed",
    featured: true,
    bodyHtml: `<h3>Client challenge</h3>
<p>NK Rent Cars needed more than a brochure site: live inventory, bookings, and marketing ops for Dubai’s rental market.</p>
<h3>Solution</h3>
<ul>
<li>Custom booking engine on WordPress + JetEngine.</li>
<li>Email and WhatsApp confirmations for pickup and drop-off.</li>
<li>B2B listings so partner fleets can be sold through the same portal.</li>
<li>Meta, Google, and TikTok leads piped in via Make.com / Zapier.</li>
</ul>
<h3>Outcome</h3>
<p>The portal is the operational hub for bookings, lead intake, and customer messaging.</p>`,
  },
  {
    slug: "Intelligent-Multi-Step-Migration-Form-Automation-for-Rahkar-Gasht",
    seoTitle: "n8n Multi-Step Migration Form Automation | Alec Asgari",
    headline: "Intelligent Multi-Step Migration Form for Rahkar Gasht",
    h1: "Multi-Step Migration Form Automation with n8n and OTP",
    title: "Intelligent Multi-Step Migration Form Automation for Rahkar Gasht",
    excerpt:
      "A Node.js multi-step immigration form with n8n: personalized destination suggestions, SMS/WhatsApp OTP, and CRM plus Slack/Telegram lead routing.",
    image: "/projects/Intelligent-Multi-Step-Migration-Form-Automation-for-Rahkar-Gasht.webp",
    category: "AI Automation",
    categorySlug: "ai-automation",
    tags: ["migration automation", "multi-step form", "n8n", "OTP", "CRM"],
    technologies: ["Node.js", "n8n", "Google Sheets", "Payamgostar CRM", "Slack", "Telegram"],
    date: "2025-11-11",
    displayDate: "November 11, 2025",
    clientName: "Dr. Nasim",
    clientCompany: "Rahkar Gasht",
    duration: "3 months",
    status: "Completed",
    featured: true,
    bodyHtml: `<h3>Overview</h3>
<p>Rahkar Gasht needed a smart eligibility form, not a static landing page. I built a multi-step flow that collects profile data, suggests destinations, verifies contact details with OTP, and pushes qualified leads into CRM.</p>
<h3>Solution</h3>
<ul>
<li>Dynamic multi-step UX so long forms stay usable.</li>
<li>n8n generates a personalized recommendation paragraph from answers.</li>
<li>OTP via SMS and WhatsApp; codes stored in Google Sheets for validation.</li>
<li>Payamgostar CRM, Slack, and Telegram notified in real time with UTM data.</li>
</ul>
<p>See a related immigration automation story: <a href="/case-studies/ai-lead-vetting-spring-future.html">AI lead vetting for Spring Future</a>.</p>`,
  },
  {
    slug: "amber-bottle",
    seoTitle: "Blockchain Legals Web Portal | Alec Asgari",
    headline: "Blockchain Legals Portal",
    h1: "Web Portal for Blockchain Legals",
    title: "Blockchain Legals Portal",
    excerpt:
      "WordPress and WooCommerce portal for Blockchain Legals, a crypto-native international law practice — content, shop, and payment gateway.",
    image: "/projects/amber-bottle.jpg",
    category: "Web Development",
    categorySlug: "web-development",
    tags: ["WordPress", "WooCommerce", "legal tech", "web development"],
    technologies: ["WordPress", "WooCommerce", "payment gateway"],
    date: "2025-09-03",
    displayDate: "September 3, 2025",
    clientName: "Mr. Omar",
    clientCompany: "Blockchain Legals",
    duration: "10 months",
    status: "Completed",
    featured: false,
    bodyHtml: `<h3>Overview</h3>
<p>I delivered the public web portal for Blockchain Legals, covering incorporation guidance for crypto ventures and e-commerce for related services.</p>
<h3>Scope</h3>
<p>WordPress site architecture, WooCommerce, payment gateway, and content templates for jurisdiction and structure guidance.</p>`,
  },
];

const jsonPath = path.join(ROOT, "data/projects.json");
const existing = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const bySlug = new Map(existing.map((p) => [p.slug, p]));

for (const p of projects) {
  fs.writeFileSync(path.join(ROOT, "projects", `${p.slug}.html`), page(p));
  const entry = {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    image: p.image,
    category: p.category,
    tags: p.tags,
    technologies: p.technologies,
    date: p.date,
    clientName: p.clientName,
    clientCompany: p.clientCompany,
    duration: p.duration,
    status: p.status,
    featured: p.featured,
    projectLink: `https://alecasgari.com/projects/${p.slug}.html`,
    url: `/projects/${p.slug}.html`,
  };
  bySlug.set(p.slug, entry);
}

const merged = [...projects.map((p) => bySlug.get(p.slug)), ...existing.filter((p) => !projects.some((x) => x.slug === p.slug))];
fs.writeFileSync(jsonPath, JSON.stringify(merged, null, 2) + "\n");
console.log("restored", projects.map((p) => p.slug).join("\n"));
