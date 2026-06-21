# چک‌لیست اولیه اقدامات SEO

| فیلد | مقدار |
|------|-------|
| **نسخه** | 1.0.0 |
| **تاریخ تهیه** | 2026-06-21 |
| **مبنا** | [گزارش اولیه v1.0.0](./gozaresh-avalieh-v1.md) |
| **دامنه** | alecasgari.com + calculator.alecasgari.com |

---

## راهنمای استفاده

- هر آیتم را با `[ ]` شروع کن و بعد از انجام به `[x]` تبدیل کن.
- **اولویت:** 🔴 فوری · 🟡 کوتاه‌مدت · 🟢 میان‌مدت
- **مسئول:** Alec (مالک سایت) — مگر خلافش نوشته شده باشد.
- بعد از هر فاز، در GSC دکمه **Validate Fix** را بزن.

---

## فاز ۱ — فوری (هفته ۱: 2026-06-21 تا 2026-06-28)

### 1.1 🔴 ساخت صفحه Privacy Policy

| | |
|---|---|
| **هدف** | رفع 404 در GSC؛ الزام قانونی برای فرم Calculator |
| **مهلت پیشنهادی** | 2026-06-23 |
| **وضعیت** | `[ ]` انجام نشده |

**چرا مهم است:** GSC یک 404 برای `/privacy-policy` گزارش داده. Calculator در مودال ایمیل به این URL لینک می‌دهد.

**نحوه اجرا:**

1. فایل `privacy-policy.html` در root پروژه بساز (مثل ساختار `about.html`).
2. محتوا: جمع‌آوری داده (ایمیل، فرم‌ها)، استفاده از n8n webhook، حق unsubscribe، تماس.
3. `<link rel="canonical" href="https://alecasgari.com/privacy-policy.html">` بگذار.
4. URL بدون `.html` هم کار کند — در فاز ۱.۲ redirect اضافه می‌شود.
5. لینک footer سایت و Calculator را به `https://alecasgari.com/privacy-policy.html` به‌روز کن.
6. به `sitemap-pages.xml` اضافه کن.
7. Deploy و تست: `curl -I https://alecasgari.com/privacy-policy.html` → باید 200 باشد.
8. GSC → Page indexing → Not found (404) → **Validate Fix**.

---

### 1.2 🔴 تنظیم 301 Redirect در nginx

| | |
|---|---|
| **هدف** | یکپارچه‌سازی URLهای قدیمی Astro با ساختار جدید |
| **مهلت پیشنهادی** | 2026-06-24 |
| **وضعیت** | `[ ]` انجام نشده |

**چرا مهم است:** ۱۷ صفحه «Crawled - not indexed» به‌خاطر duplicate URL و redirect نادرست هستند.

**نحوه اجرا:**

1. روی VPS فایل nginx مربوط به `alecasgari.com` را پیدا کن (معمولاً در NPM یا `/etc/nginx/`).
2. این redirectها را اضافه کن:

```nginx
# URLهای بدون .html → نسخه canonical
location = /about    { return 301 /about.html; }
location = /contact  { return 301 /contact.html; }
location = /blog     { return 301 /blog.html; }
location = /projects { return 301 /projects.html; }

# trailing slash
location = /thank-you/     { return 301 /thank-you.html; }
location = /privacy-policy { return 301 /privacy-policy.html; }

# services و docs (الان meta refresh دارند — بهتر 301 شود)
location = /services { return 301 /; }
location = /docs     { return 301 /; }

# پروژه‌ها: trailing slash → .html
location ~ ^/projects/(.+)/$ {
    return 301 /projects/$1.html;
}
```

3. `nginx -t` و reload.
4. تست:

```bash
curl -sI https://alecasgari.com/about | grep -i location
curl -sI https://alecasgari.com/privacy-policy | grep -i location
curl -sI https://alecasgari.com/projects/AI-Powered-Chatbot/ | grep -i location
```

5. GSC → Crawled - currently not indexed → بعد از ۱–۲ هفته **Validate Fix**.

---

### 1.3 🔴 بازگردانی ۱۵ صفحه پروژه redirect stub

| | |
|---|---|
| **هدف** | برگرداندن محتوای پروژه‌های tech-heavy به ایندکس گوگل |
| **مهلت پیشنهادی** | 2026-06-28 |
| **وضعیت** | `[ ]` انجام نشده |

**صفحات affected (الان فقط redirect به `/projects.html`):**

