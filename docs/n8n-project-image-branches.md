# n8n — Image branches (Manual / Pexels / OpenAI)

Safe upgrade for **Alec Project Writer**. Does **not** change: `Prepare HTML for GitHub`, `Merge projects JSON`, GitHub upload chain.

## Before you start

1. **Duplicate the workflow** in n8n (backup).
2. Do steps **in order**.
3. **Disable** (do not delete yet): `Video text`, `Download Pexels Video`, `Upload a video1`, `Youtube Text1`, `Youtube Link1`.

---

## Step 1 — Rewire after Confirm (do NOT remove publish chain)

**Current:** `Switch` → Confirm → `Get Project1` → `Append image link1` → `Send Ask Image1`

**New:** `Switch` → Confirm → `Get Project1` → `Append image link1` → **`Send Image Source Menu`** (new Telegram node)

Disconnect `Append image link1` from `Send Ask Image1`. Connect to `Send Image Source Menu` instead.

`Send Ask Image1` stays in the workflow — used only for **Upload my photo** path.

---

## Step 2 — Update node `Switch` (callback router)

Remove the **YouTube** / `Video-Upload-Yes` rule.

Add rules **in this order** (top = first match):

| # | Output name | Condition |
|---|-------------|-----------|
| 1 | Pexels | `callback_data` **starts with** `image-pexels-yes_` |
| 2 | Pexels legacy | `callback_data` **equals** `image-pexels-yes` |
| 3 | OpenAI use | `callback_data` **starts with** `img-openai-use_` |
| 4 | OpenAI generate | `callback_data` **starts with** `img-openai_` |
| 5 | Manual photo | `callback_data` **starts with** `img-manual_` |
| 6 | Confirm | `callback_data` **starts with** `confirm_` |

**Rewire outputs:**

| Output | Connect to |
|--------|------------|
| Pexels | `Get Project for Pexels` (new) |
| Pexels legacy | `Wait` (existing — optional, old flow) |
| OpenAI use | `Get Project for AI publish` (new) |
| OpenAI generate | `Get Project for OpenAI` (new) |
| Manual photo | `Get Project for manual photo` (new) |
| Confirm | `Get Project1` (existing) |

Disconnect **YouTube** output from `Video text`.

---

## Step 3 — New Google Sheets nodes (3× clone of `Get Project1`)

Duplicate `Get Project1` three times. Only change **lookup value**:

**Get Project for manual photo** — lookup `project_id`:

```
={{ $('Telegram Trigger1').item.json.callback_query.data.replace('img-manual_', '') }}
```

→ connects to **`Send Ask Image1`** (existing).

**Get Project for Pexels** — lookup `project_id`:

```
={{ $('Telegram Trigger1').item.json.callback_query.data.replace('image-pexels-yes_', '') }}
```

→ connects to **`Prepare Pexels tags`** (new Code).

**Get Project for OpenAI** — lookup `project_id`:

```
={{ $('Telegram Trigger1').item.json.callback_query.data.replace('img-openai_', '') }}
```

→ connects to **`Build OpenAI image prompt`** (new Code).

**Get Project for AI publish** — lookup `project_id`:

```
={{ $('Telegram Trigger1').item.json.callback_query.data.replace('img-openai-use_', '') }}
```

→ connects to **`Download AI image`** (new HTTP Request).

---

## Step 4 — Publish chain (unchanged endpoints)

These nodes stay as they are — only **one small update** to `Prepare image for GitHub1` (Step 8).

```
Get Project for photo  →  Get a file3  →  Prepare image for GitHub1  →  Upload image1  →  Prepare HTML  →  …
Download AI image      →  Prepare image for GitHub1  (same node, second input path)
```

---

See companion files:

- `docs/n8n-send-image-source-menu.txt` — Telegram node fields
- `docs/n8n-prepare-pexels-tags.js`
- `docs/n8n-build-openai-image-prompt.js`
- `docs/n8n-openai-image-settings.md`
- `docs/n8n-download-ai-image.md`
- `docs/n8n-telegram-ai-preview.txt`
- `docs/n8n-prepare-image-for-github.js` — backward-compatible update
