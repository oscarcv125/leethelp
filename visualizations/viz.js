const PALETTE = {
  bg:      "#201B17",   // warm ink slab
  cellBg:  "#2B2620",   // empty cell
  wall:    "#0F0B08",   // wall / obstacle
  visited: ["#2F3A2C", "#4A5A3C", "#6B7548", "#8F824F", "#A97A47", "#A0442E"],
  start:   "#A7B18F",   // sage
  goal:    "#A0442E",   // oxblood
  path:    "#E7C68A",   // honey
  bar:     "#8A8073",   // muted bone
  barHit:  "#A0442E",   // oxblood highlight
  barDone: "#A7B18F",   // sage when settled
  text:    "#E9E1D3",
  textDim: "#8A8073"
};

export function runVisualization({ kind, canvas, speed = 20, onCaption = () => {} }) {
  switch (kind) {
    case "bfs":         return runGridSearch({ canvas, speed, onCaption, mode: "bfs" });
    case "dfs":         return runGridSearch({ canvas, speed, onCaption, mode: "dfs" });
    case "dijkstra":    return runGridSearch({ canvas, speed, onCaption, mode: "dijkstra" });
    case "astar":       return runGridSearch({ canvas, speed, onCaption, mode: "astar" });
    case "sort-bubble": return runSort({ canvas, speed, onCaption, algo: "bubble" });
    case "sort-quick":  return runSort({ canvas, speed, onCaption, algo: "quick" });
    case "sort-merge":  return runSort({ canvas, speed, onCaption, algo: "merge" });
    case "binary-search": return runBinarySearch({ canvas, speed, onCaption });
    default:            return noopController();
  }
}

function noopController() {
  return { play() {}, pause() {}, setSpeed() {}, stop() {} };
}
function makeLoop({ canvas, speed, tick, draw, onCaption }) {
  const ctx = canvas.getContext("2d");
  let playing = false;
  let frameCounter = 0;
  let framesPerStep = Math.max(1, Math.round(70 - speed));
  let raf = 0;

  function loop() {
    if (!playing) return;
    frameCounter++;
    if (frameCounter >= framesPerStep) {
      frameCounter = 0;
      const done = tick();
      if (done) {
        playing = false;
        draw(ctx);
        return;
      }
    }
    draw(ctx);
    raf = requestAnimationFrame(loop);
  }

  return {
    play() {
      if (playing) return;
      playing = true;
      raf = requestAnimationFrame(loop);
    },
    pause() {
      playing = false;
      cancelAnimationFrame(raf);
    },
    setSpeed(s) {
      framesPerStep = Math.max(1, Math.round(70 - s));
    },
    stop() {
      playing = false;
      cancelAnimationFrame(raf);
    },
    _caption: onCaption
  };
}
function runGridSearch({ canvas, speed, onCaption, mode }) {
  const COLS = 22, ROWS = 20;
  const CELL = Math.min(canvas.width / COLS, canvas.height / ROWS);
  const OFFX = (canvas.width - COLS * CELL) / 2;
  const OFFY = (canvas.height - ROWS * CELL) / 2;

  // 0 empty, 1 wall
  const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  seedWalls(grid);
  // random per-cell weight for Dijkstra flavor (1..9)
  const weight = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => 1 + Math.floor(Math.random() * 8))
  );
  const start = { r: 2, c: 2 };
  const goal = { r: ROWS - 3, c: COLS - 3 };
  grid[start.r][start.c] = 0;
  grid[goal.r][goal.c] = 0;

  const visited = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
  const parent = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
  const dist = Array.from({ length: ROWS }, () => new Array(COLS).fill(Infinity));

  const frontier = createFrontier(mode);
  frontier.push({ r: start.r, c: start.c, priority: 0 });
  dist[start.r][start.c] = 0;

  let finished = false;
  let path = null;
  let steps = 0;

  function tick() {
    if (finished) return true;
    if (frontier.isEmpty()) {
      finished = true;
      controller._caption(`No path found after ${steps} steps.`);
      return true;
    }
    const cur = frontier.pop();
    if (visited[cur.r][cur.c]) return false;
    visited[cur.r][cur.c] = true;
    steps++;
    if (cur.r === goal.r && cur.c === goal.c) {
      path = reconstruct(parent, goal);
      finished = true;
      controller._caption(
        `${label(mode)} reached the goal in ${steps} expansions. Path length: ${path.length}.`
      );
      return true;
    }
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = cur.r + dr, nc = cur.c + dc;
      if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) continue;
      if (grid[nr][nc] === 1 || visited[nr][nc]) continue;
      const step = mode === "dijkstra" ? weight[nr][nc] : 1;
      const nd = dist[cur.r][cur.c] + step;
      if (nd < dist[nr][nc]) {
        dist[nr][nc] = nd;
        parent[nr][nc] = { r: cur.r, c: cur.c };
        let priority = nd;
        if (mode === "astar") priority = nd + manhattan({ r: nr, c: nc }, goal);
        if (mode === "dfs") priority = -steps; // LIFO via decreasing key
        if (mode === "bfs") priority = steps;   // FIFO via increasing key
        frontier.push({ r: nr, c: nc, priority });
      }
    }
    controller._caption(`${label(mode)} · expansion #${steps} · frontier ${frontier.size()}`);
    return false;
  }

  function draw(ctx) {
    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = OFFX + c * CELL;
        const y = OFFY + r * CELL;
        if (grid[r][c] === 1) ctx.fillStyle = PALETTE.wall;
        else if (visited[r][c]) ctx.fillStyle = shade(dist[r][c]);
        else ctx.fillStyle = PALETTE.cellBg;
        ctx.fillRect(x, y, CELL - 1, CELL - 1);
      }
    }
    if (path) {
      ctx.fillStyle = PALETTE.path;
      for (const n of path) {
        ctx.fillRect(OFFX + n.c * CELL + 2, OFFY + n.r * CELL + 2, CELL - 5, CELL - 5);
      }
    }
    fillCell(ctx, start, PALETTE.start);
    fillCell(ctx, goal, PALETTE.goal);
  }
  function fillCell(ctx, p, color) {
    ctx.fillStyle = color;
    ctx.fillRect(OFFX + p.c * CELL + 2, OFFY + p.r * CELL + 2, CELL - 5, CELL - 5);
  }
  function shade(d) {
    if (!isFinite(d)) return PALETTE.cellBg;
    const t = Math.min(1, d / (ROWS + COLS + 20));
    const stops = PALETTE.visited;
    const scaled = t * (stops.length - 1);
    const i = Math.floor(scaled);
    return stops[Math.min(stops.length - 1, i)];
  }

  const controller = makeLoop({ canvas, speed, tick, draw, onCaption });
  onCaption(`${label(mode)} ready. Press Play.`);
  draw(canvas.getContext("2d"));
  return controller;
}

