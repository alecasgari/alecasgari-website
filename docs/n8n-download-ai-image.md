# HTTP Request node: Download AI image

**Input:** `Get Project for AI publish` (must have `image_link` from sheet)

| Field | Value |
|-------|--------|
| Method | GET |
| URL | `={{ $json.image_link }}` |
| Response format | File |
| Binary property | `data` |
| Put output in field | `data` |

Connect → **`Prepare image for GitHub1`** (updated code — reads project from AI publish node).

**Important:** Run this path only after user clicks **Use this image**. Do not skip the preview step.
