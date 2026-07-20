(function () {
  const IFRAME_ID = "leethelp-overlay-frame";
  const FAB_ID = "leethelp-fab";
  const HOST_ID = "leethelp-host";
  const RESIZE_ID = "leethelp-resize";
  const CAPTURE_ID = "leethelp-capture";
  const STORAGE_KEY = "overlayGeometry";
  const MIN_W = 380;
  const MIN_H = 420;

  let visible = false;
  let dragOrigin = null;
  let resizeOrigin = null;
  let geometry = null;

  function ensureHost() {
    let host = document.getElementById(HOST_ID);
    if (host) return host;
    host = document.createElement("div");
    host.id = HOST_ID;
    document.documentElement.appendChild(host);
    return host;
  }

  function buildFAB() {
    if (document.getElementById(FAB_ID)) return;
    const btn = document.createElement("button");
    btn.id = FAB_ID;
    btn.type = "button";
    btn.title = "LeetHelp (Alt+L)";
    btn.setAttribute("aria-label", "Toggle LeetHelp");
    btn.innerHTML = `<span class="lh-fab-mark">LH</span>`;
    btn.addEventListener("click", () => toggleOverlay());
    ensureHost().appendChild(btn);
  }

  function buildOverlay() {
    if (document.getElementById(IFRAME_ID)) return;
    const iframe = document.createElement("iframe");
    iframe.id = IFRAME_ID;
    iframe.src = chrome.runtime.getURL("overlay/overlay.html");
    iframe.setAttribute("allow", "clipboard-read; clipboard-write");
    iframe.setAttribute("title", "LeetHelp");
    ensureHost().appendChild(iframe);

    // Resize grabber
    const resize = document.createElement("div");
    resize.id = RESIZE_ID;
    resize.title = "Drag to resize";
    ensureHost().appendChild(resize);
    resize.addEventListener("pointerdown", onResizePointerDown);

    // Restore stored geometry
    chrome.storage.sync.get(STORAGE_KEY).then((res) => {
      if (res && res[STORAGE_KEY]) {
        geometry = res[STORAGE_KEY];
        applyGeometry();
      }
      updateResizeHandlePosition();
    });

    window.addEventListener("resize", updateResizeHandlePosition);
    window.addEventListener("scroll", updateResizeHandlePosition, { passive: true });
  }

  function applyGeometry() {
    const iframe = document.getElementById(IFRAME_ID);
    if (!iframe || !geometry) return;
    iframe.style.setProperty("left", geometry.left + "px", "important");
    iframe.style.setProperty("top", geometry.top + "px", "important");
    iframe.style.setProperty("right", "auto", "important");
    iframe.style.setProperty("width", geometry.width + "px", "important");
    iframe.style.setProperty("height", geometry.height + "px", "important");
  }

  function saveGeometry() {
    if (!geometry) return;
    chrome.storage.sync.set({ [STORAGE_KEY]: geometry }).catch(() => {});
  }

  function currentRect() {
    const iframe = document.getElementById(IFRAME_ID);
    return iframe ? iframe.getBoundingClientRect() : null;
  }

  function updateResizeHandlePosition() {
    const rect = currentRect();
    const handle = document.getElementById(RESIZE_ID);
    if (!rect || !handle) return;
    const iframe = document.getElementById(IFRAME_ID);
    if (!iframe || !visible || iframe.classList.contains("minimized")) {
      handle.classList.remove("visible");
      return;
    }
    handle.classList.add("visible");
    handle.style.left = (rect.right - 14) + "px";
    handle.style.top = (rect.bottom - 14) + "px";
  }

  function toggleOverlay(forceVisible) {
    buildOverlay();
    const iframe = document.getElementById(IFRAME_ID);
    visible = forceVisible ?? !visible;
    iframe.classList.toggle("visible", visible);
    if (visible) {
      sendScrape();
      requestAnimationFrame(updateResizeHandlePosition);
    } else {
      updateResizeHandlePosition();
    }
  }

  function sendScrape() {
    const iframe = document.getElementById(IFRAME_ID);
    if (!iframe?.contentWindow) return;
    const data = window.__leethelpScrape ? window.__leethelpScrape() : null;
    iframe.contentWindow.postMessage({ type: "leethelp:problem", data }, "*");
  }

  let captureEl = null;

  function beginCapture(cursor) {
    if (!captureEl) {
      captureEl = document.createElement("div");
      captureEl.id = CAPTURE_ID;
      ensureHost().appendChild(captureEl);
    }
    captureEl.classList.add("visible");
    captureEl.classList.toggle("resizing", cursor === "resize");
  }

  function endCapture() {
    if (captureEl) captureEl.classList.remove("visible", "resizing");
  }

  function startDrag(startScreenX, startScreenY) {
    const rect = currentRect();
    if (!rect) return;
    dragOrigin = {
      rectLeft: rect.left,
      rectTop: rect.top,
      startScreenX,
      startScreenY
    };
    beginCapture("drag");

    const layer = document.getElementById(CAPTURE_ID);
    if (!layer) return;

    const move = (ev) => {
      if (!dragOrigin) return;
      const dx = ev.screenX - dragOrigin.startScreenX;
      const dy = ev.screenY - dragOrigin.startScreenY;
      const iframe = document.getElementById(IFRAME_ID);
      const nextLeft = Math.max(-40, Math.min(window.innerWidth - 80, dragOrigin.rectLeft + dx));
      const nextTop  = Math.max(0,   Math.min(window.innerHeight - 40, dragOrigin.rectTop + dy));
      iframe.style.setProperty("left", nextLeft + "px", "important");
      iframe.style.setProperty("top", nextTop + "px", "important");
      iframe.style.setProperty("right", "auto", "important");
      updateResizeHandlePosition();
    };
    const up = () => {
      layer.removeEventListener("pointermove", move);
      layer.removeEventListener("pointerup", up);
      layer.removeEventListener("pointercancel", up);
      const rect2 = currentRect();
      if (rect2) {
        geometry = {
          left: Math.round(rect2.left),
          top: Math.round(rect2.top),
          width: Math.round(rect2.width),
          height: Math.round(rect2.height)
        };
        saveGeometry();
      }
      dragOrigin = null;
      endCapture();
    };
    layer.addEventListener("pointermove", move);
    layer.addEventListener("pointerup", up);
    layer.addEventListener("pointercancel", up);
  }

  function onResizePointerDown(e) {
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const rect = currentRect();
    if (!rect) return;
    resizeOrigin = {
      rectW: rect.width,
      rectH: rect.height,
      startX: e.clientX,
      startY: e.clientY
    };
    beginCapture("resize");

    const move = (ev) => {
      const iframe = document.getElementById(IFRAME_ID);
      const w = Math.max(MIN_W, Math.min(window.innerWidth - 10, resizeOrigin.rectW + (ev.clientX - resizeOrigin.startX)));
      const h = Math.max(MIN_H, Math.min(window.innerHeight - 10, resizeOrigin.rectH + (ev.clientY - resizeOrigin.startY)));
      iframe.style.setProperty("width", w + "px", "important");
      iframe.style.setProperty("height", h + "px", "important");
      updateResizeHandlePosition();
    };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      const rect2 = currentRect();
      if (rect2) {
        geometry = {
          left: Math.round(rect2.left),
          top: Math.round(rect2.top),
          width: Math.round(rect2.width),
          height: Math.round(rect2.height)
        };
        saveGeometry();
      }
      resizeOrigin = null;
      endCapture();
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  }

  window.addEventListener("message", (ev) => {
    if (!ev.data || typeof ev.data !== "object") return;
    if (ev.data.source !== "leethelp-overlay") return;
    switch (ev.data.type) {
      case "close":
        toggleOverlay(false);
        break;
      case "minimize": {
        const iframe = document.getElementById(IFRAME_ID);
        iframe?.classList.add("minimized");
        updateResizeHandlePosition();
        break;
      }
      case "expand": {
        const iframe = document.getElementById(IFRAME_ID);
        iframe?.classList.remove("minimized");
        if (geometry) applyGeometry();
        updateResizeHandlePosition();
        break;
      }
      case "rescrape":
        sendScrape();
        break;
      case "drag:start":
        startDrag(ev.data.startX, ev.data.startY);
        break;
      case "grabEditorCode": {
        const code =
          document.querySelector(".monaco-editor .view-lines")?.innerText ||
          document.querySelector("textarea.ace_text-input")?.value ||
          document.querySelector("textarea")?.value ||
          "";
        ev.source?.postMessage(
          { type: "leethelp:editorCode", code, requestId: ev.data.requestId },
          "*"
        );
        break;
      }
    }
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "leethelp:toggle") toggleOverlay();
    if (msg?.type === "leethelp:show") toggleOverlay(true);
    if (msg?.type === "leethelp:command") {
      buildOverlay();
      toggleOverlay(true);
      const iframe = document.getElementById(IFRAME_ID);
      iframe?.contentWindow?.postMessage({ type: "leethelp:command", command: msg.command }, "*");
    }
  });

  function init() {
    buildFAB();
    buildOverlay();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
