(function () {
  function textOf(el) {
    return (el?.innerText || el?.textContent || "").trim();
  }

  function firstMatch(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && textOf(el)) return el;
    }
    return null;
  }

  const scrapers = {
    "leetcode.com": scrapeLeetCode,
    "leetcode.cn": scrapeLeetCode,
    "codeforces.com": scrapeCodeforces,
    "www.hackerrank.com": scrapeHackerRank,
    "atcoder.jp": scrapeAtCoder,
    "www.codechef.com": scrapeCodeChef
  };

  function scrapeLeetCode() {
    const title = textOf(
      firstMatch([
        'a[href*="/problems/"][class*="title"]',
        'div[class*="text-title-large"]',
        'div[data-cy="question-title"]',
        "h1"
      ])
    );
    const description = textOf(
      firstMatch([
        'div[data-track-load="description_content"]',
        'div[class*="question-content"]',
        'div[class*="content__u3I1"]',
        'div[class*="_1l1MA"]',
        'div[data-key="description-content"]'
      ])
    );
    const difficulty = textOf(
      firstMatch([
        'div[diff]',
        'div[class*="difficulty-label"]',
        'div[class*="text-difficulty"]'
      ])
    );
    const tags = Array.from(
      document.querySelectorAll('a[href*="/tag/"], div[class*="topic-tag"]')
    )
      .map((el) => textOf(el))
      .filter(Boolean)
      .slice(0, 20);
    const code = textOf(document.querySelector(".monaco-editor .view-lines"));
    return combine({ site: "LeetCode", title, difficulty, tags, description, code });
  }

  function scrapeCodeforces() {
    const title = textOf(firstMatch([".problem-statement .title", ".title"]));
    const timeLimit = textOf(firstMatch([".time-limit"]));
    const memoryLimit = textOf(firstMatch([".memory-limit"]));
    const statement = textOf(firstMatch([".problem-statement"]));
    const input = textOf(firstMatch([".input-specification"]));
    const output = textOf(firstMatch([".output-specification"]));
    const samples = Array.from(document.querySelectorAll(".sample-test .input, .sample-test .output"))
      .map((el) => textOf(el))
      .join("\n---\n");
    return combine({
      site: "Codeforces",
      title,
      description: [statement, input, output, samples, timeLimit, memoryLimit]
        .filter(Boolean)
        .join("\n\n")
    });
  }

  function scrapeHackerRank() {
    const title = textOf(firstMatch(["h1.ui-icon-label", "h1", ".challenge-page-label"]));
    const description = textOf(
      firstMatch([".challenge_problem_statement", ".challenge-body-html", ".hackdown-content"])
    );
    return combine({ site: "HackerRank", title, description });
  }

  function scrapeAtCoder() {
    const title = textOf(firstMatch([".h2", "span.h2", "h1"]));
    const description = textOf(firstMatch(["#task-statement", ".lang-en", ".part"]));
    return combine({ site: "AtCoder", title, description });
  }

  function scrapeCodeChef() {
    const title = textOf(firstMatch(["h1", ".problem-title"]));
    const description = textOf(firstMatch(["#problem-statement", ".problem-statement"]));
    return combine({ site: "CodeChef", title, description });
  }

  function combine({ site, title, difficulty, tags, description, code }) {
    const parts = [
      site && `Site: ${site}`,
      title && `Title: ${title}`,
      difficulty && `Difficulty: ${difficulty}`,
      tags && tags.length ? `Tags: ${tags.join(", ")}` : "",
      description && `\nStatement:\n${description}`,
      code && `\nCurrent editor content:\n${code}`
    ].filter(Boolean);
    return {
      site: site || "Unknown",
      title: title || "",
      raw: parts.join("\n"),
      url: location.href
    };
  }

  function fallbackScrape() {
    const main = document.querySelector("main, article, #content, [role=main]") || document.body;
    return {
      site: "Unknown",
      title: document.title,
      raw: `Title: ${document.title}\nURL: ${location.href}\n\n${textOf(main).slice(0, 8000)}`,
      url: location.href
    };
  }

  window.__leethelpScrape = function scrape() {
    const host = location.hostname;
    const fn = scrapers[host];
    try {
      const result = fn ? fn() : fallbackScrape();
      if (!result.raw || result.raw.length < 40) return fallbackScrape();
      return result;
    } catch (e) {
      return { ...fallbackScrape(), error: String(e) };
    }
  };
})();
