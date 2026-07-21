# Chrome Web Store submission

Copy-paste-ready fields for the [developer dashboard](https://chrome.google.com/webstore/devconsole).

## Basic info

- **Name**: `LeetHelp`
- **Category**: Developer Tools
- **Language**: English
- **Homepage URL**: `https://github.com/oscarcv125/leethelp`
- **Support URL**: `https://github.com/oscarcv125/leethelp/issues`
- **Privacy policy URL**: `https://oscarcv125.github.io/leethelp/privacy.html`

Served by the `privacy.html` file at the repo root via GitHub Pages.

*(If your `fortiasmart.me` custom domain is up, `https://fortiasmart.me/leethelp/privacy.html` also works and reads more legit on the store listing. Use whichever resolves reliably.)*

## Summary (132 characters max)

```
Hint-tier tutor for LeetCode, Codeforces & more. Progressive hints, code rating, 100-pattern DSA reference. Open source.
```

*(120 chars, leaves room to tweak.)*

## Detailed description

```
LeetHelp is a browser extension for competitive programming that tries hard not to spoil the problems you're working on.

Five progressive hint tiers, from a Socratic nudge to the full solution. You pick the depth. Stop before it gives the game away.

WHAT'S INSIDE
- Hints in five tiers: Nudge, Concept, Approach, Pseudocode, Full Solution.
- Dialogue: chat with the model, grounded on the scraped problem.
- Instruments: rate my solution (per-axis grade card), review my code, convert to another language, analyze complexity, generate edge cases, list related patterns.
- Reference: a browsable DSA library with about 100 patterns and Python templates. Search + eight-chapter filter. Doubles as retrieval that grounds the hints.
- Three themes: warm notebook (default), clean modern, or an IDE-style Codey theme.

BRING YOUR OWN KEY
Paste an OpenAI, Anthropic, Gemini, Groq, or OpenRouter key in Settings. Keys are stored in chrome.storage.sync and only sent to the provider they belong to.

WORKS ON
LeetCode, Codeforces, HackerRank, AtCoder, CodeChef.

OPEN SOURCE
MIT licensed. Full source at github.com/oscarcv125/leethelp. No analytics. No LeetHelp server. Nothing about your prompts, code, or problems is logged.
```

## Permission justifications (paste one per field in the Privacy tab)

- **`storage`**
  ```
  Persist user settings (chosen provider, model, API keys, preferred language, theme, overlay position). No user data leaves the browser.
  ```
- **`activeTab`**
  ```
  Read the problem statement and code editor content on the tab the user has open when they invoke the overlay.
  ```
- **`scripting`**
  ```
  Inject a small script into the page's main JavaScript world to read the full text from the Monaco code editor. Without this, only the visible viewport of the editor is accessible.
  ```
- **`contextMenus`**
  ```
  Provide a right-click "Explain selection" action that sends highlighted text to the chat panel.
  ```
- **Host permissions (LeetCode / Codeforces / HackerRank / AtCoder / CodeChef)**
  ```
  These are the supported problem sites. The content script only runs on these hosts to inject the helper overlay and scrape the problem statement plus the user's code editor.
  ```
- **Host permissions (api.openai.com, api.anthropic.com, api.groq.com, generativelanguage.googleapis.com, openrouter.ai)**
  ```
  These are LLM provider endpoints. The extension only sends a request to a provider when the user actively invokes a hint, chat, or tool, and only to the provider the user selected. The API key comes from chrome.storage.sync (set by the user).
  ```

## Single purpose statement

```
LeetHelp helps users solve competitive programming problems on LeetCode, Codeforces, HackerRank, AtCoder, and CodeChef by providing progressive hints and code analysis powered by an LLM provider of the user's choice.
```

## Data usage disclosure (Privacy tab)

Check these boxes:

- **Personally identifiable information**: No
- **Health information**: No
- **Financial and payment information**: No
- **Authentication information**: No
- **Personal communications**: No
- **Location**: No
- **Web history**: No
- **User activity**: No
- **Website content**: **YES** (the problem statement and code editor content on the supported problem sites, sent only to the LLM provider the user selected)

Certifications to confirm (all three):
- I do not sell or transfer user data to third parties, apart from the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

## Trader status

Select **Trader**. This makes the store listing publicly display:

- Legal name
- Physical address
- Email address
- Phone number

If you don't want your home address public, use a virtual mailbox service or your business address (e.g. `prestavale.mx`). This has to be a real, contactable address; Google verifies via a postcard.

## Screenshots

Required: at least one 1280x800 PNG. Recommended: five.

Suggested shots (open the overlay on a LeetCode problem for each):

1. Overlay open on a LeetCode problem, showing the Hints tab with tier 2 selected.
2. Tools tab, with the Rate my solution card visible (grade + per-axis scores).
3. Reference tab, list view showing several patterns.
4. Reference detail view of one pattern with its Python template.
5. Onboarding sheet with the three theme swatches.

Take at 1280x800. Use the Codey theme for one shot for variety.

## Promotional images (optional)

- **Small tile 440x280**: crop of the LeetHelp logo on paper cream background.
- **Marquee 1400x560**: only needed if you want featured placement. Skip for now.

## Icon

`icons/icon128.png` (already updated to the LeetHelp logo). CWS also uses `icons/icon512.png` for retina.

## Version

`1.0.0` in manifest.json. Bump `patch` for bugfix releases, `minor` for new tools/themes, `major` for breaking changes.

## Build & upload

1. Delete `.git`, `.gitignore`, `proxy/`, `STORE.md`, `PRIVACY.md`, `README.md`, `LICENSE` from a *copy* of the folder (Google doesn't need them in the .zip).
2. Zip the remaining folder contents (not the folder itself). On Windows: select all → right-click → Send to → Compressed folder.
3. In the developer dashboard: Add new item → upload zip → fill in the fields above.
4. Submit for review. First review usually takes 1-3 business days.

## Common rejection reasons and how to avoid them

- **Overly broad host permissions without justification**: use the paragraphs above; they explain each host.
- **Missing privacy policy or one that doesn't cover what the extension does**: PRIVACY.md covers everything.
- **Description doesn't match behavior**: don't add features to the description that aren't in the code.
- **Requesting sensitive permissions you don't use**: we don't request `tabs`, `history`, `cookies`, or `<all_urls>`, so this shouldn't be an issue.

If rejected, the email explains why. Fix and resubmit; a second review is usually faster.
