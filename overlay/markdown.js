
import { highlight } from "./highlight.js";

function escape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderMarkdown(src) {
  if (!src) return "";
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let inFence = false;
  let fenceLang = "";
  let fenceBuf = [];
  let inList = null; // 'ul' | 'ol' | null
  let paraBuf = [];

  const flushPara = () => {
    if (paraBuf.length) {
      out.push(`<p>${inline(paraBuf.join(" "))}</p>`);
      paraBuf = [];
    }
  };
  const closeList = () => {
    if (inList) {
      out.push(`</${inList}>`);
      inList = null;
    }
  };
  const emitCodeBlock = (code, lang) => {
    const langLabel = lang ? escape(lang) : "text";
    const body = highlight(code, lang);
    out.push(
      `<pre class="lh-code" data-lang="${langLabel}"><div class="lh-code-head"><span class="lh-code-lang">${langLabel}</span><button class="lh-code-copy" type="button" aria-label="Copy code">copy</button></div><code>${body}</code></pre>`
    );
  };

  for (const raw of lines) {
    if (inFence) {
      if (/^```/.test(raw)) {
        emitCodeBlock(fenceBuf.join("\n"), fenceLang);
        inFence = false;
        fenceLang = "";
        fenceBuf = [];
      } else {
        fenceBuf.push(raw);
      }
      continue;
    }
    const fenceOpen = raw.match(/^```([\w+.#-]*)\s*$/);
    if (fenceOpen) {
      flushPara();
      closeList();
      inFence = true;
      fenceLang = fenceOpen[1];
      fenceBuf = [];
      continue;
    }
    const heading = raw.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushPara();
      closeList();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    const ul = raw.match(/^\s*[-*]\s+(.*)$/);
    const ol = raw.match(/^\s*\d+\.\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const kind = ul ? "ul" : "ol";
      if (inList !== kind) {
        closeList();
        out.push(`<${kind}>`);
        inList = kind;
      }
      out.push(`<li>${inline((ul || ol)[1])}</li>`);
      continue;
    }
    if (!raw.trim()) {
      flushPara();
      closeList();
      continue;
    }
    paraBuf.push(raw);
  }
  if (inFence) emitCodeBlock(fenceBuf.join("\n"), fenceLang);
  flushPara();
  closeList();
  return out.join("\n");
}

function inline(s) {
  let x = escape(s);
  x = x.replace(/`([^`]+)`/g, (_, c) => `<code class="lh-inline-code">${c}</code>`);
  x = x.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  x = x.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  x = x.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => {
    const safe = /^https?:/i.test(href) ? href : "#";
    return `<a href="${safe}" target="_blank" rel="noopener">${t}</a>`;
  });
  return x;
}
