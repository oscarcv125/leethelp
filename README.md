# LeetHelp

Browser extension for competitive programming problems that tries hard not to spoil them. I built it because I kept opening ChatGPT in another tab and getting the whole solution when I wanted a hint, and the built-in hints on LeetCode only really help on the easy ones.

Works on LeetCode, Codeforces, HackerRank, AtCoder, and CodeChef.

## What it does

Five hint tiers, from a Socratic question all the way through to the full solution. You pick the depth, so you can stop before it gives the game away.

There is also:

- A chat panel that stays grounded on the scraped problem.
- Tools for rating your solution, reviewing your code, translating it to another language, analyzing complexity, and generating adversarial test cases.
- A browsable DSA reference with about a hundred patterns, each with a `when to use`, an `idea`, a `watch` list, and a Python template. It doubles as retrieval for the hints: when you ask something, a small retriever pulls a few likely patterns from the bundled corpus and hands them to the model as context.
- Three themes: a warm notebook look (default), a clean modern one, and an IDE look built on JetBrains Mono.

Open source, MIT. No analytics. No LeetHelp server. Keys live in `chrome.storage.sync` and only get sent to the provider that owns them.

## Install (unpacked)

1. Clone the repo.
2. Open `chrome://extensions` in Chrome, Edge, or Brave.
3. Turn on Developer mode.
4. Click "Load unpacked" and pick this folder.
5. Open a problem page. Click the floating LH mark in the corner, or press Alt+L.

The first time you open the overlay it asks you to pick one of:

- The community proxy. A small Cloudflare Worker holds a free Groq key server-side, so the extension works out of the box without you signing up anywhere. Rate limited per IP so a stranger can't burn through it. The source is in `/proxy` if you'd rather deploy your own.
- Your own key. Paste an OpenAI, Anthropic, Gemini, Groq, or OpenRouter key. It stays in your browser.
- Skip. The overlay still opens; you just can't send anything to a model until you set one of the above.

## Layout

```
manifest.json
background/service-worker.js   module SW: streams LLM chats and wires shortcuts
content/                       injects the overlay iframe into supported pages
overlay/                       the main UI, markdown, syntax highlighter
popup/                         toolbar popup
options/                       settings page
lib/
  providers.js                 provider abstraction for the five backends
  prompts.js                   hint tiers, prompt builders
  knowledge.js                 retriever
  storage.js                   chrome.storage.sync wrapper
knowledge/
  patterns.js                  ~105 curated DSA pattern entries
  templates.js                 canonical Python templates
  references.js                external cp-algorithms links
  complexity.js                Big-O cheatsheet
proxy/                         optional Cloudflare Worker
icons/
```

## Contribute

The `knowledge/` folder is where a PR pays off the most. Add a pattern you find yourself using, tighten a `when` line, translate a template into another language. Follow the existing entry shape and the retriever picks it up on the next reload. No rebuild step.

## Privacy

There is no LeetHelp server. Keys only touch the provider that owns them. The community proxy is the one exception, and the whole thing fits in a ~150-line Worker in `/proxy/worker.js`. Details in [PRIVACY.md](PRIVACY.md).

## License

MIT. See [LICENSE](LICENSE).
