import {
  HINT_TIERS,
  buildHintMessages,
  buildExplainMessages,
  buildConvertMessages,
  buildReviewMessages,
  buildFreeformMessages
} from "../lib/prompts.js";
import { PROVIDERS, DEFAULT_PROXY_URL } from "../lib/providers.js";
import { getSettings, setSettings } from "../lib/storage.js";
import { renderMarkdown } from "./markdown.js";
import { highlight as highlightCode } from "./highlight.js";
import { runVisualization } from "../visualizations/viz.js";
import { PATTERNS } from "../knowledge/patterns.js";
import { TEMPLATE_BY_ID } from "../knowledge/templates.js";
import { REFS, EXTERNAL_SITES } from "../knowledge/references.js";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const LANGS = [
  "Python", "C++", "Java", "JavaScript", "TypeScript",
  "Go", "Rust", "C#", "Kotlin", "Swift", "Ruby", "PHP"
];

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
const CATEGORIES = [
  {
    name: "Graphs & Flow",
    tags: [
      "graph","bfs","dfs","dijkstra","flow","matching","2-sat","scc","bridge",
      "articulation-point","mst","arborescence","hld","centroid","small-to-large",
      "topological-sort","union-find","dsu","bipartite","eulerian","hopcroft-karp",
      "hungarian","min-cost"
    ]
  },
  {
    name: "Dynamic Programming",
    tags: [
      "dp","knapsack","lis","lcs","edit-distance","cht","knuth","aliens-trick",
      "digit-dp","sos","bitmask","matrix-exponentiation","interval-dp","tree-dp"
    ]
  },
  {
    name: "Strings",
    tags: [
      "string","kmp","z-function","manacher","suffix-array","suffix-automaton",
      "aho-corasick","eertree","booth","rolling-hash"
    ]
  },
  {
    name: "Trees & Ranges",
    tags: [
      "tree","segment-tree","fenwick","sparse-table","sqrt-decomposition",
      "mos-algorithm","persistent","treap","trie","lca","binary-tree","range-query"
    ]
  },
  {
    name: "Math & Geometry",
    tags: [
      "math","sieve","modular","primality","factor","crt","discrete-log",
      "fft","linear-algebra","combinatorics","geometry","convex-hull","sweep-line",
      "rotating-calipers","closest-pair","half-plane","matrix-exponentiation"
    ]
  },
  {
    name: "Arrays & Windows",
    tags: [
      "array","sliding-window","prefix-sum","difference-array","two-pointer",
      "kadane","dutch-flag","cyclic-sort","boyer-moore","meet-in-the-middle",
      "monotonic"
    ]
  },
  {
    name: "Search & Sort",
    tags: ["binary-search","sort","sorted"]
  },
  {
    name: "Design & Bits",
    tags: [
      "stack","deque","linked-list","bit","bitwise","xor","cache","backtracking",
      "greedy","random","streaming","hashing","hashmap","design","bitset"
    ]
  }
];

function categoryOf(pattern) {
  for (const cat of CATEGORIES) {
    for (const t of pattern.tags) if (cat.tags.includes(t)) return cat.name;
  }
  return "Design & Bits";
}

let problem = null;
let currentTier = 0;
let settings = null;
const chatHistory = [];
function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
}

function port() {
  return chrome.runtime.connect({ name: "leethelp" });
}
function setProviderBadge() {
  $("#providerBadge").textContent = settings.provider;
}

function setSiteBadge() {
  const badge = $("#siteBadge");
  if (!problem) {
    badge.textContent = "no problem detected";
    return;
  }
  const title = problem.title ? `, ${problem.title.slice(0, 44)}` : "";
  badge.textContent = `${problem.site.toLowerCase()}${title}`;
}

