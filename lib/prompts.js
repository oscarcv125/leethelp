import { retrieve, referenceBlock, retrievedTitles } from "./knowledge.js";

export const HINT_TIERS = [
  {
    id: 1,
    label: "Nudge",
    blurb: "A Socratic question to unblock thinking. No approach revealed.",
    directive:
      "Give ONE Socratic question that nudges the solver toward the right mental model. Do NOT name any algorithm, data structure, or technique. Do NOT reveal complexity. 1-2 sentences maximum. End with the question."
  },
  {
    id: 2,
    label: "Concept",
    blurb: "Names the technique or DSA needed, no approach.",
    directive:
      "State the general category of technique or data structure this problem needs (e.g., 'sliding window', 'monotonic stack', 'union-find', 'DP on trees'). One or two lines. Do NOT describe the approach yet."
  },
  {
    id: 3,
    label: "Approach",
    blurb: "Step-by-step approach in plain English, no code.",
    directive:
      "Describe the approach step by step in plain English. Include why each step works and the target time/space complexity. Do NOT write code, only prose bullets. 5-8 bullets."
  },
  {
    id: 4,
    label: "Pseudocode",
    blurb: "Pseudocode with invariants, no full implementation.",
    directive:
      "Write clean pseudocode with the key invariant on each loop. Skip trivial boilerplate. Do NOT give a compilable solution, pseudocode only."
  },
  {
    id: 5,
    label: "Full Solution",
    blurb: "Complete solution with explanation & complexity.",
    directive:
      "Provide a fully working, idiomatic solution in the user's requested language. Explain the algorithm, walk through a small example, and state the exact time and space complexity. Point out edge cases you handled."
  }
];

const SYSTEM = `You are LeetHelp, a competitive-programming tutor embedded in a browser extension. You are strict and precise about hints, but conversational when the user is being conversational:
- If the user greets you, thanks you, or asks a short meta question, reply in kind. Do NOT lecture about the problem unless they ask about it.
- Never spoil more than the requested hint tier.
- Prefer correctness over cleverness; call out edge cases.
- When code is requested, produce idiomatic code in the target language, using standard-library conventions.
- Use Markdown. Code goes in fenced code blocks with language tags.
- When stating complexity, use big-O and briefly justify.
- Assume the user is preparing for interviews or contests. Be dense; avoid filler.
- A <reference> block may be provided. Use it as background, never quote it verbatim, and ignore entries that are not directly relevant.`;

const PURE_GREETING = /^(hi+|hello|hey+|yo|sup|thanks|thank you|ty|thx|ok|okay|kk|got it|cool|nice|sure|yes|yep|no|nope|maybe|lol|hmm+|great|awesome|k)[!.?]*\s*$/i;
const ALGO_KEYWORDS = /\b(algorithm|complexity|time|space|solution|solve|approach|hint|dp|graph|tree|array|string|hash|sort|search|bfs|dfs|dijkstra|why|how|when|explain|show|walk|step|code|function|loop|recursion|invariant|bug|test|edge|case|memoiz|greedy|slid|window|prefix|suffix|stack|queue|heap|trie|segment|fenwick|bit|manip|convex|hull|flow)\b/i;

function isPureGreeting(q) {
  if (!q) return false;
  return q.length <= 24 && PURE_GREETING.test(q.trim());
}

function needsRetrieval(q) {
  if (!q) return false;
  if (q.length >= 60) return true;
  return ALGO_KEYWORDS.test(q);
}

export function systemPrompt() {
  return SYSTEM;
}

function attachReference(userContent, problem, { tier = 5, topicHint = "" } = {}) {
  if (!problem) return { content: userContent, retrievedIds: [] };
  const retrieved = retrieve(problem, { k: 5, includeTemplates: tier >= 4, topicHint });
  if (retrieved.length === 0) return { content: userContent, retrievedIds: [] };
  const block = referenceBlock(retrieved, { tier });
  return {
    content: `${block}\n\n${userContent}`,
    retrievedIds: retrievedTitles(retrieved)
  };
}

