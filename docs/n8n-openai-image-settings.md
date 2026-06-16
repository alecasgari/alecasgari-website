# OpenAI image flow (`gpt-image-1-mini`)

## Why Telegram `file_id` cache was removed

On n8n 2.22, these all failed in practice:

- workflow static data across Telegram callbacks
- `require('fs')` in Code nodes
- Read/Write Files (`/home/node/.n8n-files` missing)
- Telegram **Get a file** with `file_id` from bot-sent preview (`wrong file_id`)

## Working design: regenerate on publish

Preview and publish share the same prompt, but publish runs **Generate an image** again.

An **IF** node after generation routes:

- `img-openai-use_*` → **Prepare image for GitHub1** (publish)
- anything else → **Cache** → **Send AI image preview**

Preview and publish images may look slightly different, but the flow is reliable.

## Preview chain

```
Get Project for OpenAI
  → Build OpenAI image prompt
  → Generate an image
  → Route AI image (false)
  → Cache AI image for preview
  → Send AI image preview
```

## Publish chain (Use this image)

```
Get Project for AI publish
  → Build OpenAI image prompt
  → Generate an image
  → Route AI image (true)
  → Prepare image for GitHub1
  → Upload image1 → …
```

## Route AI image (IF node)

| Field | Value |
|-------|--------|
| Condition | `callback_query.data` **starts with** `img-openai-use_` |
| **true** output | Prepare image for GitHub1 |
| **false** output | Cache AI image for preview |

Trigger node name in expressions: **Telegram Trigger1** (or your exact trigger name).

## Generate an image settings

| Field | Value |
|-------|--------|
| Model | `gpt-image-1-mini` |
| Prompt | `={{ $json.image_prompt }}` |
| Size | `1536x1024` |
| Quality | `medium` |

## Manual cleanup in n8n

Delete if still present:

- Resolve AI preview file_id
- Get a file / Get AI preview from Telegram
- Save AI preview file_id
- Update sheet AI preview file_id
- Write / Read AI cover from disk

## Rebuild JSON

```powershell
node scripts/build-project-writer-workflow-json.js
```

Import: `Alec Project Writer (7).json`