function bindTabs() {
  $$(".chapter").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      $$(".chapter").forEach((x) => x.classList.toggle("active", x === tab));
      $$(".folio").forEach((p) => p.classList.toggle("active", p.dataset.panel === target));
    });
  });
}
function buildLangSelect() {
  const sel = $("#langSelect");
  sel.innerHTML = "";
  LANGS.forEach((l) => {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l.toLowerCase();
    if (l === settings.language) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", async () => {
    settings = await setSettings({ language: sel.value });
  });
}
function buildTierList() {
  const ol = $("#tierStrip");
  ol.innerHTML = "";
  HINT_TIERS.forEach((t) => {
    const li = document.createElement("li");
    li.className = "tier";
    li.dataset.tier = t.id;
    li.title = t.blurb;
    li.innerHTML = `
      <span class="tier-num">${ROMAN[t.id - 1]}.</span>
      <span class="tier-name">${t.label}</span>
      <span class="tier-desc">${t.blurb.replace(/\.$/, "")}</span>`;
    li.addEventListener("click", () => requestHint(t.id));
    ol.appendChild(li);
  });
}

function highlightTier(id) {
  $$(".tier").forEach((el) => {
    el.classList.toggle("current", Number(el.dataset.tier) === id);
  });
}

async function requestHint(tier) {
  if (!problem?.raw) {
    $("#hintOut").innerHTML = `<p class="lh-empty">No problem scraped from this page. Open a supported problem and press <em>rescrape</em>.</p>`;
    return;
  }
  currentTier = tier;
  highlightTier(tier);
  const language = $("#langSelect").value;
  const built = buildHintMessages({ tier, problem: problem.raw, language });
  await streamChat(built, $("#hintOut"));
}

async function nextHint() {
  const target = Math.min((currentTier || 0) + 1, HINT_TIERS.length);
  await requestHint(target);
}
function streamChat(built, targetEl) {
  const messages = Array.isArray(built) ? built : built.messages;
  const retrievedIds = Array.isArray(built) ? [] : built.retrievedIds || [];
  return new Promise((resolve, reject) => {
    const p = port();
    const requestId = crypto.randomUUID();
    targetEl.classList.add("streaming");
    const groundingHtml = retrievedIds.length
      ? `<div class="lh-grounding">${retrievedIds
          .map((id) => `<span class="lh-tag">${escapeHtml(id)}</span>`)
          .join("")}</div>`
      : "";
    let raw = "";
    p.onMessage.addListener((msg) => {
      if (msg.requestId && msg.requestId !== requestId) return;
      if (msg.type === "delta") {
        raw += msg.delta;
        targetEl.innerHTML = groundingHtml + renderMarkdown(raw);
      } else if (msg.type === "done") {
        targetEl.classList.remove("streaming");
        targetEl.innerHTML = groundingHtml + renderMarkdown(raw);
        p.disconnect();
        resolve(raw);
      } else if (msg.type === "error") {
        targetEl.classList.remove("streaming");
        targetEl.innerHTML = `<p class="lh-error">Error: ${escapeHtml(msg.error)}</p>`;
        p.disconnect();
        reject(new Error(msg.error));
      }
    });
    p.postMessage({ type: "chat", messages, requestId });
  });
}
function appendLetter(who, body) {
  const log = $("#chatLog");
  const wrap = document.createElement("div");
  wrap.className = "letter " + (who === "you" ? "you" : "leethelp");
  const from = document.createElement("span");
  from.className = "from";
  from.textContent = who === "you" ? "you." : "leethelp.";
  const contents = document.createElement("div");
  contents.className = "letter-body response";
  if (typeof body === "string") contents.textContent = body;
  wrap.appendChild(from);
  wrap.appendChild(contents);
  log.appendChild(wrap);
  log.scrollTop = log.scrollHeight;
  return contents;
}

