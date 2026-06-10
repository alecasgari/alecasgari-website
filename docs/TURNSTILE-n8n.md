# Cloudflare Turnstile + n8n

## Keys

- **Site Key** (public): in HTML — `0x4AAAAAAADhpnAczaApE118F`
- **Secret Key** (private): only in n8n — never commit to Git

---

## Workflow order

```
Webhook → HTTP Request (verify) → IF (success?) → … rest of workflow
```

---

## 1. Webhook node

- Method: **GET** (form sends GET with query string)
- After a test submit from the site, check OUTPUT — find `turnstile_token`:
  - often: `{{ $json.query.turnstile_token }}`
  - or: `{{ $json.turnstile_token }}`

---

## 2. HTTP Request node (Turnstile verify)

| Field | Value |
|-------|--------|
| Method | `POST` |
| URL | `https://challenges.cloudflare.com/turnstile/v0/siteverify` |
| Authentication | `None` |
| Send Query Parameters | **OFF** |
| Send Headers | **OFF** (n8n sets Content-Type when body is form) |
| Send Body | **ON** |
| Body Content Type | **Form Urlencoded** |

### Body parameters (two rows)

| Name | Value |
|------|--------|
| `secret` | your Cloudflare **Secret Key** (paste once; better: n8n credential / env var) |
| `response` | `{{ $json.query.turnstile_token }}` — or whatever path you saw in Webhook OUTPUT |

Click **Execute step** (with a real test from the form first). Expected OUTPUT:

```json
{
  "success": true,
  "challenge_ts": "...",
  "hostname": "localhost"
}
```

---

## 3. IF node

- Condition: `{{ $json.success }}` **is true** (boolean)
- **True** → continue (email, sheet, etc.)
- **False** → stop or return error

---

## Localhost testing

The site uses Cloudflare **test keys** on `localhost` / `127.0.0.1` (widget always passes).

In n8n HTTP Request, for local form tests use this **test secret** in the `secret` field:

```
1x0000000000000000000000000000000AA
```

On production (`alecasgari.com`) keep your real Secret Key.

---

## Common mistakes

1. **No Body** — only URL is not enough; Cloudflare needs `secret` + `response`.
2. **Wrong expression** — token is in Webhook output, not HTTP Request output. Use Webhook’s `turnstile_token` path.
3. **Query vs Body** — verify endpoint expects **POST body**, not query string.
4. **Empty token** — submit the form on the site first so Webhook has data before testing HTTP Request.
