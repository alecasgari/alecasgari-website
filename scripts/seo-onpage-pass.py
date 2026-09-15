# -*- coding: utf-8 -*-
"""One-shot on-page SEO: encoding, titles, blog images, static listing cards, related links."""
from __future__ import annotations

import json
import re
from html import escape
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BLOG_DIR = ROOT / "blog"
IMG_DIR = ROOT / "images" / "blog"
ORIGIN = "https://alecasgari.com"

# Unique title (no brand). Keep <= 45 so " | Alec Asgari" stays near 60.
TITLES = {
    "strategic-ai-slowdown-sustainable-innovation-leadership": "Strategic AI Slowdown for Leaders",
    "securing-autonomous-ai-agents-in-enterprise-workflows": "Securing Autonomous AI Agents",
    "navigating-ai-workforce-shift-junior-roles-upskilling": "AI Workforce Shift and Upskilling",
    "bridging-small-business-ai-digital-divide": "Small Business AI Digital Divide",
    "why-technology-adoption-fails-without-team-consultation": "Tech Adoption Needs Team Input",
    "digital-infrastructure-sovereignty-ai-readiness": "Digital Infrastructure in the AI Era",
    "sluggish-technology-adoption-economic-growth-ai-readiness": "Fix Slow Tech Adoption and AI Fear",
    "building-the-ai-ready-organization-digital-twins-and-workforce-scalability": "AI Digital Twins and Workforce Scale",
    "digital-regulation-automation-governance-enterprise-growth": "From Reckless Automation to Trust",
    "infrastructure-deficit-in-enterprise-automation": "Fix the Enterprise Automation Gap",
    "navigating-economic-slow-lane-ai-readiness-strategy": "AI Readiness in a Slow Economy",
    "balancing-ai-growth-infrastructure-accountability": "Balance AI Growth With Accountability",
    "sustainable-ai-adoption-governance-cost-control": "AI Cost Control and Governance",
    "building-ai-ready-organizations-operational-integration": "AI-Ready Ops Through Integration",
    "navigating-financial-literacy-crisis-public-ai-business": "Public AI and Financial Literacy",
    "bridging-generative-divide-workplace-reverse-mentoring": "Reverse Mentoring for the AI Divide",
    "supporting-domain-experts-ai-workflow-adoption": "Help Domain Experts Adopt AI",
    "why-executive-leadership-determines-ai-adoption-success": "Why Leaders Decide AI Success",
    "why-new-leaders-must-understand-organization-before-change": "New Leaders: Learn the Org First",
    "building-ai-ready-organization-risk-management": "AI Risk Management for Workflows",
    "proactive-succession-planning-leadership-development": "Build Future Leaders With Succession",
    "workforce-planning-tech-strategy-ai-workflows": "Workforce Planning for AI Workflows",
    "building-ai-ready-organizations-through-cultural-shift": "AI-Ready Culture, Not Just Tools",
    "industrial-ot-asset-management-cybersecurity-strategy": "OT Visibility for Industrial Security",
    "addressing-ai-fatigue-in-modern-workplace": "Addressing AI Fatigue at Work",
    "modern-leadership-strategy-outcomes-over-tasks": "Lead With Outcomes, Not Tasks",
    "adaptive-hr-intelligence-organizational-strategy": "Adaptive HR Intelligence Strategy",
    "rethinking-agility-speed-without-strategy-is-a-failure": "Agility Fails Without Strategy",
    "the-ai-leadership-trap-why-technology-needs-human-oversight": "AI Needs Human Oversight",
    "championship-level-performance-administrative-rigor": "Admin Rigor Beats Raw Talent",
    "zero-trust-mindset-leadership-habit": "Zero Trust as a Leadership Habit",
    "moving-beyond-the-loyalty-trap-performance-first-management": "Performance-First Leadership",
    "how-to-detect-and-correct-cultural-drift": "How to Detect Cultural Drift",
    "purpose-driven-leadership-competitive-advantage": "Purpose-Driven Leadership Advantage",
    "ai-organizational-redesign-strategy": "Redesign the Org Before AI",
    "the-evolution-of-the-manager-in-the-ai-era": "Middle Managers in the AI Era",
    "ai-paradox-why-legacy-leadership-sabotages-technology": "Legacy Structure Sabotages AI",
    "the-silent-architect-leadership-execution": "Why Execution Beats Vision",
    "why-digital-transformation-fails-people-vs-tech": "Transformation Fails Without People",
    "stop-chasing-ai-hype-and-start-fixing-your-data": "Stop Chasing AI. Fix Your Data",
    "why-technology-alone-wont-save-your-business": "Technology Alone Won't Save You",
    "the-end-of-the-accidental-manager": "Don't Promote Accidental Managers",
    "the-hidden-cost-of-flattening-organizational-structures": "Why Middle Management Still Matters",
    "why-your-tech-investments-are-failing-and-how-to-fix-it": "Why Tech Investments Fail",
    "ai-strategic-imperative-business-transformation": "AI Is a Business Strategy, Not IT",
    "stop-outsourcing-your-culture-build-from-within": "Stop Outsourcing Your Culture",
    "beyond-the-algorithm-why-leadership-vision-beats-ai-efficiency": "Leadership Vision Beats AI Efficiency",
    "Best-CRM-Small-Business-2026": "Best CRM for Small Business 2026",
    "5-Signs-You-Need-a-CRM-Now": "5 Signs You Need a CRM Now",
}

