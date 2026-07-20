import { PROVIDERS } from "../lib/providers.js";
import { getSettings, setSettings } from "../lib/storage.js";

const LANGS = ["Python", "C++", "Java", "JavaScript", "TypeScript", "Go", "Rust", "C#", "Kotlin", "Swift", "Ruby", "PHP"];

const $ = (s) => document.querySelector(s);

async function init() {
  const settings = await getSettings();
  const theme = ["notebook", "modern", "codey"].includes(settings.theme) ? settings.theme : "notebook";
  document.documentElement.dataset.theme = theme;

  const provSel = $("#provider");
  Object.entries(PROVIDERS).forEach(([id, p]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = p.label;
    if (id === settings.provider) opt.selected = true;
    provSel.appendChild(opt);
  });

  const modelSel = $("#model");
  function refreshModels() {
    modelSel.innerHTML = "";
    const meta = PROVIDERS[provSel.value];
    meta.models.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      if (m === settings.model) opt.selected = true;
      modelSel.appendChild(opt);
    });
    if (!modelSel.value) modelSel.value = meta.defaultModel;
  }
  refreshModels();

  const langSel = $("#language");
  LANGS.forEach((l) => {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l;
    if (l === settings.language) opt.selected = true;
    langSel.appendChild(opt);
  });

  const temp = $("#temperature");
  temp.value = Math.round((settings.temperature ?? 0.4) * 10);
  $("#tempVal").textContent = (temp.value / 10).toFixed(1);

  provSel.addEventListener("change", async () => {
    refreshModels();
    await setSettings({ provider: provSel.value, model: modelSel.value });
  });
  modelSel.addEventListener("change", async () => {
    await setSettings({ model: modelSel.value });
  });
  langSel.addEventListener("change", async () => {
    await setSettings({ language: langSel.value });
  });
  temp.addEventListener("input", async () => {
    const v = temp.value / 10;
    $("#tempVal").textContent = v.toFixed(1);
    await setSettings({ temperature: v });
  });

  $("#openOverlay").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "leethelp:show" });
    } catch {
      // Content script not present on this URL, inject it lazily on supported sites only.
      $("#status").textContent = "LeetHelp only runs on LeetCode / Codeforces / HackerRank / AtCoder / CodeChef.";
      return;
    }
    window.close();
  });

  $("#openOptions").addEventListener("click", () => {
    chrome.runtime.openOptionsPage?.();
  });
}

init();
