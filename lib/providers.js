export const DEFAULT_PROXY_URL = "";

export const PROVIDERS = {
  groq: {
    label: "Groq (free, default)",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      "llama-3.3-70b-versatile",
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
      "gemma2-9b-it",
      "deepseek-r1-distill-llama-70b"
    ],
    docs: "https://console.groq.com/keys"
  },
  openai: {
    label: "OpenAI",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o", "gpt-4o-mini", "o1-mini", "o3-mini", "gpt-4.1-mini"],
    docs: "https://platform.openai.com/api-keys"
  },
  anthropic: {
    label: "Anthropic (Claude)",
    defaultModel: "claude-3-5-sonnet-latest",
    models: [
      "claude-3-5-sonnet-latest",
      "claude-3-5-haiku-latest",
      "claude-3-opus-latest"
    ],
    docs: "https://console.anthropic.com/settings/keys"
  },
  gemini: {
    label: "Google Gemini",
    defaultModel: "gemini-2.0-flash",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    docs: "https://aistudio.google.com/apikey"
  },
  openrouter: {
    label: "OpenRouter (any model)",
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    models: [
      "meta-llama/llama-3.3-70b-instruct:free",
      "anthropic/claude-3.5-sonnet",
      "openai/gpt-4o",
      "google/gemini-2.0-flash-001",
      "deepseek/deepseek-chat"
    ],
    docs: "https://openrouter.ai/keys"
  }
};

function getKey(provider, keys) {
  return keys[provider] || "";
}

async function streamSSE(res, extractDelta, onDelta) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const parsed = JSON.parse(payload);
        const delta = extractDelta(parsed);
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      } catch {
        /* ignore malformed frames */
      }
    }
  }
  return full;
}

async function callOpenAICompatible({ url, key, model, messages, temperature, onDelta }) {
  const streaming = typeof onDelta === "function";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages,
      temperature: temperature ?? 0.4,
      stream: streaming
    })
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 400)}`);
  if (!streaming) {
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
  return streamSSE(res, (p) => p?.choices?.[0]?.delta?.content, onDelta);
}

async function callAnthropic({ key, model, messages, temperature, onDelta }) {
  const streaming = typeof onDelta === "function";
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const rest = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"  // required for chrome-extension origin
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: temperature ?? 0.4,
      system,
      messages: rest,
      stream: streaming
    })
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 400)}`);
  if (!streaming) {
    const data = await res.json();
    return data.content?.map((c) => c.text).join("") ?? "";
  }
  return streamSSE(
    res,
    (p) => (p?.type === "content_block_delta" ? p.delta?.text : undefined),
    onDelta
  );
}

async function callGemini({ key, model, messages, temperature, onDelta }) {
  const streaming = typeof onDelta === "function";
  const system = messages.find((m) => m.role === "system")?.content;
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
  const suffix = streaming ? "streamGenerateContent?alt=sse&" : "generateContent?";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${suffix}key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: { temperature: temperature ?? 0.4 }
    })
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 400)}`);
  if (!streaming) {
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  }
  return streamSSE(
    res,
    (p) => p?.candidates?.[0]?.content?.parts?.map((x) => x.text).join(""),
    onDelta
  );
}

export async function chat({ provider, model, messages, keys, temperature, onDelta, proxyUrl }) {
  const key = getKey(provider, keys || {});
  const chosenModel = model || PROVIDERS[provider].defaultModel;
  const usingProxy = provider === "groq" && proxyUrl && !key;
  if (!key && !usingProxy) throw new Error(`Missing API key for ${provider}. Add one in Settings or enable the community proxy.`);
  switch (provider) {
    case "groq":
      return callOpenAICompatible({
        url: usingProxy
          ? `${proxyUrl.replace(/\/+$/, "")}/chat`
          : "https://api.groq.com/openai/v1/chat/completions",
        key: usingProxy ? "proxy" : key,
        model: chosenModel,
        messages,
        temperature,
        onDelta
      });
    case "openai":
      return callOpenAICompatible({
        url: "https://api.openai.com/v1/chat/completions",
        key,
        model: chosenModel,
        messages,
        temperature,
        onDelta
      });
    case "openrouter":
      return callOpenAICompatible({
        url: "https://openrouter.ai/api/v1/chat/completions",
        key,
        model: chosenModel,
        messages,
        temperature,
        onDelta
      });
    case "anthropic":
      return callAnthropic({ key, model: chosenModel, messages, temperature, onDelta });
    case "gemini":
      return callGemini({ key, model: chosenModel, messages, temperature, onDelta });
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