SPACE_IMAGES = {
    "Best-CRM-Small-Business-2026": "Finding the Best CRM for Your Small Business.webp",
    "5-Signs-You-Need-a-CRM-Now": "5 Signs You Need a CRM Now.webp",
}

FOOTER_LINKS = """      <ul class="footer-links">
        <li><a href="/blog.html">Blog</a></li>
        <li><a href="/projects.html">Projects</a></li>
        <li><a href="https://calculator.alecasgari.com/">Calculator</a></li>
        <li><a href="/privacy-policy.html"><iconify-icon icon="lucide:shield"></iconify-icon> Privacy Policy</a></li>
        <li><a href="https://www.linkedin.com/in/alecasgari/" target="_blank" rel="noopener"><iconify-icon icon="lucide:linkedin"></iconify-icon> LinkedIn</a></li>
        <li><a href="https://github.com/alecasgari" target="_blank" rel="noopener"><iconify-icon icon="lucide:github"></iconify-icon> GitHub</a></li>
        <li><a href="mailto:hello@alecasgari.com"><iconify-icon icon="lucide:mail"></iconify-icon> Email</a></li>
      </ul>"""


def read_text(path: Path) -> str:
    raw = path.read_bytes()
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return raw.decode("cp1252")


def write_text(path: Path, text: str) -> None:
    path.write_text(text.replace("\r\n", "\n"), encoding="utf-8", newline="\n")


def fix_mojibake(text: str) -> str:
    text = text.replace("\u00a0", " ")
    replacements = [
        ("Systems \ufffd Automation \ufffd AI", "Systems · Automation · AI"),
        ("businesses \ufffd written", "businesses — written"),
        ("Loading articles\ufffd", "Loading articles…"),
        ("\ufffd 2025\ufffd2026", "© 2025–2026"),
        ("hello\ufffddrop", "hello — drop"),
        ("savings \ufffd free", "savings — free"),
        ("Contact Alec Asgari \ufffd ", "Contact Alec Asgari — "),
        ("Contact Alec Asgari \u0097 ", "Contact Alec Asgari — "),
        ("\u0097", "—"),
        ("\u0092", "’"),
        ("\u0093", "“"),
        ("\u0094", "”"),
        ("\u0096", "–"),
    ]
    for a, b in replacements:
        text = text.replace(a, b)
    text = text.replace("\ufffd", "—")
    return text


def find_source_image(slug: str) -> Path | None:
    if slug in SPACE_IMAGES:
        p = IMG_DIR / SPACE_IMAGES[slug]
        if p.exists():
            return p
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        p = IMG_DIR / f"{slug}{ext}"
        if p.exists():
            return p
    matches = list(IMG_DIR.glob(f"{slug}.*"))
    return matches[0] if matches else None


def save_webp(src: Path, dest: Path, max_w: int, quality: int) -> None:
    img = Image.open(src)
    if img.mode in ("P", "RGBA"):
        img = img.convert("RGBA")
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    if img.width > max_w:
        ratio = max_w / img.width
        img = img.resize((max_w, max(1, int(img.height * ratio))), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "WEBP", quality=quality, method=6)