export function buildHintMessages({ tier, problem, language, extraContext }) {
  const t = HINT_TIERS.find((x) => x.id === tier) ?? HINT_TIERS[0];
  const problemBlock = problem
    ? `Problem context (scraped from the page):\n\n<<<\n${problem.slice(0, 8000)}\n>>>`
    : "No problem scraped. Ask the user to open a supported problem page.";
  const langLine = language ? `Target language when code is required: **${language}**.` : "";
  const extra = extraContext ? `\nAdditional user context:\n${extraContext}` : "";
  const userBody = `HINT TIER ${t.id}, ${t.label}\n\nDirective: ${t.directive}\n\n${langLine}\n\n${problemBlock}${extra}`;
  const { content, retrievedIds } = attachReference(userBody, problem, { tier: t.id });
  return {
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content }
    ],
    retrievedIds
  };
}

export function buildExplainMessages({ topic, language, problem }) {
  const userBody = `Explain the following data structure or algorithm in depth: **${topic}**.

Cover:
1. What it is and when to reach for it.
2. Core invariant / mental model.
3. Time & space complexity (and common variants).
4. A worked micro-example (small input, show state transitions).
5. Pitfalls and off-by-one traps.
6. A minimal reference implementation in ${language || "Python"}.

${problem ? `Relate it briefly to the current problem:\n${problem.slice(0, 3000)}` : ""}`;
  const { content, retrievedIds } = attachReference(userBody, problem || "", {
    tier: 5,
    topicHint: topic
  });
  return {
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content }
    ],
    retrievedIds
  };
}

export function buildConvertMessages({ code, fromLang, toLang, problem }) {
  return {
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Translate this ${fromLang || "code"} solution into idiomatic **${toLang}**. Preserve algorithmic behavior and complexity. After the code, briefly note any language-specific gotchas.\n\n\`\`\`${fromLang || ""}\n${code}\n\`\`\`\n\n${problem ? `Original problem for context:\n${problem.slice(0, 3000)}` : ""}`
      }
    ],
    retrievedIds: []
  };
}

export function buildRateMessages({ code, language, problem }) {
  const userBody = `Rate this ${language || ""} solution on 5 axes with letter grades (A+, A, A-, B+, ..., F). Be honest and specific. Return your answer in EXACTLY this format so the UI can parse it:

<rating>
overall: <grade>
correctness: <grade>
complexity: <grade>
style: <grade>
edge_cases: <grade>
</rating>

Then, in Markdown below the rating block:
- one short sentence per axis justifying the score
- a "top 3 things to improve" section with concrete, actionable suggestions (not vague advice)

Problem:
${problem?.slice(0, 4000) || "(none)"}

Code:
\`\`\`${language || ""}
${code}
\`\`\``;
  const { content, retrievedIds } = attachReference(userBody, (problem || "") + " " + code, { tier: 5 });
  return {
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content }
    ],
    retrievedIds
  };
}

export function buildReviewMessages({ code, language, problem }) {
  const userBody = `Review this ${language || ""} solution against the problem. Identify:
- Correctness bugs and missed edge cases.
- Complexity of the current approach and whether it will TLE.
- Cleaner or faster alternatives (name them; do not rewrite unless asked).

Problem:
${problem?.slice(0, 4000) || "(none)"}

Code:
\`\`\`${language || ""}
${code}
\`\`\``;
  const { content, retrievedIds } = attachReference(userBody, (problem || "") + " " + code, { tier: 5 });
  return {
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content }
    ],
    retrievedIds
  };
}

export function buildFreeformMessages({ query, problem, language }) {
  const q = (query || "").trim();
  if (isPureGreeting(q)) {
    return {
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: query }
      ],
      retrievedIds: []
    };
  }
  const userBody = `${query}\n\nCurrent problem on page:\n${problem?.slice(0, 4000) || "(none)"}\n\nPreferred language: ${language || "unspecified"}.`;
  if (!needsRetrieval(q)) {
    return {
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userBody }
      ],
      retrievedIds: []
    };
  }
  const { content, retrievedIds } = attachReference(userBody, (problem || "") + " " + query, { tier: 5 });
  return {
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content }
    ],
    retrievedIds
  };
}
