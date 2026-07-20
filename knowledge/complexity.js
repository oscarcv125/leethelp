export const COMPLEXITY = {
  arrays: {
    "index":      { time: "O(1)",       note: "" },
    "append":     { time: "O(1) amort", note: "amortized due to doubling" },
    "insert-mid": { time: "O(n)",       note: "shift right" },
    "delete-mid": { time: "O(n)",       note: "shift left" },
    "search":     { time: "O(n)",       note: "unsorted; O(log n) if sorted via binary search" }
  },
  "hash-table": {
    "insert / delete / lookup": { time: "O(1) avg, O(n) worst", note: "worst on adversarial collisions" }
  },
  "balanced-bst / std::map / TreeMap": {
    "insert / delete / lookup": { time: "O(log n)", note: "" },
    "range / order stats":      { time: "O(log n)", note: "with augmented tree (order-statistic)" }
  },
  heap: {
    "push / pop": { time: "O(log n)", note: "binary heap" },
    "top":        { time: "O(1)",     note: "" },
    "build-heap": { time: "O(n)",     note: "not n log n" }
  },
  "union-find": {
    "find / union": { time: "O(α(n))", note: "with path compression + union by rank" }
  },
  "segment-tree": {
    "build":       { time: "O(n)",     note: "" },
    "point-update / range-query": { time: "O(log n)", note: "" },
    "range-update (lazy)":        { time: "O(log n)", note: "" }
  },
  "fenwick-tree (BIT)": {
    "point-update / prefix-sum": { time: "O(log n)", note: "" },
    "space":                     { time: "O(n)",     note: "" }
  },
  sorting: {
    "quicksort": { time: "O(n log n) avg / O(n^2) worst", note: "randomized avoids worst case" },
    "mergesort": { time: "O(n log n)", note: "stable, O(n) aux space" },
    "heapsort":  { time: "O(n log n)", note: "in-place, not stable" },
    "counting":  { time: "O(n + k)",   note: "k = value range" },
    "radix":     { time: "O(n · d)",   note: "d = number of digits/passes" }
  },
  graphs: {
    "bfs / dfs":          { time: "O(V + E)",         note: "" },
    "dijkstra (heap)":    { time: "O((V + E) log V)", note: "non-negative weights" },
    "bellman-ford":       { time: "O(V · E)",         note: "handles negatives; detects neg cycle" },
    "floyd-warshall":     { time: "O(V^3)",           note: "all-pairs" },
    "mst (kruskal/prim)": { time: "O(E log E)",       note: "" },
    "max-flow (dinic)":   { time: "O(V^2 · E)",       note: "O(E · sqrt(V)) on unit-capacity" }
  },
  strings: {
    "KMP / Z-function":  { time: "O(n + m)", note: "" },
    "rolling hash":      { time: "O(n)",     note: "watch collisions, double hash" },
    "suffix array":      { time: "O(n log n) or O(n)", note: "SA-IS is linear" },
    "manacher":          { time: "O(n)",     note: "longest palindromic substring" }
  }
};

export function complexityAsText() {
  const lines = [];
  for (const [group, ops] of Object.entries(COMPLEXITY)) {
    lines.push(`## ${group}`);
    for (const [op, meta] of Object.entries(ops)) {
      lines.push(`- ${op}: ${meta.time}${meta.note ? " , " + meta.note : ""}`);
    }
  }
  return lines.join("\n");
}
