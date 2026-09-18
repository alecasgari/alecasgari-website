import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
posts = json.loads((root / "data" / "blog.json").read_text(encoding="utf-8"))
posts.sort(key=lambda p: p.get("date") or "", reverse=True)
skip = {"Best-CRM-Small-Business-2026", "5-Signs-You-Need-a-CRM-Now"}
recent = [p for p in posts if p.get("slug") not in skip][:20]

CALC = "https://calculator.alecasgari.com/"
TG = "/projects/AI-Powered-Telegram--N8N-Workflow-for-Automated-Voice-to-Presentation.html"
CRM = "/blog/Best-CRM-Small-Business-2026.html"

NEEDLES = [
    (
        '<section class="section section-alt"><div class="container">'
        '<p class="eyebrow"><iconify-icon icon="lucide:book-open"></iconify-icon> More Articles</p>'
    ),
    (
        '<section class="section section-alt"><div class="container reveal">'
        '<p class="eyebrow"><iconify-icon icon="lucide:book-open"></iconify-icon> More Articles</p>'
    ),
]
MARKER = "data-funnel-cta"


def classify(p):
    t = " ".join(
        [
            p.get("title", ""),
            p.get("excerpt", ""),
            p.get("slug", ""),
            p.get("category", ""),
        ]
    ).lower()
    if "crm" in t:
        return (
            "Compare CRM seats with SuiteCRM you host",
            "If this piece is about systems of record, the next commercial step is SuiteCRM in a one-time stack — not another HubSpot quote.",
            CRM,
            "CRM guide",
            CALC,
            "SaaS cost calculator",
        )
    if any(k in t for k in ("n8n", "telegram", "workflow", "automation")):
        return (
            "See a live n8n Telegram workflow",
            "Custom bots are scoped separately from the packaged stack. Start with a shipped voice-to-PowerPoint example, or price replacing seat-based SaaS.",
            TG,
            "Telegram voice-to-PowerPoint",
            CALC,
            "SaaS cost calculator",
        )
    return (
        "Own the stack instead of renting seats",
        "Leadership notes belong on LinkedIn. On this site the commercial path is a one-time Mailcow, SuiteCRM, Mautic, Nextcloud and n8n install.",
        CALC,
        "SaaS cost calculator",
        TG,
        "n8n Telegram bot",
    )


updated = 0
already = 0
missing = []
for p in recent:
    slug = p.get("slug")
    path = root / "blog" / f"{slug}.html"
    if not path.exists():
        missing.append(slug)
        continue
    html = path.read_text(encoding="utf-8")
    if MARKER in html:
        already += 1
        continue
    needle = next((n for n in NEEDLES if n in html), None)
    if not needle:
        missing.append(f"{slug} (no continue block)")
        continue
    title, lead, href1, label1, href2, label2 = classify(p)
    block = (
        f'<section class="section funnel-cta-section" {MARKER}>'
        '<div class="container reveal">'
        '<p class="eyebrow"><iconify-icon icon="lucide:unplug"></iconify-icon> Next step</p>'
        f'<h2 class="section-title">{title}</h2>'
        f'<p class="section-lead">{lead}</p>'
        f'<p class="blog-related-extra"><a href="{href1}">{label1}</a> · <a href="{href2}">{label2}</a> · <a href="{CRM}">Best CRM for small business</a></p>'
        "</div></section>\n    "
    )
    path.write_text(html.replace(needle, block + needle, 1), encoding="utf-8")
    updated += 1

print("updated", updated)
print("already", already)
print("missing", missing)
print("slugs", [p.get("slug") for p in recent])
