export const DEFAULTS = {
  provider: "groq",
  model: "",
  theme: "notebook",
  language: "Python",
  temperature: 0.4,
  autoScrape: true,
  overlayPosition: { right: 24, top: 96, width: 440, height: 640 },
  proxyUrl: "",
  onboardedAt: 0,
  keys: {
    groq: "",
    openai: "",
    anthropic: "",
    gemini: "",
    openrouter: ""
  }
};

export async function getSettings() {
  const stored = await chrome.storage.sync.get(null);
  return { ...DEFAULTS, ...stored, keys: { ...DEFAULTS.keys, ...(stored.keys || {}) } };
}

export async function setSettings(patch) {
  const current = await getSettings();
  const merged = { ...current, ...patch, keys: { ...current.keys, ...(patch.keys || {}) } };
  await chrome.storage.sync.set(merged);
  return merged;
}
