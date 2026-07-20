import { PATTERNS } from "../knowledge/patterns.js";
import { TEMPLATE_BY_ID } from "../knowledge/templates.js";
import { COMPLEXITY, complexityAsText } from "../knowledge/complexity.js";

const STOPWORDS = new Set([
  "the","a","an","of","and","or","to","in","for","on","by","with","is","are",
  "be","was","were","this","that","these","those","it","its","as","at","from",
  "if","then","else","not","no","yes","you","we","they","he","she","given",
  "return","find","output","input","print","expected","example","note","also",
  "such","which","where","when","how","what","why","can","may","must","should",
  "will","just","only","some","any","all","each","every","one","two","three",
  "up","down","left","right","first","last","next","prev","previous","above",
  "below","less","more","most","least","between","using","use","used","uses",
  "let","let's","lets","its","their","there","here","them","him","her","his",
  "hers","our","yours","ours","theirs","us"
]);

const PHRASE_TAGS = [
  ["sliding window",       ["sliding-window"]],
  ["two pointer",          ["two-pointer"]],
  ["prefix sum",           ["prefix-sum"]],
  ["difference array",     ["difference-array"]],
  ["monotonic stack",      ["monotonic", "stack"]],
  ["monotonic queue",      ["monotonic", "deque"]],
  ["monotonic deque",      ["monotonic", "deque"]],
  ["union find",           ["union-find", "dsu"]],
  ["disjoint set",         ["union-find", "dsu"]],
  ["binary search",        ["binary-search"]],
  ["topological sort",     ["topological-sort", "dag"]],
  ["topological order",    ["topological-sort", "dag"]],
  ["shortest path",        ["shortest-path", "dijkstra", "bfs"]],
  ["all pairs",            ["all-pairs", "floyd-warshall"]],
  ["strongly connected",   ["scc"]],
  ["articulation",         ["articulation-point"]],
  ["cut vertex",           ["articulation-point"]],
  ["bridge edge",          ["bridge"]],
  ["minimum spanning",     ["mst"]],
  ["maximum flow",         ["max-flow"]],
  ["min cut",              ["max-flow"]],
  ["longest common",       ["lcs"]],
  ["longest increasing",   ["lis"]],
  ["edit distance",        ["edit-distance"]],
  ["knapsack",             ["knapsack"]],
  ["coin change",          ["coin-change","knapsack"]],
  ["fenwick",              ["fenwick","bit"]],
  ["segment tree",         ["segment-tree"]],
  ["lazy propagation",     ["lazy-propagation","segment-tree"]],
  ["sparse table",         ["sparse-table","rmq"]],
  ["range sum",            ["range-sum","prefix-sum"]],
  ["range query",          ["range-query"]],
  ["range update",         ["range-update"]],
  ["rolling hash",         ["rolling-hash","hashing"]],
  ["convex hull",          ["convex-hull","geometry"]],
  ["sweep line",           ["sweep-line","geometry"]],
  ["cycle detection",      ["floyd","fast-slow-pointer","cycle"]],
  ["linked list",          ["linked-list"]],
  ["binary tree",          ["binary-tree","tree"]],
  ["binary search tree",   ["bst","binary-tree"]],
  ["level order",          ["bfs","level-order"]],
  ["lowest common ancestor",["lca"]],
  ["number of islands",    ["bfs","dfs","grid","union-find"]],
  ["shortest bridge",      ["bfs","grid"]],
  ["dynamic programming",  ["dp"]],
  ["bit manipulation",     ["bit","bitwise"]],
  ["gray code",            ["bit","gray-code"]],
  ["reservoir sampling",   ["random","streaming"]],
  ["huffman",              ["huffman","greedy"]],
  ["interval",             ["intervals"]],
  ["burst balloon",        ["interval-dp"]],
  ["palindrome",           ["palindrome"]],
  ["longest palindromic",  ["manacher","palindrome"]],
  ["pattern match",        ["kmp","z-function","string"]],
  ["kmp",                  ["kmp"]],
  ["backtrack",            ["backtracking"]],
  ["combinations",         ["backtracking","combination"]],
  ["permutations",         ["backtracking","permutation"]],
  ["subsets",              ["backtracking","subset"]],
  ["n-queens",             ["backtracking","n-queens"]],
  ["sudoku",               ["backtracking"]],
  ["priority queue",       ["heap","priority-queue"]],
  ["heap",                 ["heap"]],
  ["hash map",             ["hashmap"]],
  ["hash set",             ["hashset"]],
  ["lru cache",            ["cache","lru-cache"]]
];

function keywords(text) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s+-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return new Set(words);
}

function phraseTags(text) {
  const t = text.toLowerCase();
  const tags = new Set();
  for (const [phrase, phraseTagsForPhrase] of PHRASE_TAGS) {
    if (t.includes(phrase)) phraseTagsForPhrase.forEach((tag) => tags.add(tag));
  }
  return tags;
}

function score(entry, kws, ptags) {
  let s = 0;
  for (const tag of entry.tags) {
    if (ptags.has(tag)) s += 4;
    const tagWords = tag.split(/[-_]/);
    for (const w of tagWords) if (kws.has(w)) s += 1;
  }
  for (const w of entry.title.toLowerCase().split(/\W+/)) {
    if (kws.has(w)) s += 1.5;
  }
  return s;
}

export function retrieve(problemText, opts = {}) {
  const k = opts.k ?? 5;
  const includeTemplates = opts.includeTemplates ?? true;
  const text = (problemText || "") + " " + (opts.topicHint || "");
  const kws = keywords(text);
  const ptags = phraseTags(text);
  const scored = PATTERNS
    .map((entry) => ({ entry, score: score(entry, kws, ptags) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  const top = scored.slice(0, k);
  if (includeTemplates) {
    for (const r of top) r.template = TEMPLATE_BY_ID[r.entry.id];
  }
  return top;
}

export function referenceBlock(retrieved, { tier = 5 } = {}) {
  if (!retrieved || retrieved.length === 0) return "";

  const showFull  = tier >= 3;
  const showIdea  = tier >= 2;
  const showCode  = tier >= 4;
  const lines = [];
  lines.push("<reference>");
  lines.push("These are candidate techniques you may (or may not) find relevant. Use them as prior knowledge; do NOT paste any part verbatim; adapt to the problem's specifics. If none apply, ignore this block.");
  lines.push("");

  for (const { entry, template } of retrieved) {
    lines.push(`## ${entry.title}`);
    if (showFull) {
      lines.push(`When: ${entry.when}`);
      if (showIdea && entry.idea) lines.push(`Idea: ${entry.idea}`);
      if (entry.watch?.length) {
        lines.push("Watch:");
        for (const w of entry.watch) lines.push(`- ${w}`);
      }
    } else if (showIdea) {
      lines.push(`Category: ${entry.when}`);
    }
    if (showCode && template) {
      lines.push("Template (" + template.language + "):");
      lines.push("```" + template.language);
      lines.push(template.code);
      lines.push("```");
    }
    lines.push("");
  }
  lines.push("</reference>");
  return lines.join("\n");
}

export function retrievedTitles(retrieved) {
  return retrieved.map((r) => r.entry.id);
}

export { COMPLEXITY, complexityAsText };