def optimize_images(posts: list[dict]) -> dict[str, dict[str, str]]:
    mapping = {}
    for post in posts:
        slug = post["slug"]
        src = find_source_image(slug)
        if not src:
            print("NO IMAGE", slug)
            continue
        detail = IMG_DIR / f"{slug}.webp"
        card = IMG_DIR / f"{slug}-card.webp"
        save_webp(src, detail, 1400, 78)
        save_webp(src, card, 720, 72)
        mapping[slug] = {
            "detail": f"/images/blog/{slug}.webp",
            "card": f"/images/blog/{slug}-card.webp",
            "old_names": [src.name],
        }
        print(f"IMG {slug}: {src.stat().st_size} -> detail {detail.stat().st_size} card {card.stat().st_size}")
    return mapping


def card_html(post: dict, index: int) -> str:
    eager = index < 2
    loading = "eager" if eager else "lazy"
    prio = ' fetchpriority="high"' if eager else ""
    img = escape(post.get("card_image") or post.get("image") or "")
    return (
        f'<article class="project-card-item">'
        f'<a href="{escape(post["url"])}" class="project-card-link">'
        f'<div class="project-card">'
        f'<img src="{img}" alt="{escape(post["title"])}" class="project-card-thumb" '
        f'width="720" height="405" loading="{loading}" decoding="async"{prio}>'
        f'<div class="project-card-body">'
        f'<span class="project-tag">{escape(post.get("category") or "")}</span>'
        f'<h3>{escape(post["title"])}</h3>'
        f'<p>{escape(post.get("excerpt") or "")}</p>'
        f"</div></div></a></article>"
    )


def related_block(current: dict, posts: list[dict]) -> str:
    others = [p for p in posts if p["slug"] != current["slug"]]
    same = [p for p in others if p.get("category") == current.get("category")]
    rest = [p for p in others if p not in same]
    # Prefer commercial posts in the mix
    hubs = [p for p in others if p["slug"] in ("Best-CRM-Small-Business-2026", "5-Signs-You-Need-a-CRM-Now")]
    picked = []
    for group in (hubs, same, rest):
        for p in group:
            if p not in picked:
                picked.append(p)
            if len(picked) == 3:
                break
        if len(picked) == 3:
            break
    cards = []
    for p in picked:
        img = escape(p.get("card_image") or p.get("image") or "")
        cards.append(
            f'<a href="{escape(p["url"])}" class="project-related-card">'
            f'<div class="project-related-img"><img src="{img}" alt="{escape(p["title"])}" '
            f'width="720" height="405" loading="lazy" decoding="async"></div>'
            f'<div class="project-related-body"><div class="project-related-labels">'
            f'<span class="project-related-label">{escape(p.get("category") or "")}</span></div>'
            f'<h3>{escape(p["title"])}</h3><p>{escape(p.get("excerpt") or "")}</p></div></a>'
        )
    extra = (
        '<p class="blog-related-extra">'
        '<a href="https://calculator.alecasgari.com/">SaaS cost calculator</a> · '
        '<a href="/projects/AI-Powered-Telegram--N8N-Workflow-for-Automated-Voice-to-Presentation.html">n8n Telegram voice-to-PowerPoint</a> · '
        '<a href="/blog/Best-CRM-Small-Business-2026.html">Best CRM for small business</a>'
        "</p>"
    )
    return (
        '<section class="section section-alt"><div class="container">'
        '<p class="eyebrow"><iconify-icon icon="lucide:book-open"></iconify-icon> More Articles</p>'
        '<h2 class="section-title">Continue Reading</h2>'
        f'<div class="blog-related-grid">{"".join(cards)}</div>{extra}'
        "</div></section>\n"
    )


