# راهنمای n8n — Blog HTML Template

این راهنما مثل `project-html-builder.js` برای پست‌های بلاگ است. کد کامل در **`docs/blog-html-builder.js`** قرار دارد.

---

## چه چیزهایی در template جدید fix شده؟

| مشکل | راه‌حل در template |
|------|-------------------|
| لیست‌های تقلبی `<p>* ...</p>` | `mdToHtml()` خطوط `- ` و `* ` را به `<ul><li>` تبدیل می‌کند |
| `<h2>` تکراری عنوان | اگر اولین heading در body با عنوان صفحه یکی باشد، skip می‌شود |
| نبود Twitter Card | `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` |
| نبود `og:url` | اضافه شده |
| Schema ضعیف | `BlogPosting` + `BreadcrumbList` در `@graph` با `dateModified`, author `sameAs`, ImageObject |
| Hero فقط CSS background | `<picture><img>` با `alt`, `preload`, `fetchpriority="high"` |
| تاریخ مبهم `7/10/2026` | `<time datetime="...">July 10, 2026</time>` |
| Author bio عمومی | bio تخصصی + role «Systems & Automation Specialist» |
| Sidebar/Tags با H3 اضافی | `p.blog-sidebar-title` و `p.blog-tags-label` |
| footer بدون Privacy | لینک Privacy Policy + copyright `© 2025–2026` |
| نبود robots meta | `max-image-preview:large` برای مقالات |

**منبع template:** `docs/blog-page-builder.js` — در n8n همراه با `docs/blog-html-builder.js` استفاده شود.

---

## پیش‌نیاز: nodeهای upstream در n8n

Workflow بلاگ باید قبل از Code node، یکی از این nodeها را داشته باشد:

| Node پیشنهادی | فیلدهای مورد نیاز |
|---------------|-------------------|
| `Get Blog for photo` | ردیف بلاگ از DB (publish دستی) |
| `Get Blog for AI publish` | ردیف بلاگ از DB (publish خودکار) |

اگر نام nodeهایت فرق دارد، در ابتدای `getBlogRowForHtml()` نام‌ها را عوض کن.

---

## فیلدهای ورودی (blogData)

Code node این فیلدها را از ردیف DB می‌خواند:

| فیلد | الزامی | توضیح |
|------|--------|-------|
| `blog_title` | ✅ | عنوان — در hero به `<h1>` تبدیل می‌شود |
| `short_description` | ✅ | excerpt — meta description و OG |
| `blog_content` | ✅ | متن مقاله (Markdown) |
| `category` | ✅ | مثلاً Leadership, Business |
| `blog_date` | ✅ | ISO مثل `2026-06-23` |
| `tags` | ✅ | CSV مثل `AI Strategy, Leadership` |
| `slug` | اختیاری | اگر خالی باشد از title ساخته می‌شود |
| `image_path` | اختیاری | پیش‌فرض: `/images/blog/{slug}.jpg` |
| `blog_id` | اختیاری | برای tracking در workflow |

---

## نصب در n8n (گام‌به‌گام) — workflow «Alecasgrai-website-news»

### ۱. workflow را باز کن

در n8n: **Workflows** → **Alecasgrai-website-news** (یا هر اسمی که برای بلاگ داری)

### ۲. node درست را پیدا کن

روی canvas دنبال این node بگرد:

**`Prepare Blog HTML for GitHub`**

مسیر در flow:
```
... → Prepare Blog Image for GitHub → Prepare Blog HTML for GitHub → Upload Blog HTML → ...
```

### ۳. کد را جایگزین کن

1. روی node **`Prepare Blog HTML for GitHub`** دوبار کلیک کن
2. تب **Parameters** → بخش **JavaScript Code**
3. **همه** کد فعلی را انتخاب و Delete کن
4. فایل **`docs/blog-html-builder.js`** را در Cursor باز کن → `Ctrl+A` → `Ctrl+C`
5. در n8n → `Ctrl+V`
6. دکمه **Save** (گوشه بالا راست workflow)

### ۴. تست (اختیاری ولی توصیه می‌شود)

1. روی **`Prepare Blog HTML for GitHub`** → **Execute step** (بعد از اجرای nodeهای قبل)
2. در Output باید ببینی:
   - `base64_html`
   - `blog_json_entry`
   - `blog_content_entry`
3. `base64_html` را decode کن — در `<head>` باید `BlogPosting` و Twitter meta باشد