async function sendChat(text) {
  if (!text.trim()) return;
  appendLetter("you", text);
  const asstBody = appendLetter("leethelp", "…");

  chatHistory.push({ role: "user", content: text });
  const built = buildFreeformMessages({
    query: text,
    problem: problem?.raw,
    language: $("#langSelect").value
  });
  const [systemMsg, currentUserMsg] = built.messages;
  const composed = [systemMsg, ...chatHistory.slice(0, -1), currentUserMsg];
  try {
    const reply = await streamChat({ messages: composed, retrievedIds: built.retrievedIds }, asstBody);
    chatHistory.push({ role: "assistant", content: reply });
  } catch { /* surfaced */ }
}

function bindChat() {
  const form = $("#chatForm");
  const input = $("#chatInput");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = "";
    sendChat(v);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
}
function grabEditorCode() {
  return new Promise((resolve) => {
    const requestId = crypto.randomUUID();
    function handler(ev) {
      if (ev.data?.type === "leethelp:editorCode" && ev.data.requestId === requestId) {
        window.removeEventListener("message", handler);
        resolve(ev.data.code || "");
      }
    }
    window.addEventListener("message", handler);
    window.parent.postMessage({ source: "leethelp-overlay", type: "grabEditorCode", requestId }, "*");
    setTimeout(() => {
      window.removeEventListener("message", handler);
      resolve("");
    }, 1500);
  });
}
async function runTool(kind) {
  const out = $("#toolOut");
  const language = $("#langSelect").value;
  out.innerHTML = `<p class="lh-empty">working…</p>`;
  if (kind === "explain") {
    const topic = prompt("Which topic or DSA? e.g. sliding window, union-find, segment tree");
    if (!topic) { out.innerHTML = ""; return; }
    await streamChat(buildExplainMessages({ topic, language, problem: problem?.raw }), out);
  } else if (kind === "convert") {
    const code = await grabEditorCode();
    if (!code) return void (out.innerHTML = `<p class="lh-empty">No code found in the editor.</p>`);
    const toLang = prompt("Convert to which language?", language) || language;
    await streamChat(buildConvertMessages({ code, fromLang: language, toLang, problem: problem?.raw }), out);
  } else if (kind === "review") {
    const code = await grabEditorCode();
    if (!code) return void (out.innerHTML = `<p class="lh-empty">No code found in the editor.</p>`);
    await streamChat(buildReviewMessages({ code, language, problem: problem?.raw }), out);
  } else if (kind === "complexity") {
    const code = await grabEditorCode();
    if (!code) return void (out.innerHTML = `<p class="lh-empty">No code found in the editor.</p>`);
    await streamChat(buildFreeformMessages({
      query: "Analyze the time and space complexity of the following code. Justify tightly and note where the amortized bound differs from worst-case.\n\n```\n" + code + "\n```",
      problem: problem?.raw,
      language
    }), out);
  } else if (kind === "testcases") {
    await streamChat(buildFreeformMessages({
      query: "Generate 6 tricky test cases (with expected outputs) that commonly break naive solutions. Include at least one edge case, one adversarial input, and one large-scale case. Compact table.",
      problem: problem?.raw,
      language
    }), out);
  } else if (kind === "patterns") {
    await streamChat(buildFreeformMessages({
      query: "List 5 related problems (name + brief why-similar) and the canonical pattern template for problems like this one. Provide the template as pseudocode.",
      problem: problem?.raw,
      language
    }), out);
  }
}