def update_html_post(post: dict, posts: list[dict], img_map: dict) -> None:
    path = BLOG_DIR / f"{post['slug']}.html"
    if not path.exists():
        return
    html = fix_mojibake(read_text(path))
    new_title = post["title"]
    page_title = f"{new_title} | Alec Asgari"

    html = re.sub(r"<title>.*?</title>", f"<title>{escape(page_title)}</title>", html, count=1, flags=re.I | re.S)
    html = re.sub(
        r'(property="og:title" content=")[^"]*"',
        lambda m: f'{m.group(1)}{escape(new_title)}"',
        html,
    )
    html = re.sub(
        r'(name="twitter:title" content=")[^"]*"',
        lambda m: f'{m.group(1)}{escape(new_title)}"',
        html,
    )
    html = re.sub(
        r'("headline"\s*:\s*")[^"]*"',
        lambda m: f'{m.group(1)}{escape(new_title)}"',
        html,
    )
    html = re.sub(
        r'(<h1 class="hero-in hero-in-d1">)(.*?)(</h1>)',
        lambda m: f"{m.group(1)}{escape(new_title)}{m.group(3)}",
        html,
        count=1,
        flags=re.S,
    )

    slug = post["slug"]
    if slug in img_map:
        detail = img_map[slug]["detail"]
        abs_detail = ORIGIN + detail
        old_paths = [
            f"/images/blog/{slug}.jpg",
            f"/images/blog/{slug}.jpeg",
            f"/images/blog/{slug}.png",
            f"/images/blog/{slug}.webp",
        ]
        if slug in SPACE_IMAGES:
            old_paths.append(f"/images/blog/{SPACE_IMAGES[slug]}")
        for old in old_paths:
            html = html.replace(f"url('{old}')", f"url('{detail}')")
            html = html.replace(old, detail)
            html = html.replace(ORIGIN + old, abs_detail)

    if 'class="blog-related-grid"' not in html:
        block = related_block(post, posts)
        html = html.replace(
            '<section class="section section-alt section-tight">',
            block + '<section class="section section-alt section-tight">',
            1,
        )
    elif 'class="blog-related-extra"' not in html:
        html = re.sub(
            r'(<div class="blog-related-grid">[\s\S]*?</div>)(\s*</div>\s*</section>)',
            r'\1<p class="blog-related-extra">'
            r'<a href="https://calculator.alecasgari.com/">SaaS cost calculator</a> · '
            r'<a href="/projects/AI-Powered-Telegram--N8N-Workflow-for-Automated-Voice-to-Presentation.html">n8n Telegram voice-to-PowerPoint</a> · '
            r'<a href="/blog/Best-CRM-Small-Business-2026.html">Best CRM for small business</a>'
            r"</p>\2",
            html,
            count=1,
        )

    html = re.sub(r"<ul class=\"footer-links\">[\s\S]*?</ul>", FOOTER_LINKS, html, count=1)
    html = html.replace("site.css?v=9", "site.css?v=10")
    write_text(path, html)


def replace_inner_div(html: str, open_tag: str, inner: str) -> str:
    start = html.find(open_tag)
    if start < 0:
        return html
    i = start + len(open_tag)
    depth = 1
    while i < len(html) and depth:
        if html.startswith("<div", i):
            depth += 1
            i += 4
        elif html.startswith("</div>", i):
            depth -= 1
            if depth == 0:
                return html[: start + len(open_tag)] + "\n" + inner + "\n    " + html[i:]
            i += 6
        else:
            i += 1
    return html


def inject_listing(file_name: str, grid_id: str, cards: str) -> None:
    path = ROOT / file_name
    html = fix_mojibake(read_text(path))
    html = re.sub(r"\s*<noscript>\s*<ul class=\"seo-fallback-list\">[\s\S]*?</ul>\s*</noscript>\s*", "\n", html)
    html = replace_inner_div(html, f'<div id="{grid_id}" class="stagger">', cards)
    html = re.sub(r"<ul class=\"footer-links\">[\s\S]*?</ul>", FOOTER_LINKS, html, count=1)
    html = html.replace("site.css?v=9", "site.css?v=10")
    html = html.replace("blog-list.js?v=1", "blog-list.js?v=2")
    html = html.replace("projects-list.js?v=6", "projects-list.js?v=7")
    write_text(path, html)


