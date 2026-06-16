# Import Alec Project Writer (7) into n8n

## مهم — کدام فایل؟

| فایل | کاربرد |
|------|--------|
| `scripts/build-project-writer-workflow-json.js` | اسکریپت Node — **داخل n8n import نمی‌شود** |
| `Alec Project Writer (7).json` | workflow واقعی — **همین را import کن** |

اگر JSON قدیمی است، اول بساز:

```powershell
cd "C:\Users\aleca\OneDrive\Documents\12 - CodeWithAlec\01 - Website\gullible-giant\alecasgari-website"
node scripts/build-project-writer-workflow-json.js
```

## Import در n8n

1. n8n → منوی **⋯** → **Import from File**
2. فایل: **`Alec Project Writer (7).json`**
3. workflow **(6)** را **Deactivate** کن
4. node **Generate OpenAI image** → credential OpenAI را انتخاب کن
5. **(7)** را **Activate** کن

## Import از clipboard (جایگزین)

1. `Alec Project Writer (7).json` را با Notepad باز کن
2. Ctrl+A → Ctrl+C
3. n8n → **Import from URL/JSON** (یا Paste) → Ctrl+V → Import

## اگر باز هم خطا داد

- مطمئن شو پسوند فایل `.json` است نه `.js`
- فایل را دوباره با `node scripts/build-project-writer-workflow-json.js` بساز
- پیام خطای دقیق n8n را بفرست