function bindTools() {
  $$(".tool-list button").forEach((btn) => {
    btn.addEventListener("click", () => runTool(btn.dataset.tool));
  });
}
function bindViz() {
  const canvas = $("#vizCanvas");
  const sel = $("#vizSelect");
  const speed = $("#vizSpeed");
  const caption = $("#vizCaption");
  let controller = null;
  const start = () => {
    controller?.stop();
    controller = runVisualization({
      kind: sel.value,
      canvas,
      speed: Number(speed.value),
      onCaption: (t) => (caption.textContent = t)
    });
    controller.play();
  };
  $("#vizPlay").addEventListener("click", () => (controller ? controller.play() : start()));
  $("#vizPause").addEventListener("click", () => controller?.pause());
  $("#vizReset").addEventListener("click", () => start());
  sel.addEventListener("change", () => start());
  speed.addEventListener("input", () => controller?.setSpeed?.(Number(speed.value)));
  start();
}
function bindReferenceExplorer() {
  const listView = $('[data-view="list"]');
  const detailView = $("#refDetail");
  const list = $("#refList");
  const search = $("#refSearch");
  const catSel = $("#refCategory");
  const count = $("#refCount");
  const footer = $("#refFooter");
  const backBtn = $("#refBack");

  // Populate category select
  const perCat = new Map(CATEGORIES.map((c) => [c.name, 0]));
  PATTERNS.forEach((p) => {
    const c = categoryOf(p);
    perCat.set(c, (perCat.get(c) || 0) + 1);
  });
  const allOpt = document.createElement("option");
  allOpt.value = "__all__";
  allOpt.textContent = `all chapters (${PATTERNS.length})`;
  catSel.appendChild(allOpt);
  CATEGORIES.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.name;
    opt.textContent = `${c.name.toLowerCase()} (${perCat.get(c.name) || 0})`;
    catSel.appendChild(opt);
  });

  function filtered() {
    const q = search.value.trim().toLowerCase();
    const cat = catSel.value;
    return PATTERNS.filter((p) => {
      if (cat !== "__all__" && categoryOf(p) !== cat) return false;
      if (!q) return true;
      const hay = (
        p.title + " " + p.tags.join(" ") + " " + (p.when || "") + " " + (p.idea || "")
      ).toLowerCase();
      return q.split(/\s+/).every((tok) => hay.includes(tok));
    });
  }

  function renderList() {
    const entries = filtered();
    count.textContent = `${entries.length} of ${PATTERNS.length} entries`;
    list.innerHTML = "";
    if (!entries.length) {
      const li = document.createElement("li");
      li.className = "entry";
      li.innerHTML = `<span></span><span class="entry-title"><small>Nothing matches. Loosen the search.</small></span><span></span>`;
      list.appendChild(li);
      return;
    }
    entries.forEach((p, i) => {
      const li = document.createElement("li");
      li.className = "entry";
      li.innerHTML = `
        <span class="entry-num">${i + 1}.</span>
        <span class="entry-title">${escapeHtml(p.title)}<small>${escapeHtml(p.when || "").slice(0, 100)}</small></span>
        <span class="entry-category">${escapeHtml(categoryOf(p))}</span>`;
      li.addEventListener("click", () => showDetail(p.id));
      list.appendChild(li);
    });
  }

  function showDetail(id) {
    const entry = PATTERNS.find((p) => p.id === id);
    if (!entry) return;
    const template = TEMPLATE_BY_ID[id];
    const refs = REFS[id] || [];
    const body = detailView.querySelector(".detail-body");

    const parts = [];
    parts.push(`<div class="detail-category">${escapeHtml(categoryOf(entry))}</div>`);
    parts.push(`<h3 class="detail-title">${escapeHtml(entry.title)}</h3>`);

    if (entry.when) {
      parts.push(`<div class="detail-label">when to reach for it</div>`);
      parts.push(`<p>${escapeHtml(entry.when)}</p>`);
    }
    if (entry.idea) {
      parts.push(`<div class="detail-label">the idea</div>`);
      parts.push(`<p>${escapeHtml(entry.idea)}</p>`);
    }
    if (entry.watch?.length) {
      parts.push(`<div class="detail-label">watch</div>`);
      parts.push(`<ul>${entry.watch.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}</ul>`);
    }
    if (template) {
      parts.push(`<div class="detail-label">template (${escapeHtml(template.language)})</div>`);
      parts.push(
        `<pre class="lh-code" data-lang="${escapeHtml(template.language)}">` +
          `<div class="lh-code-head"><span class="lh-code-lang">${escapeHtml(template.language)}</span>` +
          `<button class="lh-code-copy" type="button">copy</button></div>` +
          `<code>${highlightCode(template.code, template.language)}</code>` +
        `</pre>`
      );
    }
    if (refs.length) {
      parts.push(`<div class="detail-label">external</div>`);
      parts.push(
        `<div class="detail-refs">${refs
          .map((r) => `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.label)} ↗</a>`)
          .join("")}</div>`
      );
    }
    parts.push(`<div class="detail-label">tags</div>`);
    parts.push(
      `<div class="detail-tags">${entry.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>`
    );
    parts.push(
      `<div class="detail-actions">
         <button class="ghost-btn primary" data-action="explain-detail">Explain in dialogue</button>
         <button class="ghost-btn" data-action="apply-to-problem">Apply to problem</button>
       </div>`
    );

    body.innerHTML = parts.join("");
    body.querySelector('[data-action="explain-detail"]').addEventListener("click", () => {
      switchTab("chat");
      sendChat(`Explain ${entry.title} in depth: mental model, invariant, complexity, worked example, common bugs, and a minimal implementation in ${$("#langSelect").value}.`);
    });
    body.querySelector('[data-action="apply-to-problem"]').addEventListener("click", () => {
      switchTab("chat");
      sendChat(`Apply ${entry.title} to the current problem. Explain step-by-step why this technique fits, sketch the approach, then give a complete solution in ${$("#langSelect").value} with complexity analysis.`);
    });

    listView.hidden = true;
    detailView.hidden = false;
    detailView.scrollTop = 0;
  }

  function backToList() {
    detailView.hidden = true;
    listView.hidden = false;
  }

  function switchTab(target) {
    $$(".chapter").forEach((t) => t.classList.toggle("active", t.dataset.tab === target));
    $$(".folio").forEach((p) => p.classList.toggle("active", p.dataset.panel === target));
  }

  function renderFooter() {
    footer.innerHTML = `deep dives: ${EXTERNAL_SITES.map(
      (s) => `<a href="${s.url}" target="_blank" rel="noopener" title="${escapeHtml(s.note)}">${escapeHtml(s.label)}</a>`
    ).join(" · ")}`;
  }

  let debounce = 0;
  search.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(renderList, 80);
  });
  catSel.addEventListener("change", renderList);
  backBtn.addEventListener("click", backToList);

  renderList();
  renderFooter();
}
function setMinimized(min) {
  document.body.classList.toggle("minimized", min);
  window.parent.postMessage(
    { source: "leethelp-overlay", type: min ? "minimize" : "expand" },
    "*"
  );
}