- `AI-Powered-Chatbot.html`
- `AI-Powered-Telegram--N8N-Workflow-for-Automated-Voice-to-Presentation.html`
- `ERP-System-Implementation.html`
- `ERP-System-Integration-and-Workflow-Automation.html`
- `Full-business-automation-implementation.html`
- `Intelligent-Multi-Step-Migration-Form-Automation-for-Rahkar-Gasht.html`
- `Development-of-an-Advanced-Car-Rental--Booking-Portal-for-the-Dubai-Market.html`
- `Automated-Webinar-Registration-and-Lead-Management-System.html`
- `Automated-Blood-Glucose-Monitoring-and-Health-Tracking-Web-Platform.html`
- `Comprehensive-BPMS-Implementation-for-Mashoon-Consulting.html`
- `Custom-Data-Integration-for-Stonix-Systems.html`
- `Brand-Identity-Design-for-Golden-Chain-Company.html`
- `End-to-End-IPTV-Smart-Pro-Platform-Development-and-Integration.html`
- `IPTV-Smart-Solutions-Development-for-IPTV-Smarters-Pro-2026.html`
- `amber-bottle.html`

**نحوه اجرا:**

1. محتوای قدیمی را از `images/projects/{slug}/index.html` (Astro legacy) استخراج کن.
2. هر پروژه را به `data/projects.json` اضافه کن (slug، title، excerpt، tags، date، image).
3. با اسکریپت regenerate صفحه بساز:

```bash
node scripts/regenerate-n8n-project-pages.js
```

4. خروجی را در `projects/{slug}.html` بررسی کن — نباید `location.replace` داشته باشد.
5. URLها را به `sitemap-projects.xml` اضافه کن (اسکریپت `patch-project-og-and-sitemap.js` کمک می‌کند).
6. Deploy.
7. URL Inspection در GSC برای ۲–۳ پروژه مهم → **Request Indexing**.

---

### 1.4 🔴 تبدیل redirect نرم پروژه‌ها به 301 (موقت)

| | |
|---|---|
| **هدف** | تا regenerate کامل نشده، حداقل 301 درست بدهیم |
| **مهلت پیشنهادی** | 2026-06-24 |
| **وضعیت** | `[ ]` انجام نشده |
| **وابسته به** | 1.3 (اگر 1.3 زودتر تمام شد، این لازم نیست) |

**نحوه اجرا (موقت در nginx):**

اگر هنوز stubها regenerate نشده‌اند، meta refresh را با 301 جایگزین کن — **فقط اگر محتوای جایگزین نداری**:

```nginx
# فقط موقت — بعد از 1.3 حذف شود
location = /projects/AI-Powered-Chatbot.html {
    return 301 /projects.html;
}
```

> ترجیح: به‌جای redirect به لیست، محتوای واقعی پروژه را برگردان (اقدام 1.3).

---

## فاز ۲ — کوتاه‌مدت (هفته ۲–۴: 2026-06-29 تا 2026-07-19)

### 2.1 🟡 اتصال Calculator به سایت اصلی

| | |
|---|---|
| **هدف** | انتقال link equity و بهبود UX |
| **مهلت پیشنهادی** | 2026-07-05 |
| **وضعیت** | `[ ]` انجام نشده |

**نحوه اجرا:**

1. **از سایت اصلی به Calculator:**
   - در `index.html` یا `contact.html` یک CTA اضافه کن: «Calculate Your SaaS Savings»
   - در `docs/project-html-builder.js` دکمه دوم CTA را برگردان (مثل Astro قدیمی)
   - لینک: `https://calculator.alecasgari.com/`

2. **از Calculator به سایت اصلی:**
   - در footer Calculator لینک «About Alec Asgari» → `https://alecasgari.com/`
   - لینک «View Projects» → `https://alecasgari.com/projects.html`

3. Deploy هر دو سمت.

---

### 2.2 🟡 افزودن Calculator به sitemap

| | |
|---|---|
| **هدف** | کمک به crawl و ایندکس HTTPS |
| **مهلت پیشنهادی** | 2026-07-05 |
| **وضعیت** | `[ ]` انجام نشده |

**نحوه اجرا:**

**گزینه A — ساب‌دامین جدا (سریع‌تر):**

1. فایل `sitemap-calculator.xml` در repo یا روی سرور Calculator بساز:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://calculator.alecasgari.com/</loc>
    <lastmod>2026-06-21</lastmod>
  </url>