function label(mode) {
  return { bfs: "BFS", dfs: "DFS", dijkstra: "Dijkstra", astar: "A*" }[mode];
}
function manhattan(a, b) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c); }
function reconstruct(parent, goal) {
  const path = [];
  let cur = goal;
  while (cur) {
    path.push(cur);
    cur = parent[cur.r][cur.c];
  }
  return path.reverse();
}

function createFrontier(mode) {
  if (mode === "bfs") {
    const q = [];
    return {
      push: (x) => q.push(x),
      pop: () => q.shift(),
      isEmpty: () => q.length === 0,
      size: () => q.length
    };
  }
  if (mode === "dfs") {
    const s = [];
    return {
      push: (x) => s.push(x),
      pop: () => s.pop(),
      isEmpty: () => s.length === 0,
      size: () => s.length
    };
  }
  // Dijkstra & A* → min-heap on priority
  const heap = [];
  return {
    push: (x) => { heap.push(x); heapUp(heap, heap.length - 1); },
    pop: () => {
      const top = heap[0];
      const last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        heapDown(heap, 0);
      }
      return top;
    },
    isEmpty: () => heap.length === 0,
    size: () => heap.length
  };
}
function heapUp(h, i) {
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (h[p].priority <= h[i].priority) break;
    [h[p], h[i]] = [h[i], h[p]];
    i = p;
  }
}
function heapDown(h, i) {
  const n = h.length;
  while (true) {
    const l = 2 * i + 1, r = 2 * i + 2;
    let s = i;
    if (l < n && h[l].priority < h[s].priority) s = l;
    if (r < n && h[r].priority < h[s].priority) s = r;
    if (s === i) break;
    [h[s], h[i]] = [h[i], h[s]];
    i = s;
  }
}