function bindDrag() {
  const grip = document.querySelector(".masthead");
  if (!grip) return;
  grip.style.cursor = "grab";
  grip.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("button, a, select, input, textarea")) return;
    e.preventDefault();
    window.parent.postMessage(
      {
        source: "leethelp-overlay",
        type: "drag:start",
        startX: e.screenX,
        startY: e.screenY
      },
      "*"
    );
  });
}

function bindHeader() {
  $("#closeBtn").addEventListener("click", () => {
    window.parent.postMessage({ source: "leethelp-overlay", type: "close" }, "*");
  });
  $("#rescrapeBtn").addEventListener("click", () => {
    window.parent.postMessage({ source: "leethelp-overlay", type: "rescrape" }, "*");
  });
  $("#settingsBtn").addEventListener("click", () => {
    chrome.runtime.openOptionsPage?.();
  });
  $("#askHintBtn").addEventListener("click", () => nextHint());
  $("#minimizeBtn").addEventListener("click", () => setMinimized(true));
  const mini = $("#miniHandle");
  mini.addEventListener("click", () => setMinimized(false));
  mini.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setMinimized(false);
    }
  });
}
function bindCodeCopy() {
  document.body.addEventListener("click", async (e) => {
    const btn = e.target.closest(".lh-code-copy");
    if (!btn) return;
    const code = btn.closest("pre.lh-code")?.querySelector("code")?.innerText || "";
    try {
      await navigator.clipboard.writeText(code);
      btn.textContent = "copied ✓";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = "copy";
        btn.classList.remove("copied");
      }, 1200);
    } catch {
      btn.textContent = "err";
      setTimeout(() => (btn.textContent = "copy"), 1200);
    }
  });
}
function handleParentMessages() {
  window.addEventListener("message", (ev) => {
    if (ev.data?.type === "leethelp:problem") {
      problem = ev.data.data;
      setSiteBadge();
    } else if (ev.data?.type === "leethelp:command") {
      const cmd = ev.data.command;
      if (cmd?.kind === "nextHint") nextHint();
      else if (cmd?.kind === "explainSelection") {
        $$(".chapter").forEach((t) => t.classList.toggle("active", t.dataset.tab === "chat"));
        $$(".folio").forEach((p) => p.classList.toggle("active", p.dataset.panel === "chat"));
        sendChat(`Explain this snippet in the context of the current problem:\n\n"""${cmd.text}"""`);
      }
    }
  });
}

