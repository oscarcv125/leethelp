import { chat, PROVIDERS } from "../lib/providers.js";
import { getSettings, setSettings } from "../lib/storage.js";

chrome.runtime.onInstalled.addListener(async () => {
  await getSettings();
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "leethelp-explain-selection",
      title: "LeetHelp: Explain selection",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "leethelp-open",
      title: "LeetHelp: Open overlay",
      contexts: ["page", "action"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;
  if (info.menuItemId === "leethelp-open") {
    chrome.tabs.sendMessage(tab.id, { type: "leethelp:show" });
  }
  if (info.menuItemId === "leethelp-explain-selection") {
    chrome.tabs.sendMessage(tab.id, {
      type: "leethelp:command",
      command: { kind: "explainSelection", text: info.selectionText || "" }
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  if (command === "toggle-overlay") {
    chrome.tabs.sendMessage(tab.id, { type: "leethelp:toggle" });
  } else if (command === "next-hint") {
    chrome.tabs.sendMessage(tab.id, {
      type: "leethelp:command",
      command: { kind: "nextHint" }
    });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "leethelp:toggle" });
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "leethelp") return;
  port.onMessage.addListener(async (msg) => {
    if (msg?.type !== "chat") return;
    try {
      const settings = await getSettings();
      const provider = msg.provider || settings.provider;
      const model = msg.model || settings.model || PROVIDERS[provider].defaultModel;
      const requestId = msg.requestId;
      await chat({
        provider,
        model,
        keys: settings.keys,
        proxyUrl: settings.proxyUrl,
        messages: msg.messages,
        temperature: msg.temperature ?? settings.temperature,
        onDelta: (delta) => port.postMessage({ type: "delta", requestId, delta })
      });
      port.postMessage({ type: "done", requestId });
    } catch (err) {
      port.postMessage({
        type: "error",
        requestId: msg?.requestId,
        error: err?.message || String(err)
      });
    }
  });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg?.type === "settings:get") sendResponse(await getSettings());
    else if (msg?.type === "settings:set") sendResponse(await setSettings(msg.patch || {}));
    else if (msg?.type === "providers:list") sendResponse({ providers: PROVIDERS });
    else if (msg?.type === "chat:once") {
      try {
        const settings = await getSettings();
        const provider = msg.provider || settings.provider;
        const model = msg.model || settings.model || PROVIDERS[provider].defaultModel;
        const content = await chat({
          provider,
          model,
          keys: settings.keys,
          proxyUrl: settings.proxyUrl,
          messages: msg.messages,
          temperature: msg.temperature ?? settings.temperature
        });
        sendResponse({ ok: true, content });
      } catch (e) {
        sendResponse({ ok: false, error: e?.message || String(e) });
      }
    }
  })();
  return true;
});