### ۵. Import از JSON (روش جایگزین)

اگر ترجیح می‌دهی کل workflow را import کنی:

1. n8n → **Workflows** → **Import from File**
2. فایل **`Alecasgrai-website-news.json`** از repo را انتخاب کن
3. workflow قبلی را overwrite کن (یا duplicate بساز و credentials را دوباره وصل کن)

> **نکته:** nodeهای دیگر (`Normalize Blog Data`, `Merge blog JSON`, ...) را عوض نکن — فقط `Prepare Blog HTML for GitHub` آپدیت شده.

### ۲. خروجی node

```javascript
{
  slug: "ai-paradox-why-legacy-leadership-sabotages-technology",
  blog_id: 42,
  blog_link: "https://alecasgari.com/blog/ai-paradox-....html",
  image_path: "/images/blog/ai-paradox-....jpg",
  base64_html: "...",           // برای GitHub Create/Update file
  blog_json_entry: { ... }      // برای merge در blog.json
}
```

### ۳. GitHub — آپلود HTML

مثل پروژه‌ها:

| پارامتر | مقدار |
|---------|-------|
| Path | `blog/{{ $json.slug }}.html` |
| Content | `{{ $json.base64_html }}` (Base64) |
| Commit message | `Add blog: {{ $json.slug }}` |

### ۴. GitHub — merge `blog.json`

Code node دوم (مثل `Merge projects JSON`):

```javascript
// n8n Code node — نام: Merge blog JSON
const entry = $('Prepare Blog HTML for GitHub').first().json.blog_json_entry;

if (!entry || !entry.slug) {
  throw new Error('blog_json_entry not found.');
}

let existing = [];
const item = $input.first().json;

try {
  if (item.content) {
    const b64 = String(item.content).replace(/\s/g, '');
    existing = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  } else if (typeof item.data === 'string') {
    existing = JSON.parse(item.data);
  }
} catch (e) {
  existing = [];
}

if (!Array.isArray(existing)) existing = [];

const filtered = existing.filter((p) => p.slug !== entry.slug);
filtered.unshift(entry);

return {
  json: {
    blog_json_text: JSON.stringify(filtered, null, 2) + '\n',
    slug: entry.slug,
  },
};
```

### ۵. sitemap-blog.xml

بعد از publish، URL جدید را به `sitemap-blog.xml` اضافه کن (یا node جدا برای regenerate).

---

## قوانین Markdown در `blog_content`

Gemini معمولاً Markdown می‌دهد. template این‌ها را درست parse می‌کند:

```markdown
## Moving Beyond Incremental Productivity
متن پاراگراف...

* **Human-AI Synergy:** Stop delegating tasks...
* **Outcome-Driven Management:** Update your leadership...

1. اولین قدم
2. دومین قدم

### زیرعنوان

## References
* [Forbes](https://forbes.com/...)
```

**نکته:** لینک‌های markdown `[text](url)` را Gemini گاهی مستقیم HTML می‌دهد — هر دو OK است. اگر markdown link داری، قبل از Code node یک Convert node اضافه کن یا در prompt Gemini بخواه HTML بدهد.

---

## sync با repo

هر بار template را عوض کردی:

1. `docs/blog-html-builder.js` را در Cursor آپدیت کن
2. همان فایل را در n8n paste کن
3. برای پست‌های **قدیمی** که قبلاً publish شده: `node scripts/patch-blog-seo-structure.js --fetch`

---

## Batch patch برای پست‌های موجود

```bash
cd alecasgari-website

# دانلود ۱۱ پست missing از سرور live + patch همه ۱۳ تا
node scripts/patch-blog-seo-structure.js --fetch

# فقط patch فایل‌های local
node scripts/patch-blog-seo-structure.js
```

اسکریپت این کارها را انجام می‌دهد:

- `<p>* ...</p>` → `<ul><li>`
- حذف `<h2>` تکراری عنوان در `blog-prose`
- `<h1>` داخل body → `<h2>` (CRM posts قدیمی)
- اضافه کردن `og:url`, Twitter Card, `BlogPosting` JSON-LD
- Privacy Policy در footer

---

## چک‌لیست بعد از deploy

- [ ] View Source → `<script type="application/ld+json">` با `@type: BlogPosting`
- [ ] References بخش → `<ul><li>` نه `<p>*`
- [ ] ابتدای `blog-prose` بدون `<h2>` تکراری عنوان
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) — BlogPosting