def patch_core_pages() -> None:
    for name in (
        "index.html",
        "about.html",
        "contact.html",
        "projects.html",
        "case-studies.html",
        "privacy-policy.html",
        "thank-you.html",
    ):
        path = ROOT / name
        if not path.exists():
            continue
        html = fix_mojibake(read_text(path))
        html = re.sub(r"<ul class=\"footer-links\">[\s\S]*?</ul>", FOOTER_LINKS, html, count=1)
        html = html.replace("site.css?v=9", "site.css?v=10")
        write_text(path, html)

    contact = ROOT / "contact.html"
    html = read_text(contact)
    html = html.replace(
        "<title>Contact Alec Asgari — Automation &amp; ERP</title>",
        "<title>Contact Alec Asgari — Automation &amp; ERP</title>",
    )
    if "n8n Telegram voice-to-PowerPoint" not in html:
        html = html.replace(
            '<p class="section-lead hero-in hero-in-d2">Whether you want to hire me for a role in Australia, discuss a system integration project, or just say hello — drop me a message.</p>',
            '<p class="section-lead hero-in hero-in-d2">Whether you want to hire me for a role in Australia, discuss a system integration project, or just say hello — drop me a message. See the <a href="/blog/Best-CRM-Small-Business-2026.html">CRM buying guide</a>, the <a href="/projects/AI-Powered-Telegram--N8N-Workflow-for-Automated-Voice-to-Presentation.html">n8n Telegram voice-to-PowerPoint bot</a>, or the <a href="https://calculator.alecasgari.com/">SaaS cost calculator</a>.</p>',
        )
    write_text(contact, html)

    about = ROOT / "about.html"
    html = read_text(about)
    if "Best CRM for small business" not in html:
        html = html.replace(
            "<p>Over the past 9 years, I have worked across different markets, including Iran and the UAE. I don't just write code; I look at a business, find the bottlenecks, and design the exact system needed to fix them. I am now preparing to bring this expertise to the market.</p>",
            "<p>Over the past 9 years, I have worked across different markets, including Iran and the UAE. I don't just write code; I look at a business, find the bottlenecks, and design the exact system needed to fix them. Recent examples include the <a href=\"/projects/AI-Powered-Telegram--N8N-Workflow-for-Automated-Voice-to-Presentation.html\">n8n Telegram voice-to-PowerPoint workflow</a>, <a href=\"/case-studies.html\">ERP and event case studies</a>, a <a href=\"/blog/Best-CRM-Small-Business-2026.html\">CRM guide for small teams</a>, and a free <a href=\"https://calculator.alecasgari.com/\">SaaS cost calculator</a>.</p>",
        )
    write_text(about, html)


def main() -> None:
    posts = json.loads((ROOT / "data" / "blog.json").read_text(encoding="utf-8"))
    img_map = optimize_images(posts)

    for post in posts:
        slug = post["slug"]
        if slug in TITLES:
            post["title"] = TITLES[slug]
        if slug in img_map:
            post["image"] = img_map[slug]["detail"]
            post["card_image"] = img_map[slug]["card"]

    (ROOT / "data" / "blog.json").write_text(
        json.dumps(posts, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    content_path = ROOT / "data" / "blog-content.json"
    if content_path.exists():
        try:
            content = json.loads(content_path.read_text(encoding="utf-8"))
            items = content if isinstance(content, list) else content.get("posts") or content.get("items") or []
            by_slug = {p["slug"]: p["title"] for p in posts}
            changed = False
            for item in items:
                slug = item.get("slug")
                if slug in by_slug:
                    item["title"] = by_slug[slug]
                    changed = True
            if changed:
                content_path.write_text(json.dumps(content, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        except Exception as exc:
            print("blog-content skip", exc)

    for post in posts:
        update_html_post(post, posts, img_map)

    dated = sorted(posts, key=lambda p: p.get("date") or "", reverse=True)
    blog_cards = "\n      ".join(card_html(p, i) for i, p in enumerate(dated))
    inject_listing("blog.html", "blog-grid", "      " + blog_cards)

    projects = json.loads((ROOT / "data" / "projects.json").read_text(encoding="utf-8"))
    project_cards = []
    for i, p in enumerate(sorted(projects, key=lambda x: x.get("date") or "", reverse=True)):
        eager = i < 2
        loading = "eager" if eager else "lazy"
        prio = ' fetchpriority="high"' if eager else ""
        project_cards.append(
            f'<article class="project-card-item">'
            f'<a href="{escape(p.get("url") or "/projects/" + p["slug"] + ".html")}" class="project-card-link">'
            f'<div class="project-card">'
            f'<img src="{escape(p.get("image") or "")}" alt="{escape(p.get("title") or "")}" class="project-card-thumb" '
            f'width="720" height="405" loading="{loading}" decoding="async"{prio}>'
            f'<div class="project-card-body">'
            f'<span class="project-tag">{escape(p.get("category") or "")}</span>'
            f'<h3>{escape(p.get("title") or "")}</h3>'
            f'<p>{escape(p.get("excerpt") or "")}</p>'
            f"</div></div></a></article>"
        )
    inject_listing("projects.html", "projects-grid", "      " + "\n      ".join(project_cards))

    patch_core_pages()
    print("done posts", len(posts), "images", len(img_map))


if __name__ == "__main__":
    main()