</urlset>
```

2. در GSC property مربوط به calculator (یا domain property) sitemap را submit کن.

**گزینه B — migrate به `/calculator` (بهتر برای SEO بلندمدت):**

1. صفحه Calculator را در `calculator.html` یا `/calculator/` روی دامنه اصلی host کن.
2. 301 از `calculator.alecasgari.com` به `alecasgari.com/calculator`.
3. به `sitemap-pages.xml` اضافه کن.

---

### 2.3 🟡 بهینه‌سازی SEO Calculator

| | |
|---|---|
| **هدف** | تبدیل impression به click برای کوئری‌های saas calculator |
| **مهلت پیشنهادی** | 2026-07-10 |
| **وضعیت** | `[ ]` انجام نشده |

**نحوه اجرا:**

1. **Title tag** (حداکثر ~۶۰ کاراکتر):

```
SaaS Cost Calculator — Compare vs Self-Hosted Stack | Alec Asgari
```

2. **Meta description** (حداکثر ~۱۵۵ کاراکتر):

```
Free SaaS spend calculator for 5–20 person teams. Compare GSuite, HubSpot & Mailchimp costs vs one-time self-hosted stack. See your savings in 30 seconds.
```

3. **H1** را بررسی کن — کلمه «calculator» و «SaaS cost» باشد.
4. **HTTPS canonical** — مطمئن شو canonical به `https://` اشاره کند نه `http://`.
5. **Open Graph** tags برای share در LinkedIn/WhatsApp.
6. بعد از deploy: GSC → URL Inspection → Request Indexing.

---

### 2.4 🟡 Validate Fix همه issueهای GSC

| | |
|---|---|
| **هدف** | پیگیری رفع مشکلات گزارش‌شده |
| **مهلت پیشنهادی** | 2026-07-12 |
| **وضعیت** | `[ ]` انجام نشده |
| **پیش‌نیاز** | تکمیل فاز ۱ |

**نحوه اجرا:**

1. GSC → Pages → برای هر issue:
   - Not found (404) → Validate Fix
   - Page with redirect → Validate Fix
   - Crawled - currently not indexed → Validate Fix
2. ۷–۱۴ روز صبر کن تا گوگل re-crawl کند.
3. اگر issue برگشت، URL Inspection بزن و دلیل را بخوان.

---

### 2.5 🟡 یکسان‌سازی Analytics

| | |
|---|---|
| **هدف** | دید یکپارچه از ترافیک main + calculator |
| **مهلت پیشنهادی** | 2026-07-15 |
| **وضعیت** | `[ ]` انجام نشده |

**وضعیت فعلی:**

| سایت | Tracking |
|------|----------|
| alecasgari.com | GA4 مستقیم: `G-81C6JE60BQ` |
| calculator.alecasgari.com | GTM: `GTM-WLLGGB4P` |

**نحوه اجرا:**

1. در GTM container `GTM-WLLGGB4P` بررسی کن که GA4 tag به `G-81C6JE60BQ` می‌فرستد.
2. **Cross-domain tracking** فعال کن:
   - GA4 Admin → Data streams → Configure tag settings → Configure your domains
   - اضافه کن: `alecasgari.com`، `calculator.alecasgari.com`
3. در GTM، linker parameter را برای هر دو دامنه تنظیم کن.
4. تست: از calculator به main site برو — session نباید بشکند.

---

### 2.6 🟡 به‌روزرسانی robots.txt

| | |
|---|---|
| **هدف** | حذف قوانین WordPress قدیمی |
| **مهلت پیشنهادی** | 2026-07-05 |
| **وضعیت** | `[ ]` انجام نشده |

**نحوه اجرا:**

1. فایل `robots.txt` را ویرایش کن:

```
User-agent: *
Allow: /

Sitemap: https://alecasgari.com/sitemap-index.xml
```

2. Deploy و تست: `curl https://alecasgari.com/robots.txt`

---

## فاز ۳ — میان‌مدت (ماه ۲: 2026-07-20 تا 2026-08-20)

### 3.1 🟢 Structured Data (Schema.org)

| | |
|---|---|
| **هدف** | Rich results و اعتماد بیشتر در SERP |
| **مهلت پیشنهادی** | 2026-08-01 |
| **وضعیت** | `[ ]` انجام نشده |

**نحوه اجرا:**

