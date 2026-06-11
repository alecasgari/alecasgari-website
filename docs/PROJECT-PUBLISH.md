# Voice → Live Project (n8n)

## ساختار سایت

```
alecasgari-website/
├── projects/
│   ├── my-project-slug.html    ← صفحه پروژه (دستی هم قابل ویرایش)
│   └── my-project-slug.jpg     ← عکس کاور (همان slug)
├── data/
│   └── projects.json           ← فقط برای لیست کارت‌ها در projects.html
└── blog/                       ← بعداً (همان الگو)
```

## JSON یا HTML؟

| | HTML | JSON |
|---|------|------|
| **چیست** | صفحه کامل هر پروژه | لیست خلاصه برای کارت‌ها |
| **کی عوض می‌شود** | n8n می‌سازد، تو بعداً دستی ویرایش می‌کنی | n8n یک ردیف اضافه می‌کند |
| **محتوای اصلی** | ✅ اینجا | ❌ نه |

**خلاصه:** محتوا = HTML جدا. JSON فقط برای نمایش در صفحه Projects و Home.

## جریان n8n (همان ورکفلوی فعلی)

```
ویس تلگرام → Gemini → Google Sheet → پیش‌نمایش + Yes
→ عکس تلگرام → GitHub commit → لایو (~۱۵ ثانیه)
```

## GitHub — چه فایل‌هایی commit شود

Repo: **`alecasgari/alecasgari-website`** (نه gullible-giant)

| فایل | مسیر |
|------|------|
| عکس | `projects/{slug}.jpg` |
| صفحه | `projects/{slug}.html` |
| لیست | `data/projects.json` (یک entry جدید) |

**Deploy:** node `HTTP Request` به `127.0.0.1:9876` لازم نیست — هر push به `main` خودش deploy می‌کند.

## فیلدهای entry در `data/projects.json`

```json
{
  "slug": "my-project-slug",
  "title": "...",
  "excerpt": "...",
  "image": "/projects/my-project-slug.jpg",
  "category": "AI Automation",
  "tags": ["tag1", "tag2"],
  "technologies": ["n8n", "Node.js"],
  "date": "2025-10-01",
  "clientName": "...",
  "clientCompany": "...",
  "duration": "3 weeks",
  "status": "Completed",
  "featured": true,
  "projectLink": "https://...",
  "url": "/projects/my-project-slug.html"
}
```

## slug

از `project_title` ساخته می‌شود: حروف و عدد و `-`، حداکثر ۸۰ کاراکتر.

مثال: `AI Chatbot for Sales` → `AI-Chatbot-for-Sales`

## Code node در n8n

کد آماده: [`docs/n8n-prepare-project-html.js`](./n8n-prepare-project-html.js)

**مهم:** در Code node فقط `$('Get Project for photo')` استفاده شود — به nodeهای دیگر با `$('...')` ارجاع ندهید (خطای Referenced node doesn't exist).

خروجی:
- `base64_image` → GitHub Upload image
- `base64_html` → GitHub Upload HTML
- `projects_json_entry` → برای آپدیت `data/projects.json`

## بعد از publish

در تلگرام بفرست:
`https://alecasgari.com/projects/{slug}.html`

## چیزهایی که فعلاً لازم نیست

- YouTube upload
- Pexels / ویدیو
- deploy محلی `:9876`
- Markdown / Tina
