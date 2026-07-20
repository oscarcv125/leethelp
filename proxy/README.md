# LeetHelp Community Proxy

A ~150-line Cloudflare Worker that holds a Groq API key server-side and forwards `POST /chat` to `https://api.groq.com/openai/v1/chat/completions`. Streams SSE end to end. Enforces a per-IP rate limit and a model whitelist.

## Why it exists

The extension is open source. Baking a free API key into the public source would get it revoked and abused within hours. This worker keeps the key as a Cloudflare secret, and the extension calls `https://<your-worker>.workers.dev/chat` when the user opts into the community proxy during onboarding. Users who prefer to bring their own key never touch it.

## Endpoints

- `GET /health`: liveness check.
- `POST /chat`: request and response is byte-for-byte the OpenAI/Groq chat completions shape, including SSE when `body.stream === true`.

## Deploy in about five minutes

Requires Node.js 18+ and a free Cloudflare account.

```bash
cd proxy
npm install -g wrangler        # one-time
wrangler login                 # opens a browser
wrangler secret put GROQ_API_KEY   # paste when prompted
wrangler deploy                # publishes to <name>.<subdomain>.workers.dev
```

The final line of `wrangler deploy` prints the public URL. Paste that into the extension's **Settings → Community proxy** field, or use it as the default in `lib/providers.js` (see `DEFAULT_PROXY_URL`).

### Optional: per-IP rate limiting via KV

```bash
wrangler kv:namespace create RATE_KV
# copy the returned id
```

Uncomment the `[[kv_namespaces]]` block in `wrangler.toml`, paste the id, then re-deploy. Without the binding the proxy skips rate limiting (fine for local dev, bad for production).

Defaults: 20 requests per 10 minutes per IP. Edit `RATE_WINDOW_S` and `RATE_LIMIT` in `worker.js` to change them.

## Model whitelist

Only these Groq models are forwarded (edit `ALLOWED_MODELS` to change):

- `llama-3.3-70b-versatile`
- `llama-3.1-70b-versatile`
- `llama-3.1-8b-instant`
- `mixtral-8x7b-32768`
- `gemma2-9b-it`
- `deepseek-r1-distill-llama-70b`

Anything else falls back to `llama-3.3-70b-versatile`.

## Cost

Cloudflare's free tier covers 100,000 requests per day and 10 ms of CPU per request. Groq is free at time of writing. As long as usage stays under Groq's own rate limits, running this proxy costs nothing.

## Self-host

Every LeetHelp user can point their extension at their own worker in the Settings page instead of using the community one. Good idea for teams or classrooms.