function hasBackend() {
  if (!settings) return false;
  if (settings.proxyUrl) return true;
  if (Object.values(settings.keys || {}).some((v) => v)) return true;
  return false;
}

function openOnboarding() {
  const sheet = $("#onboarding");
  if (!sheet) return;
  sheet.classList.add("open");
}

function closeOnboarding() {
  const sheet = $("#onboarding");
  if (!sheet) return;
  sheet.classList.remove("open");
}

const THEMES = ["notebook", "modern", "codey"];

function applyTheme(theme) {
  const t = THEMES.includes(theme) ? theme : "notebook";
  document.documentElement.dataset.theme = t;
}

async function pickOnboardingChoice(choice) {
  try {
    if (choice === "proxy") {
      settings = await setSettings({
        proxyUrl: DEFAULT_PROXY_URL,
        onboardedAt: Date.now()
      });
    } else if (choice === "bring-key") {
      settings = await setSettings({ onboardedAt: Date.now() });
      chrome.runtime.openOptionsPage?.();
    } else {
      settings = await setSettings({ onboardedAt: Date.now() });
    }
    console.log("[leethelp] onboarding choice saved:", choice, settings);
  } catch (err) {
    console.warn("[leethelp] onboarding save failed", err);
  }
  closeOnboarding();
  setProviderBadge();
}

function bindOnboarding() {
  const sheet = $("#onboarding");
  if (!sheet) return;
  if (!hasBackend()) openOnboarding();
  const currentTheme = settings.theme || "notebook";
  sheet.querySelectorAll('.theme-picker input[type="radio"]').forEach((r) => {
    r.checked = r.value === currentTheme;
    r.addEventListener("change", async () => {
      applyTheme(r.value);
      try {
        settings = await setSettings({ theme: r.value });
      } catch (err) {
        console.warn("[leethelp] theme save failed", err);
      }
    });
  });
  sheet.addEventListener("click", (e) => {
    const btn = e.target.closest(".onboarding-choice");
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      pickOnboardingChoice(btn.dataset.choice);
      return;
    }
    if (e.target === sheet) {
      pickOnboardingChoice("dismiss");
    }
  });
  const gear = $("#settingsBtn");
  if (gear) {
    gear.addEventListener(
      "click",
      (e) => {
        if (!hasBackend()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          openOnboarding();
        }
      },
      true // capture before the default openOptionsPage handler
    );
  }
}

function bindThemeSync() {
  if (!chrome.storage?.onChanged) return;
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync" || !changes.theme) return;
    applyTheme(changes.theme.newValue);
    settings.theme = changes.theme.newValue;
  });
}

async function init() {
  settings = await getSettings();
  applyTheme(settings.theme);
  bindThemeSync();
  buildTierList();
  buildLangSelect();
  bindTabs();
  bindChat();
  bindTools();
  bindViz();
  bindReferenceExplorer();
  bindHeader();
  bindDrag();
  bindCodeCopy();
  handleParentMessages();
  bindOnboarding();
  setProviderBadge();
  setSiteBadge();
}

init();
