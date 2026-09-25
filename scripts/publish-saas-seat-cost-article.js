/**
 * Week-2 commercial post: SaaS seats vs the $1899 owned stack.
 * Run: node scripts/publish-saas-seat-cost-article.js
 */
const fs = require("fs");
const path = require("path");
const { buildBlogHtml, renderRelatedHtml, mdToHtml } = require("../docs/blog-page-builder");

const ROOT = path.join(__dirname, "..");
const SLUG = "saas-seat-cost-vs-owned-stack";
const POST = {
  slug: SLUG,
  title: "HubSpot, Workspace, and Zapier Cost for Small Teams",
  excerpt:
    "What a 5–20 person team actually pays for HubSpot, Google Workspace, Mailchimp, Dropbox and Zapier — and when a one-time Mailcow, SuiteCRM, Mautic, Nextcloud and n8n stack is cheaper.",
  category: "Business",
  date: "2026-09-25",
  image: `/images/blog/${SLUG}.webp`,
  url: `/blog/${SLUG}.html`,
  author: "Alec Asgari",
  author_image: "/assets/images/team/alec-asgari-author.webp",
  card_image: `/images/blog/${SLUG}-card.webp`,
};

const TAGS = [
  "saas cost calculator",
  "hubspot cost small business",
  "google workspace cost",
  "zapier alternative",
  "self hosted crm",
];

const MD = `
A 12-person company can spend more on seats than on the person who runs those tools. Google Workspace, HubSpot, Mailchimp, Dropbox and Zapier are good products. They are also five invoices that grow when you hire, and five places your customer data does not live together.

This is the week-two commercial piece on this site: the math, the lock-in, and the line between a one-time stack and a custom n8n bot. Run your own numbers in the [SaaS cost calculator](https://calculator.alecasgari.com/). The calculator is the product page. This article is the proof.

## The stack most 5–20 person teams already pay for

I am using public list prices, not a private quote. Your reseller discount will move the monthly total. The shape of the bill does not.

- **Google Workspace Business Standard** — about $14 per user per month. Ten people: $140. Twenty: $280. That is mail, calendar and Drive with someone else's retention rules.
- **HubSpot Sales Hub Starter** — about $20 per seat per month if you actually give every seller a seat. Ten seats: $200. Marketing Hub Professional is a different league; teams land there when Starter forms stop being enough.
- **Mailchimp Standard** — often $20–50 per month at a few thousand contacts, then a step-change when the list grows.
- **Dropbox Business** — about $15 per user per month if files are not already sitting only in Drive.
- **Zapier Professional / Team** — $50–70 per month before task overages. The overage is where “cheap automation” stops being cheap.

For a **10-person** team that buys all five at those list prices, you are looking at roughly **$600 a month**, or **about $7,200 in the first year**, before HubSpot upgrades, extra Zapier tasks, extra Mailchimp contacts, or a second CRM someone started in a spreadsheet.

A **20-person** team on the same mix is closer to **$1,000+ a month**. That is a junior hire, spent on renewals.

Those figures are conservative. They assume Starter HubSpot, not Professional. They assume one Zapier workspace, not three departments each with a credit card.

## What the invoice does not show

Seat software charges you for people. It also charges you for the glue.

- **Admin time.** Someone owns SSO, offboarding, and “why did that Zap fire twice.” That person is not in the invoice.
- **Integration tax.** HubSpot talks to Workspace if you pay for the right tier. Files still live in Dropbox. Campaigns still live in Mailchimp. n8n or Zapier becomes the fourth system of record.
- **Export day.** The day you leave HubSpot you will learn which objects export cleanly. The day you leave Workspace you will learn which shared drives were actually owned by a contractor.
- **Quiet upgrades.** Starter is a landing page. The sales motion is Professional. The calculator on this site models typical seats; it does not model the upgrade email you will get in month nine.

If the real problem is “we have no CRM,” start with the [best CRM guide for small teams](https://alecasgari.com/blog/Best-CRM-Small-Business-2026.html) and the [five signs you need a CRM now](https://alecasgari.com/blog/5-Signs-You-Need-a-CRM-Now.html). Both of those posts point at SuiteCRM on a server you own, not at another seat contract.

## The one-time alternative

The offer on the calculator is not “five cheaper SaaS tools.” It is one install:

- **Mailcow** — mail and calendar on your domain, no per-mailbox tax.
- **SuiteCRM** — pipeline and contacts, unlimited users.
- **Mautic** — campaigns without a contact-tier surprise.
- **Nextcloud** — files and sharing without a Dropbox seat.
- **n8n** — workflows you can see, edit, and host.
- **A dedicated server** — included in the setup.

**$1,899 once.** After that you pay hosting and your own time, not a seat multiplier. For the 10-person example above, the first-year SaaS bill is already more than three times that fee. For twenty people it is not a close contest.

You do not get HubSpot’s UI polish on day one. You get ownership, one place for data, and n8n as the bus instead of Zapier tasks. If that trade is wrong for you, do not buy it. If it is right, the [calculator](https://calculator.alecasgari.com/) is where you check the delta against your actual headcount.

## When you should not buy the stack

Do not buy the package if the only job is one Telegram bot. That is custom n8n, scoped and priced as a project. See the [voice-to-PowerPoint bot](https://alecasgari.com/projects/AI-Powered-Telegram--N8N-Workflow-for-Automated-Voice-to-Presentation.html) and the [architecture write-up](https://alecasgari.com/blog/n8n-telegram-bot-voice-to-powerpoint.html).

Do not buy the package if the team will not run a server. Ownership includes updates. If nobody will own Mailcow after go-live, keep paying Google.

Do not buy the package to “replace HubSpot next Tuesday.” A migration is a project. The $1,899 is install and wiring, not a promise that last year’s deals appear magically in SuiteCRM.

## How I would decide in one afternoon

1. Count paying seats, not employees on Slack.
2. Open the last twelve invoices. Add Zapier overages.
3. Put the same headcount into the [SaaS cost calculator](https://calculator.alecasgari.com/).
4. If year-one savings are real and someone will own the box, talk. If the only win is a prettier dashboard, stay on seats.
5. If you still need a one-off bot, [contact me](https://alecasgari.com/contact.html) for that job separately.

## Frequently asked questions

### How much do HubSpot, Google Workspace, and Zapier cost for a 10-person team?

At public list prices, a common mix is about $600 per month, or about $7,200 in year one, before HubSpot upgrades and Zapier task overages. Use the calculator with your real seat counts.

### Is the $1,899 stack a HubSpot replacement?

It replaces the *job* of seats: mail, CRM, campaigns, files, and automation. It is SuiteCRM and Mautic, not a HubSpot clone. Read the CRM posts if the only question is the CRM layer.

### Do I still need Zapier if I have n8n?

Not for the workflows that live on your server. Custom bots and odd SaaS connectors can still justify a small Zapier plan. Most 5–20 person teams I see do not need both.

### Can I keep Google Workspace and only move CRM?

Yes. The calculator is a comparison, not a hostage note. Many teams move CRM and files first and leave mail for a second pass.
`;

