import { PROVIDERS, DEFAULT_PROXY_URL } from "../lib/providers.js";
import { getSettings, setSettings } from "../lib/storage.js";

const LANGS = ["Python", "C++", "Java", "JavaScript", "TypeScript", "Go", "Rust", "C#", "Kotlin", "Swift", "Ruby", "PHP"];
const $ = (s) => document.querySelector(s);

let settings;

function buildKeys() {
  const wrap = $("#keys");
  wrap.innerHTML = "";
  Object.entries(PROVIDERS).forEach(([id, meta]) => {
    const row = document.createElement("div");
    row.className = "key-row";
    const stored = settings.keys?.[id] || "";
    const placeholder = `paste your ${meta.label} API key`;
    row.innerHTML = `
      <label>${meta.label}</label>
      <input type="password" data-provider="${id}" value="${escapeAttr(stored)}" placeholder="${escapeAttr(placeholder)}" autocomplete="off" spellcheck="false" />
      <a href="${meta.docs}" target="_blank" rel="noopener">get key ↗</a>
    `;
    const input = row.querySelector("input");
    input.addEventListener("change", async () => {
      const patch = { keys: { [id]: input.value.trim() } };
      settings = await setSettings(patch);
      flash("Saved");
    });
    wrap.appendChild(row);
  });
}

function buildDefaults() {
  const provSel = $("#provider");
  Object.entries(PROVIDERS).forEach(([id, p]) => {
    const opt = document.createElement("option");
    opt.value = id; opt.textContent = p.label;
    if (id === settings.provider) opt.selected = true;
    provSel.appendChild(opt);
  });
  const modelSel = $("#model");
  function refreshModels() {
    modelSel.innerHTML = "";
    const meta = PROVIDERS[provSel.value];
    meta.models.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m; opt.textContent = m;
      if (m === settings.model) opt.selected = true;
      modelSel.appendChild(opt);
    });
    if (!modelSel.value) modelSel.value = meta.defaultModel;
  }
  refreshModels();

  const langSel = $("#language");
  LANGS.forEach((l) => {
    const opt = document.createElement("option");
    opt.value = l; opt.textContent = l;
    if (l === settings.language) opt.selected = true;
    langSel.appendChild(opt);
  });

  const temp = $("#temperature");
  temp.value = Math.round((settings.temperature ?? 0.4) * 10);
  $("#tempVal").textContent = (temp.value / 10).toFixed(1);

  provSel.addEventListener("change", async () => {
    refreshModels();
    settings = await setSettings({ provider: provSel.value, model: modelSel.value });
    flash("Saved");
  });
  modelSel.addEventListener("change", async () => {
    settings = await setSettings({ model: modelSel.value });
    flash("Saved");
  });
  langSel.addEventListener("change", async () => {
    settings = await setSettings({ language: langSel.value });
    flash("Saved");
  });
  temp.addEventListener("input", async () => {
    const v = temp.value / 10;
    $("#tempVal").textContent = v.toFixed(1);
    settings = await setSettings({ temperature: v });
  });
}

function flash(text) {
  const el = $("#saveStatus");
  el.textContent = text;
  clearTimeout(flash._t);
  flash._t = setTimeout(() => (el.textContent = ""), 1200);
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}

function bindTest() {
  $("#testBtn").addEventListener("click", async () => {
    const out = $("#testOut");
    out.textContent = "Sending…";
    const resp = await chrome.runtime.sendMessage({
      type: "chat:once",
      provider: $("#provider").value,
      model: $("#model").value,
      messages: [
        { role: "system", content: "You are a helpful assistant. Reply with fewer than 20 words." },
        { role: "user", content: "Say hi and state which model you are." }
      ]
    });
    if (resp?.ok) out.textContent = resp.content;
    else out.textContent = `Error: ${resp?.error || "unknown"}`;
  });
}

const THEMES = ["notebook", "modern", "codey"];
function applyTheme(theme) {
  const t = THEMES.includes(theme) ? theme : "notebook";
  document.documentElement.dataset.theme = t;
}

function bindTheme() {
  const picker = document.querySelector("#themePicker");
  if (!picker) return;
  const current = settings.theme || "notebook";
  picker.querySelectorAll('input[type="radio"]').forEach((r) => {
    r.checked = r.value === current;
    r.addEventListener("change", async () => {
      applyTheme(r.value);
      settings = await setSettings({ theme: r.value });
      flash("Theme saved");
    });
  });
}

function bindProxy() {
  const input = document.querySelector("#proxyUrl");
  if (input) {
    input.value = settings.proxyUrl || "";
    input.placeholder = DEFAULT_PROXY_URL;
    input.addEventListener("change", async () => {
      settings = await setSettings({ proxyUrl: input.value.trim() });
      flash("Saved");
    });
  }
  const reset = document.querySelector("#resetOnboarding");
  if (reset) {
    reset.addEventListener("click", async (e) => {
      e.preventDefault();
      // Clear both proxy and keys so the onboarding sheet re-triggers.
      settings = await setSettings({
        proxyUrl: "",
        onboardedAt: 0,
        keys: { groq: "", openai: "", anthropic: "", gemini: "", openrouter: "" }
      });
      const inp = document.querySelector("#proxyUrl");
      if (inp) inp.value = "";
      document.querySelectorAll(".key-row input").forEach((i) => (i.value = ""));
      flash("Onboarding reset. Reopen the overlay on any problem page.");
    });
  }
}

async function init() {
  settings = await getSettings();
  applyTheme(settings.theme);
  bindTheme();
  bindProxy();
  buildKeys();
  buildDefaults();
  bindTest();
}
init();
