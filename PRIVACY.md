# Privacy

Short version: LeetHelp runs in your browser. There is no LeetHelp server. The extension talks to whichever LLM provider you configure, and (optionally) a Cloudflare Worker proxy whose source lives in `/proxy` of this same repo. Nothing is logged by me.

## What the extension does with your data

- **Problem text.** When the overlay is open on a supported problem page (LeetCode, Codeforces, HackerRank, AtCoder, CodeChef), the content script scrapes the problem statement. When you use the code review tool, it also grabs the contents of the code editor. That data goes to the LLM provider you selected and nowhere else.
- **Your API keys.** Stored via `chrome.storage.sync`. The extension only attaches each key to requests made to that specific provider. Keys are not sent anywhere else.
- **Preferences.** Language, provider, model, theme, temperature, and the onboarding timestamp are stored in `chrome.storage.sync`.

## What the extension does not do

- No analytics. No telemetry. No error reporting.
- No third-party requests except to the LLM provider you selected (and, optionally, the community proxy below).
- No key transmitted to any URL other than the endpoint of its own provider (`api.openai.com`, `api.anthropic.com`, and so on).
- No access to any tab other than the active supported problem page.

## The community proxy

If you enable the community proxy during onboarding, or paste a URL into **Settings → Community proxy**, then all of your Groq calls are routed through that URL instead of directly to Groq. The default community proxy is a Cloudflare Worker whose complete source is in `/proxy/worker.js` of this repo. It:

- Holds a shared Groq key server-side and forwards the request.
- Applies a per-IP rate limit (default: 20 requests per 10 minutes).
- Enforces a whitelist of Groq models.
- Does not log request bodies. Cloudflare's own edge logs may retain IP and timestamp per their standard log retention.

If you'd rather not trust the community proxy, leave the field blank, deploy your own worker in about ten minutes following `/proxy/README.md`, or paste your own Groq key and skip the proxy entirely.

## Browser permissions

- `storage`: for the settings above.
- `activeTab`, `scripting`: to inject the overlay when you ask for it.
- `contextMenus`: for the right-click "Explain selection" action.
- Host permissions listed in `manifest.json`: limited to the supported problem sites and the specific LLM provider endpoints.

## Reporting a concern

Open an issue at [github.com/oscarcv125/leethelp/issues](https://github.com/oscarcv125/leethelp/issues).
