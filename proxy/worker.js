const ALLOWED_MODELS = new Set([
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "deepseek-r1-distill-llama-70b"
]);

const RATE_WINDOW_S = 600;   // 10 minutes
const RATE_LIMIT = 20;       // requests per window per IP
const MAX_BODY = 128 * 1024; // 128 KB

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "leethelp-proxy" });
    }

    if (url.pathname !== "/chat" || request.method !== "POST") {
      return jsonResponse({ error: "not found" }, 404);
    }

    if (!env.GROQ_API_KEY) {
      return jsonResponse({ error: "proxy misconfigured: GROQ_API_KEY not set" }, 500);
    }
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      "unknown";
    if (env.RATE_KV) {
      const key = `rl:${ip}:${Math.floor(Date.now() / (RATE_WINDOW_S * 1000))}`;
      const raw = await env.RATE_KV.get(key);
      const count = raw ? parseInt(raw, 10) : 0;
      if (count >= RATE_LIMIT) {
        return jsonResponse(
          { error: `rate limit: ${RATE_LIMIT} req / ${RATE_WINDOW_S / 60} min. add your own Groq key in Settings to bypass.` },
          429
        );
      }
      env.RATE_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW_S + 60 });
    }
    const cl = parseInt(request.headers.get("content-length") || "0", 10);
    if (cl > MAX_BODY) return jsonResponse({ error: "body too large" }, 413);

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "invalid json" }, 400);
    }
    if (!body?.model || !ALLOWED_MODELS.has(body.model)) {
      body.model = "llama-3.3-70b-versatile";
    }
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify(body)
    });
    const responseHeaders = new Headers(CORS_HEADERS);
    responseHeaders.set(
      "Content-Type",
      upstream.headers.get("content-type") || "application/json"
    );
    responseHeaders.set("Cache-Control", "no-store");

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders
    });
  }
};

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
  });
}