function seedWalls(grid) {
  const ROWS = grid.length, COLS = grid[0].length;
  // random obstacles ~22% density, with a few corridors carved out
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (Math.random() < 0.22) grid[r][c] = 1;
    }
  }
  // ensure some open middle corridor for interesting paths
  const midR = Math.floor(ROWS / 2);
  for (let c = 4; c < COLS - 4; c++) grid[midR][c] = 0;
}
function runSort({ canvas, speed, onCaption, algo }) {
  const N = 48;
  const arr = Array.from({ length: N }, (_, i) => i + 1);
  shuffle(arr);
  const ops = [];
  const arrCopy = arr.slice();
  if (algo === "bubble") bubble(arrCopy, ops);
  else if (algo === "quick") quick(arrCopy, 0, arrCopy.length - 1, ops);
  else if (algo === "merge") merge(arrCopy, ops);
  const highlights = new Set();
  const swaps = { pending: null };
  let idx = 0;
  let comparisons = 0;
  let writes = 0;

  function tick() {
    if (idx >= ops.length) {
      onCaption(`${algo} · done · ${comparisons} comparisons · ${writes} writes`);
      return true;
    }
    const op = ops[idx++];
    highlights.clear();
    if (op.type === "cmp") {
      comparisons++;
      highlights.add(op.i);
      highlights.add(op.j);
    } else if (op.type === "swap") {
      writes += 2;
      [arr[op.i], arr[op.j]] = [arr[op.j], arr[op.i]];
      highlights.add(op.i);
      highlights.add(op.j);
    } else if (op.type === "set") {
      writes++;
      arr[op.i] = op.v;
      highlights.add(op.i);
    }
    onCaption(`${algo} · step ${idx}/${ops.length} · cmp ${comparisons} · write ${writes}`);
    return false;
  }

  function draw(ctx) {
    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width / N;
    const maxH = canvas.height - 20;
    const done = idx >= ops.length;
    for (let i = 0; i < N; i++) {
      const h = (arr[i] / N) * maxH;
      if (done) ctx.fillStyle = PALETTE.barDone;
      else if (highlights.has(i)) ctx.fillStyle = PALETTE.barHit;
      else ctx.fillStyle = PALETTE.bar;
      ctx.fillRect(i * w, canvas.height - h, w - 1, h);
    }
    void swaps;
  }

  const controller = makeLoop({ canvas, speed, tick, draw, onCaption });
  onCaption(`${algo} ready. Press Play.`);
  draw(canvas.getContext("2d"));
  return controller;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function bubble(a, ops) {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      ops.push({ type: "cmp", i: j, j: j + 1 });
      if (a[j] > a[j + 1]) {
        ops.push({ type: "swap", i: j, j: j + 1 });
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
      }
    }
  }
}

function quick(a, lo, hi, ops) {
  if (lo >= hi) return;
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    ops.push({ type: "cmp", i: j, j: hi });
    if (a[j] < pivot) {
      ops.push({ type: "swap", i: i, j: j });
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  ops.push({ type: "swap", i, j: hi });
  [a[i], a[hi]] = [a[hi], a[i]];
  quick(a, lo, i - 1, ops);
  quick(a, i + 1, hi, ops);
}

function merge(a, ops) {
  const tmp = new Array(a.length);
  function ms(lo, hi) {
    if (hi - lo <= 1) return;
    const mid = (lo + hi) >> 1;
    ms(lo, mid);
    ms(mid, hi);
    for (let i = lo; i < hi; i++) tmp[i] = a[i];
    let i = lo, j = mid;
    for (let k = lo; k < hi; k++) {
      if (i >= mid) { ops.push({ type: "set", i: k, v: tmp[j] }); a[k] = tmp[j++]; }
      else if (j >= hi) { ops.push({ type: "set", i: k, v: tmp[i] }); a[k] = tmp[i++]; }
      else {
        ops.push({ type: "cmp", i, j });
        if (tmp[i] <= tmp[j]) { ops.push({ type: "set", i: k, v: tmp[i] }); a[k] = tmp[i++]; }
        else { ops.push({ type: "set", i: k, v: tmp[j] }); a[k] = tmp[j++]; }
      }
    }
  }
  ms(0, a.length);
}
function runBinarySearch({ canvas, speed, onCaption }) {
  const N = 32;
  const arr = Array.from({ length: N }, (_, i) => i * 2 + Math.floor(Math.random() * 3));
  arr.sort((a, b) => a - b);
  const target = arr[Math.floor(Math.random() * N)];
  let lo = 0, hi = N - 1, mid = 0;
  let done = false;
  let found = -1;

  function tick() {
    if (done) return true;
    if (lo > hi) {
      done = true;
      onCaption(`Target ${target} not found.`);
      return true;
    }
    mid = (lo + hi) >> 1;
    if (arr[mid] === target) {
      found = mid;
      done = true;
      onCaption(`Found ${target} at index ${mid}.`);
      return true;
    }
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
    onCaption(`Searching ${target} · window [${lo}, ${hi}]`);
    return false;
  }

  function draw(ctx) {
    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width / N;
    for (let i = 0; i < N; i++) {
      const h = (arr[i] / arr[N - 1]) * (canvas.height - 40);
      if (found === i) ctx.fillStyle = PALETTE.start;      // sage, found
      else if (i === mid) ctx.fillStyle = PALETTE.barHit;  // oxblood, probe
      else if (i >= lo && i <= hi) ctx.fillStyle = PALETTE.path;  // honey, window
      else ctx.fillStyle = PALETTE.cellBg;                 // dim, excluded
      ctx.fillRect(i * w, canvas.height - h - 20, w - 1, h);
    }
    ctx.fillStyle = PALETTE.text;
    ctx.font = 'italic 12px "Newsreader", "Times New Roman", serif';
    ctx.fillText(`target = ${target}`, 6, 14);
  }

  const controller = makeLoop({ canvas, speed, tick, draw, onCaption });
  onCaption(`Binary search ready. Target ${target}.`);
  draw(canvas.getContext("2d"));
  return controller;
}