1. **Home (`index.html`):** JSON-LD نوع `Person` + `ProfessionalService`
2. **Calculator:** JSON-LD نوع `WebApplication` + `FAQPage` (بخش FAQ موجود است)
3. **Blog posts:** `Article` schema
4. تست: [Google Rich Results Test](https://search.google.com/test/rich-results)

---

### 3.2 🟢 استراتژی محتوای Blog برای Organic

| | |
|---|---|
| **هدف** | افزایش Organic Search از ۴ session به ۲۰+ |
| **مهلت پیشنهادی** | 2026-08-15 |
| **وضعیت** | `[ ]` انجام نشده |

**موضوعات پیشنهادی (بر اساس impressionهای فعلی):**

| موضوع | هدف کوئری |
|-------|-----------|
| SaaS cost comparison guide | saas cost calculator |
| AI sales assistant for Dubai businesses | ai sales assistant dubai |
| n8n automation case studies | telegram bot presentations |
| CRM for small business UAE | crm small business |

**نحوه اجرا:**

1. ماهانه ۲ پست جدید با n8n workflow موجود.
2. هر پست: حداقل ۱۲۰۰ کلمه، internal link به Calculator و Case Studies.
3. به `sitemap-blog.xml` اضافه شود (خودکار با regenerate).

---

### 3.3 🟢 پاکسازی Legacy Astro

| | |
|---|---|
| **هدف** | جلوگیری از duplicate content و سردرگمی |
| **مهلت پیشنهادی** | 2026-08-10 |
| **وضعیت** | `[ ]` انجام نشده |

**نحوه اجرا:**

1. پوشه `images/projects/*/index.html` (۷ فایل Astro) را بررسی کن.
2. اگر محتوا migrate شده → پوشه‌ها را حذف کن یا `noindex` بگذار.
3. `images/projects/index.html` (لیست قدیمی) → 301 به `/projects.html`
4. commit و deploy.

---

### 3.4 🟢 بررسی thank-you.html

| | |
|---|---|
| **هدف** | صفحه thank-you قدیمی Astro را مدرن کن |
| **مهلت پیشنهادی** | 2026-08-05 |
| **وضعیت** | `[ ]` انجام نشده |

**مشکل:** `thank-you.html` هنوز Astro markup دارد و canonical به `/thank-you/` (404) اشاره می‌کند.

**نحوه اجرا:**

1. صفحه را با قالب جدید (`site.css`) بازنویسی کن.
2. Canonical: `https://alecasgari.com/thank-you.html`
3. `noindex, follow` بگذار (صفحه conversion — نیازی به ایندکس نیست).
4. فرم contact را به `/thank-you.html` redirect کند.

---

## فاز ۴ — پایش مداوم (از 2026-07-01 به بعد)

### 4.1 📊 گزارش هفتگی (هر دوشنبه)

| | |
|---|---|
| **تکرار** | هفتگی |
| **وضعیت** | `[ ]` شروع نشده |

**چک کن:**

- [ ] GSC → Performance → clicks و impressions نسبت به هفته قبل
- [ ] GSC → Pages → تعداد indexed / not indexed
- [ ] GA4 → Organic Search sessions
- [ ] GA4 → Calculator page views
- [ ] n8n → تعداد leadهای Calculator

---

### 4.2 📊 گزارش ماهانه (اول هر ماه)

| | |
|---|---|
| **تکرار** | ماهانه |
| **اولین گزارش** | 2026-08-01 |
| **وضعیت** | `[ ]` شروع نشده |

**چک کن:**

- [ ] آیا کوئری «saas cost calculator» کلیک گرفته؟
- [ ] آیا پروژه‌های regenerate شده ایندکس شدند؟
- [ ] آیا privacy-policy 404 بسته شد؟
- [ ] نسخه جدید گزارش SEO (`seo/gozaresh-avalieh-v2.md`) بنویس

---

## جدول زمان‌بندی خلاصه

| تاریخ | اقدام | فاز |
|-------|-------|-----|
| 2026-06-23 | Privacy Policy | ۱ |
| 2026-06-24 | nginx 301 redirects | ۱ |
| 2026-06-28 | Regenerate ۱۵ پروژه | ۱ |
| 2026-07-05 | اتصال Calculator + sitemap + robots.txt | ۲ |
| 2026-07-10 | SEO Calculator (title/meta) | ۲ |
| 2026-07-12 | Validate Fix در GSC | ۲ |
| 2026-07-15 | Cross-domain Analytics | ۲ |
| 2026-08-01 | Structured Data | ۳ |
| 2026-08-05 | thank-you.html مدرن | ۳ |
| 2026-08-10 | پاکسازی Astro legacy | ۳ |
| 2026-08-15 | استراتژی blog | ۳ |

---

## معیارهای موفقیت (KPI)

| KPI | مقدار فعلی | هدف ۳ ماهه (2026-09-21) |
|-----|------------|-------------------------|
| صفحات indexed | 14 / 39 (36%) | > 30 / 39 (75%) |
| Organic sessions / ماه | ~۴ | > ۲۰ |
| CTR کوئری saas cost calculator | 0% | > 5% |
| 404 errors در GSC | 1 | 0 |
| Leadهای Calculator / ماه | نامشخص | ثبت و +۲۰% |

---

## تاریخچه نسخه

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| 1.0.0 | 2026-06-21 | چک‌لیست اولیه — ۴ فاز، ۱۶ اقدام |