function patchInternalLinks(html) {
  return html.replace(
    /<a href="(https:\/\/alecasgari\.com)(\/[^"]+)" target="_blank" rel="noopener">/g,
    '<a href="$2">'
  );
}

function addSidebarCtas(html) {
  const btn =
    `          <a href="https://calculator.alecasgari.com/" class="btn btn-primary btn-block" style="margin-top:0.5rem">\n` +
    `            <iconify-icon icon="lucide:calculator"></iconify-icon>\n` +
    `            Run the calculator\n` +
    `          </a>\n` +
    `          <a href="/blog/Best-CRM-Small-Business-2026.html" class="btn btn-outline btn-block" style="margin-top:0.5rem">\n` +
    `            <iconify-icon icon="lucide:users"></iconify-icon>\n` +
    `            CRM for small teams\n` +
    `          </a>\n`;
  return html.replace(
    `<a href="/contact.html" class="btn btn-primary btn-block" style="margin-top:0.5rem">
            <iconify-icon icon="lucide:mail"></iconify-icon>
            Get in Touch
          </a>`,
    btn +
      `          <a href="/contact.html" class="btn btn-outline btn-block" style="margin-top:0.5rem">
            <iconify-icon icon="lucide:mail"></iconify-icon>
            Get in Touch
          </a>`
  );
}

function addFaqSchema(html) {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much do HubSpot, Google Workspace, and Zapier cost for a 10-person team?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "At public list prices, a common mix is about $600 per month, or about $7,200 in year one, before HubSpot upgrades and Zapier task overages.",
        },
      },
      {
        "@type": "Question",
        name: "Is the $1,899 stack a HubSpot replacement?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It replaces the job of seats: mail, CRM, campaigns, files, and automation using Mailcow, SuiteCRM, Mautic, Nextcloud and n8n. It is not a HubSpot clone.",
        },
      },
      {
        "@type": "Question",
        name: "Do I still need Zapier if I have n8n?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Not for workflows that live on your server. A small Zapier plan can remain for odd SaaS connectors.",
        },
      },
    ],
  };
  return html.replace(
    "</head>",
    `  <script type="application/ld+json">${JSON.stringify(faq).replace(/</g, "\\u003c")}</script>\n</head>`
  );
}

const blogPath = path.join(ROOT, "data", "blog.json");
const posts = JSON.parse(fs.readFileSync(blogPath, "utf8"));
const without = posts.filter((p) => p.slug !== SLUG);
without.unshift(POST);
fs.writeFileSync(blogPath, JSON.stringify(without, null, 2) + "\n");

const relatedPool = [
  POST,
  ...without.filter((p) =>
    [
      "n8n-telegram-bot-voice-to-powerpoint",
      "Best-CRM-Small-Business-2026",
      "5-Signs-You-Need-a-CRM-Now",
    ].includes(p.slug)
  ),
];
const related = renderRelatedHtml(POST, relatedPool);
let body = mdToHtml(MD.trim(), POST.title);
body = patchInternalLinks(body);

let html = buildBlogHtml(POST, body, TAGS, { relatedHtml: related, image: POST.image });
html = addSidebarCtas(html);
html = addFaqSchema(html);
fs.writeFileSync(path.join(ROOT, "blog", `${SLUG}.html`), html);

const contentPath = path.join(ROOT, "data", "blog-content.json");
if (fs.existsSync(contentPath)) {
  const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
  content[SLUG] = { body, tags: TAGS };
  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2) + "\n");
}

console.log("wrote", `/blog/${SLUG}.html`);
