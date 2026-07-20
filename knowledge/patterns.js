
export const PATTERNS = [
  {
    id: "two-pointers",
    title: "Two Pointers",
    tags: ["array", "string", "two-pointer", "sorted", "in-place", "pair-sum", "palindrome"],
    when: "Sorted array; find a pair/triplet meeting a target; partitioning; palindrome checks.",
    idea: "Left and right pointers converge based on the invariant. Each step is O(1); total O(n).",
    watch: ["Skip duplicates for k-sum problems", "Update pointers strictly to avoid infinite loops"]
  },
  {
    id: "sliding-window-fixed",
    title: "Sliding Window (Fixed Size)",
    tags: ["array", "string", "sliding-window", "subarray", "fixed-window"],
    when: "Aggregate over every contiguous subarray of length exactly k.",
    idea: "Compute sum for first window in O(k); then slide by adding new right, removing old left. Total O(n).",
    watch: ["Handle k > n as empty", "Careful with average vs sum precision"]
  },
  {
    id: "sliding-window-variable",
    title: "Sliding Window (Variable Size)",
    tags: ["array", "string", "sliding-window", "subarray", "longest", "shortest", "at-most-k", "distinct"],
    when: "Shortest/longest contiguous subarray/substring satisfying a monotonic condition.",
    idea: "l ≤ r pointers. Expand r; while invariant broken, shrink l. Update answer at each valid state. Amortized O(n).",
    watch: [
      "Use 'while' (not 'if') when shrinking",
      "For 'exactly k' distinct, use atMost(k) - atMost(k-1)",
      "Track counts with a hash map; decrement to 0 counts as 'removed'"
    ]
  },
  {
    id: "monotonic-deque",
    title: "Monotonic Deque (Sliding Window Max/Min)",
    tags: ["deque", "sliding-window", "monotonic", "max", "min", "range"],
    when: "Maximum or minimum over every sliding window of size k in O(n).",
    idea: "Deque of indices; drop stale (out of window) from front; drop dominated from back before push.",
    watch: ["Store indices, not values, to know when they expire", "Front of deque is always the answer for the current window"]
  },
  {
    id: "prefix-sum",
    title: "Prefix Sum",
    tags: ["prefix-sum", "range-sum", "array", "immutable", "subarray"],
    when: "Repeated range-sum queries on an immutable array; count subarrays with sum k.",
    idea: "P[i] = a[0]+…+a[i-1]. Range sum(l,r) = P[r+1] - P[l]. Count subarrays via hash of prefix frequencies.",
    watch: ["Off-by-one in P indexing", "Include prefix 0 (empty) when counting subarrays summing to k"]
  },
  {
    id: "prefix-sum-2d",
    title: "2D Prefix Sum",
    tags: ["prefix-sum", "2d", "matrix", "range-sum", "immutable"],
    when: "O(1) rectangle sum queries on an immutable matrix.",
    idea: "P[i][j] = sum over [0..i-1] × [0..j-1]. Inclusion-exclusion: sum(r1,c1,r2,c2) = P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]."
  },
  {
    id: "difference-array",
    title: "Difference Array (Range Update)",
    tags: ["difference-array", "range-update", "array", "offline"],
    when: "Many range +delta updates then read final array once.",
    idea: "diff[l] += delta; diff[r+1] -= delta. Final array = prefix sum of diff. O(n + updates).",
    watch: ["r+1 might exceed bounds, use n+1 sized diff"]
  },
  {
    id: "kadane",
    title: "Kadane's Algorithm",
    tags: ["dp", "array", "maximum-subarray", "kadane", "contiguous"],
    when: "Maximum sum contiguous subarray in O(n).",
    idea: "cur = max(a[i], cur + a[i]); best = max(best, cur). Start cur = a[0].",
    watch: ["All-negative arrays: return the max element", "For circular arrays, take max(kadane, total - kadaneMin), with all-negative guard"]
  },
  {
    id: "dutch-flag",
    title: "Dutch National Flag (3-Way Partition)",
    tags: ["array", "partition", "sort", "three-way", "in-place"],
    when: "Sort or partition an array with 3 categories in one pass, O(1) extra space.",
    idea: "Three pointers lo, mid, hi. If a[mid]=low: swap(lo, mid); lo++; mid++. If =mid: mid++. If =high: swap(mid, hi); hi--."
  },
  {
    id: "cyclic-sort",
    title: "Cyclic Sort",
    tags: ["array", "cyclic-sort", "missing-number", "duplicate", "1-to-n"],
    when: "Array contains numbers from 1..n or 0..n-1; find missing/duplicate in O(n) time and O(1) space.",
    idea: "For each i, while a[i] is out of place, swap to correct position. Then scan for mismatches."
  },
  {
    id: "boyer-moore",
    title: "Boyer-Moore Majority Vote",
    tags: ["array", "majority", "voting", "streaming"],
    when: "Find element appearing > n/2 times in O(n) time, O(1) space (or > n/3, using 2 candidates).",
    idea: "Maintain candidate + count. If count 0, adopt new candidate. Match → count++, else count--. Verify with a second pass."
  },
  {
    id: "meet-in-the-middle",
    title: "Meet in the Middle",
    tags: ["subset", "brute-force", "meet-in-the-middle", "combinatorial", "n=40"],
    when: "Enumerate 2^n subsets but n≈40 is too much; split into halves.",
    idea: "Enumerate 2^(n/2) sums for each half; sort one; binary-search complements. O(2^(n/2) · n)."
  },
  {
    id: "binary-search",
    title: "Binary Search (Classic)",
    tags: ["binary-search", "sorted", "search"],
    when: "Find a target (or lower/upper bound) in a sorted array in O(log n).",
    idea: "lo, hi = 0, n. While lo < hi: mid = (lo+hi)//2; if a[mid] < target: lo = mid+1 else hi = mid. lo is the lower_bound.",
    watch: ["Half-open [lo, hi) avoids off-by-one", "Use mid = lo + (hi-lo)//2 to avoid overflow in C++/Java"]
  },
  {
    id: "binary-search-on-answer",
    title: "Binary Search on the Answer",
    tags: ["binary-search", "answer", "parametric", "monotonic", "predicate", "feasibility"],
    when: "Answer lies in [lo, hi] and 'can we achieve X?' is a monotonic yes/no predicate.",
    idea: "Binary search on X; check feasibility in O(n) or better. Total O(n log range). Classic examples: Aggressive Cows, Split Array Largest Sum, Koko Bananas.",
    watch: ["Confirm monotonicity before applying", "Careful with real-valued binary search, bound iterations (e.g., 100) instead of epsilon"]
  },
  {
    id: "binary-search-rotated",
    title: "Binary Search in Rotated Sorted Array",
    tags: ["binary-search", "rotated-array", "sorted"],
    when: "Find target in a rotated sorted array (with or without duplicates) in O(log n).",
    idea: "One half of [lo, mid] and [mid, hi] is always sorted. Detect which, then check if target lies in it; recurse.",
    watch: ["Duplicates: lo++, hi-- when a[lo]==a[mid]==a[hi], worst case O(n)"]
  },
  {
    id: "peak-element",
    title: "Peak Element (Binary Search on Slope)",
    tags: ["binary-search", "peak", "unsorted"],
    when: "Any element strictly greater than its neighbors (guaranteed to exist for bounded arrays).",
    idea: "If a[mid] < a[mid+1], peak lies right; else left. O(log n)."
  },
  {
    id: "monotonic-stack",
    title: "Monotonic Stack",
    tags: ["stack", "monotonic", "next-greater", "next-smaller", "histogram", "array"],
    when: "Next greater / smaller element; largest rectangle in histogram; trapping rain water; stock span.",
    idea: "Stack keeps indices with values in strict monotonic order. On each push, pop while violating monotonicity, each pop resolves an answer.",
    watch: ["Whether comparison is strict or non-strict decides duplicates handling", "Use sentinels (0 or ∞) to force final pops"]
  },
  {
    id: "min-stack",
    title: "Min Stack (or Max Stack)",
    tags: ["stack", "min", "max", "design"],
    when: "Support push, pop, top, and getMin in O(1).",
    idea: "Auxiliary stack storing the running min at each level; push new min iff <= current min; pop in lockstep."
  },
  {
    id: "expression-eval",
    title: "Expression Evaluation (Shunting Yard / Two Stacks)",
    tags: ["stack", "expression", "parser", "infix", "postfix", "operator-precedence"],
    when: "Evaluate infix arithmetic with parentheses and precedence.",
    idea: "One stack for values, one for operators. On operator: while top has ≥ precedence, apply. On ')': apply until '('."
  },
  {
    id: "fast-slow-pointer",
    title: "Fast & Slow Pointers (Floyd's)",
    tags: ["linked-list", "cycle", "floyd", "tortoise-hare", "middle"],
    when: "Cycle detection, cycle start, middle of list, palindrome list.",
    idea: "slow steps 1, fast steps 2. They meet inside a cycle. Reset one to head and step 1 each, they meet at cycle start.",
    watch: ["Middle: for even length, decide 'first middle' vs 'second middle' by loop condition"]
  },
  {
    id: "reverse-linked-list",
    title: "Reverse a Linked List (Iterative)",
    tags: ["linked-list", "reverse", "iterative"],
    when: "Reverse whole list or a sublist [l, r] in O(n) time, O(1) space.",
    idea: "prev = null, cur = head. While cur: nxt = cur.next; cur.next = prev; prev = cur; cur = nxt."
  },
  {
    id: "tree-traversal",
    title: "Tree Traversals (DFS / BFS)",
    tags: ["tree", "binary-tree", "dfs", "bfs", "preorder", "inorder", "postorder", "level-order"],
    when: "Any tree walk; serialize; construct from traversals.",
    idea: "Recursive DFS or explicit stack; BFS with a queue for level-order.",
    watch: ["Inorder of a BST is sorted", "Preorder + Inorder (or Postorder + Inorder) uniquely determines a tree with distinct keys"]
  },
  {
    id: "tree-dp",
    title: "Tree DP",
    tags: ["tree", "dp", "postorder", "rerooting", "subtree"],
    when: "Optimize over subtrees / paths (e.g., diameter, max path sum, robber).",
    idea: "Post-order DFS returns aggregated child answers. For 'answer at every node', use rerooting DP (2 DFS passes).",
    watch: ["Avoid recomputing across subtrees; combine at parent"]
  },
  {
    id: "lca-binary-lifting",
    title: "LCA via Binary Lifting",
    tags: ["tree", "lca", "binary-lifting", "sparse-table", "ancestor"],
    when: "Repeated LCA queries on a static tree.",
    idea: "Precompute up[k][v] = 2^k-th ancestor in O(n log n). Answer LCA(u, v) by lifting to same depth then jumping in log n.",
    watch: ["Also useful for kth-ancestor and path aggregates"]
  },
  {
    id: "trie",
    title: "Trie (Prefix Tree)",
    tags: ["trie", "string", "prefix", "dictionary", "xor"],
    when: "Prefix queries, autocomplete, wordsearch, XOR max pair (bit trie).",
    idea: "Node has 26 children (or bit branch); insert/search in O(L). For XOR max pair, insert bits MSB→LSB."
  },
  {
    id: "segment-tree",
    title: "Segment Tree (Point Update, Range Query)",
    tags: ["segment-tree", "range-query", "point-update", "range-sum", "range-min", "range-max"],
    when: "Point updates + range associative queries (sum, min, max, gcd) in O(log n).",
    idea: "Recursive: tree of size 4n; combine children in O(1). Iterative variant is faster in practice."
  },
  {
    id: "segment-tree-lazy",
    title: "Segment Tree with Lazy Propagation",
    tags: ["segment-tree", "lazy-propagation", "range-update", "range-query"],
    when: "Range updates + range queries (e.g., range add + range sum).",
    idea: "Push pending 'lazy' updates down before descending. Track lazy tag per node; apply on pull-up."
  },
  {
    id: "fenwick",
    title: "Fenwick Tree (BIT)",
    tags: ["bit", "fenwick", "prefix-sum", "point-update", "range-sum"],
    when: "Point updates + prefix/range sum; simpler code than segment tree.",
    idea: "1-indexed. update(i, delta): while i≤n: b[i]+=delta; i += i&-i. query(i): while i>0: sum+=b[i]; i -= i&-i.",
    watch: ["Range add + point query: use difference array + BIT", "2D BIT extends naturally"]
  },
  {
    id: "sparse-table",
    title: "Sparse Table (Idempotent RMQ)",
    tags: ["sparse-table", "rmq", "range-min", "range-max", "static", "gcd"],
    when: "Static array, many idempotent range queries (min/max/gcd) in O(1) after O(n log n) preprocessing.",
    idea: "st[k][i] = op over a[i..i+2^k-1]. Query [l, r]: k = log2(r-l+1); op(st[k][l], st[k][r-2^k+1])."
  },
  {
    id: "bfs",
    title: "BFS on Unweighted Graph",
    tags: ["graph", "bfs", "shortest-path", "unweighted", "grid"],
    when: "Shortest path in edges (unweighted). Level-by-level expansion.",
    idea: "Queue; mark visited on enqueue (not dequeue) to avoid duplicates.",
    watch: ["Grids: use directions array; mark visited when adding to queue", "Multi-source BFS: seed all sources into queue with dist 0"]
  },
  {
    id: "dfs-graph",
    title: "DFS on Graph",
    tags: ["graph", "dfs", "connectivity", "recursion", "iterative"],
    when: "Connectivity, cycle detection, topological order, bridges/articulation, SCC.",
    idea: "Recursive DFS with visited set. For iterative, use a stack of (node, iterator) pairs.",
    watch: ["Watch recursion depth on deep graphs, convert to iterative", "For directed cycle: 3-state colouring (white/grey/black)"]
  },
  {
    id: "topological-sort",
    title: "Topological Sort (Kahn's)",
    tags: ["graph", "dag", "topological-sort", "kahn", "indegree", "ordering"],
    when: "Linear ordering of DAG vertices respecting edges (course schedule, build order).",
    idea: "Repeatedly emit nodes with indegree 0. Detect cycle if emitted < n.",
    watch: ["DFS variant: post-order reversal, equivalent"]
  },
  {
    id: "union-find",
    title: "Union-Find (DSU)",
    tags: ["union-find", "dsu", "disjoint-set", "path-compression", "union-by-rank", "connectivity"],
    when: "Dynamic connectivity, Kruskal's MST, offline queries, cycle detection in undirected graphs.",
    idea: "parent[i] with path compression; union by rank/size. Amortized α(n) per op.",
    watch: ["Rollback DSU (no PC) needed for offline dynamic disconnect problems"]
  },
  {
    id: "dijkstra",
    title: "Dijkstra's Algorithm",
    tags: ["graph", "dijkstra", "shortest-path", "weighted", "non-negative", "heap"],
    when: "Single-source shortest paths with non-negative weights.",
    idea: "Min-heap of (dist, node). Skip if popped dist > dist[u]. Relax each edge once per improvement. O((V+E) log V).",
    watch: ["Do NOT use with negative weights, use Bellman-Ford", "For unit weights, plain BFS is faster"]
  },
  {
    id: "bellman-ford",
    title: "Bellman-Ford",
    tags: ["graph", "bellman-ford", "shortest-path", "negative-weight", "negative-cycle"],
    when: "SSSP with negative weights; detect negative cycles.",
    idea: "Relax all E edges V-1 times. One extra pass, if any relaxation still succeeds, negative cycle exists. O(VE)."
  },
  {
    id: "floyd-warshall",
    title: "Floyd–Warshall",
    tags: ["graph", "floyd-warshall", "all-pairs", "shortest-path", "transitive-closure"],
    when: "All-pairs shortest paths on small graphs (V ≤ ~400).",
    idea: "Triple loop k, i, j: d[i][j] = min(d[i][j], d[i][k] + d[k][j]). O(V^3)."
  },
  {
    id: "01-bfs",
    title: "0-1 BFS",
    tags: ["graph", "0-1-bfs", "deque", "shortest-path", "weighted"],
    when: "SSSP where edge weights are only 0 or 1.",
    idea: "Deque instead of heap: push_front for weight-0 relaxations, push_back for weight-1. O(V+E)."
  },
  {
    id: "kruskal",
    title: "Kruskal's MST",
    tags: ["graph", "mst", "kruskal", "union-find", "greedy"],
    when: "Minimum spanning tree on sparse graphs.",
    idea: "Sort edges by weight; greedily add if endpoints in different DSU sets. O(E log E)."
  },
  {
    id: "prim",
    title: "Prim's MST",
    tags: ["graph", "mst", "prim", "heap", "greedy"],
    when: "MST on dense graphs (with heap).",
    idea: "Grow tree from any vertex; heap of crossing edges."
  },
  {
    id: "scc-tarjan",
    title: "Strongly Connected Components (Tarjan)",
    tags: ["graph", "scc", "tarjan", "dfs", "lowlink", "directed"],
    when: "Decompose directed graph into SCCs; solve 2-SAT.",
    idea: "One DFS, lowlink values, explicit stack; pop stack once low[u]==disc[u]."
  },
  {
    id: "bridges-articulation",
    title: "Bridges & Articulation Points (Tarjan)",
    tags: ["graph", "bridge", "articulation-point", "tarjan", "dfs", "lowlink"],
    when: "Find critical edges/vertices whose removal disconnects an undirected graph.",
    idea: "DFS tree, disc/low arrays. Edge (u,v) is a bridge iff low[v] > disc[u]. u is an articulation point iff has child v with low[v] ≥ disc[u] (root special-cases on 2+ children)."
  },
  {
    id: "eulerian-path",
    title: "Eulerian Path/Circuit (Hierholzer)",
    tags: ["graph", "euler", "hierholzer", "traversal", "degrees"],
    when: "Traverse every edge exactly once.",
    idea: "Circuit exists iff all degrees even (undirected) or all in==out (directed). Hierholzer builds tour in O(E)."
  },
  {
    id: "bipartite-check",
    title: "Bipartite Check (2-coloring)",
    tags: ["graph", "bipartite", "2-color", "bfs", "dfs"],
    when: "Decide if graph is 2-colorable; matching setups.",
    idea: "BFS/DFS assign alternating colors; failure on same-color edge → not bipartite."
  },
  {
    id: "max-flow-dinic",
    title: "Max Flow (Dinic's)",
    tags: ["graph", "max-flow", "dinic", "network-flow", "bipartite-matching"],
    when: "Max flow / min cut / bipartite matching / assignment reductions.",
    idea: "Repeat: build level graph with BFS; augment by blocking flow via DFS. O(V^2 E). Unit-capacity graphs: O(E√V)."
  },
  {
    id: "dp-knapsack-01",
    title: "0/1 Knapsack",
    tags: ["dp", "knapsack", "0-1", "subset-sum"],
    when: "Choose subset with weight ≤ W maximizing value.",
    idea: "dp[i][w] = best value using first i items with capacity w. Compress to 1D: iterate w from W down to weight[i]."
  },
  {
    id: "dp-unbounded-knapsack",
    title: "Unbounded Knapsack / Coin Change (min coins, count ways)",
    tags: ["dp", "knapsack", "unbounded", "coin-change", "counting"],
    when: "Unlimited copies; min ways / count ways to reach a target.",
    idea: "1D dp with inner loop over coins. Count ways: outer loop coins, inner loop amounts, order matters to avoid duplicates."
  },
  {
    id: "lis",
    title: "Longest Increasing Subsequence, O(n log n)",
    tags: ["dp", "lis", "patience-sort", "binary-search"],
    when: "Longest strictly increasing subsequence.",
    idea: "Maintain 'tails': for each x, replace tails[bisect_left(tails, x)] = x. Answer = len(tails).",
    watch: ["Non-strict: bisect_right instead of bisect_left"]
  },
  {
    id: "lcs",
    title: "Longest Common Subsequence",
    tags: ["dp", "lcs", "strings", "2d-dp"],
    when: "Compare two sequences by preserved order (diff, edit-adjacent).",
    idea: "dp[i][j] = LCS of a[:i], b[:j]. Match: 1 + dp[i-1][j-1]. Else max(dp[i-1][j], dp[i][j-1]). O(nm)."
  },
  {
    id: "edit-distance",
    title: "Edit Distance (Levenshtein)",
    tags: ["dp", "edit-distance", "levenshtein", "strings", "2d-dp"],
    when: "Minimum insert/delete/replace ops to transform a→b.",
    idea: "dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + (a[i-1]≠b[j-1]). O(nm)."
  },
  {
    id: "interval-dp",
    title: "Interval DP",
    tags: ["dp", "interval-dp", "matrix-chain", "burst-balloons", "range"],
    when: "Optimize over subranges (matrix chain, palindrome partition, burst balloons).",
    idea: "Iterate range lengths ascending; dp[l][r] = best split at some k in (l, r)."
  },
  {
    id: "bitmask-dp",
    title: "Bitmask DP",
    tags: ["dp", "bitmask", "subset", "tsp", "assignment"],
    when: "Small n (~20); DP over subsets, assignment, TSP, count Hamiltonian paths.",
    idea: "dp[mask][i] = best when 'mask' is used and last picked is i. O(2^n · n^2) for TSP."
  },
  {
    id: "digit-dp",
    title: "Digit DP",
    tags: ["dp", "digit-dp", "counting", "number-theory"],
    when: "Count numbers in [L, R] satisfying digit constraints (e.g., digit sum, no consecutive 5s).",
    idea: "dp(pos, tight, started, extra state). Memoize on (pos, extra state) only when tight=False and started=True."
  },
  {
    id: "sos-dp",
    title: "SOS DP (Sum Over Subsets)",
    tags: ["dp", "sos", "bitmask", "subset-sum", "subset-convolution"],
    when: "For each mask, aggregate over all submasks, in O(2^n · n).",
    idea: "For each bit i: for each mask: if mask & (1<<i): f[mask] += f[mask ^ (1<<i)]."
  },
  {
    id: "matrix-exponentiation",
    title: "Matrix Exponentiation",
    tags: ["dp", "matrix-exponentiation", "linear-recurrence", "fast-power"],
    when: "Linear recurrence over huge indices (e.g., Fibonacci mod p at n=1e18).",
    idea: "Encode transition as matrix M; result = M^k applied to initial vector; fast exponentiation in O(d^3 log k)."
  },
  {
    id: "kmp",
    title: "KMP (Knuth–Morris–Pratt)",
    tags: ["string", "kmp", "pattern-matching", "failure-function", "prefix-function"],
    when: "Find all occurrences of P in T in O(n+m); count distinct occurrences; period detection.",
    idea: "Prefix function π[i] = longest proper prefix of P[:i+1] that is also suffix. Use it to avoid re-comparisons."
  },
  {
    id: "z-function",
    title: "Z-function",
    tags: ["string", "z-function", "pattern-matching"],
    when: "Alternative to KMP; z[i] = longest substring starting at i that matches prefix.",
    idea: "Maintain a [l, r] window of the rightmost match with prefix; extend or reset."
  },
  {
    id: "rolling-hash",
    title: "Rolling Hash (Rabin–Karp)",
    tags: ["string", "hashing", "rolling-hash", "rabin-karp", "duplicate-substring"],
    when: "Substring comparison, duplicate substring, palindrome families.",
    idea: "h(s) = Σ s[i]·b^i mod p. Use double hashing (two (b, p) pairs) to reduce collisions."
  },
  {
    id: "manacher",
    title: "Manacher's Algorithm",
    tags: ["string", "manacher", "palindrome", "longest-palindromic-substring"],
    when: "Longest palindromic substring / count palindromic substrings in O(n).",
    idea: "Transform s → #a#b#… to unify odd/even. Maintain centre c and right r; reuse mirror i' = 2c - i."
  },
  {
    id: "sieve",
    title: "Sieve of Eratosthenes",
    tags: ["math", "sieve", "primes", "number-theory"],
    when: "All primes up to n; smallest prime factor for factorization.",
    idea: "Mark multiples starting from p^2. Linear sieve variant computes SPF in O(n)."
  },
  {
    id: "modular-exponentiation",
    title: "Modular Exponentiation",
    tags: ["math", "modular", "power", "fast-exponentiation"],
    when: "Compute a^b mod m for huge b in O(log b).",
    idea: "while b: if b&1: r = r*a % m; a = a*a % m; b >>= 1."
  },
  {
    id: "modular-inverse",
    title: "Modular Inverse",
    tags: ["math", "modular", "inverse", "fermat", "extended-euclidean"],
    when: "Divide under a prime modulus.",
    idea: "Prime p: a^(p-2) mod p (Fermat). General: extended Euclidean for gcd(a, m) = 1."
  },
  {
    id: "combinatorics",
    title: "Combinatorics Basics",
    tags: ["math", "combinatorics", "binomial", "nCr", "stars-and-bars", "inclusion-exclusion"],
    when: "Count arrangements, partitions, distributions under constraints.",
    idea: "Precompute factorials + inverse factorials mod p; nCr = fact[n] * inv_fact[r] * inv_fact[n-r]. Stars and Bars for identical items; PIE for 'at least one'."
  },
  {
    id: "convex-hull",
    title: "Convex Hull (Andrew's Monotone Chain)",
    tags: ["geometry", "convex-hull", "andrew", "cross-product", "sweep"],
    when: "Compute convex hull of n points in O(n log n).",
    idea: "Sort by (x, y). Build lower then upper hull; each step keeps left-turns via cross product."
  },
  {
    id: "sweep-line",
    title: "Sweep Line",
    tags: ["geometry", "sweep-line", "interval", "segments", "events"],
    when: "Segment intersection, interval union, closest pair, area of rectangles union.",
    idea: "Sort events by x; maintain active set (sorted by y) through insert/delete/query."
  },
  {
    id: "interval-scheduling",
    title: "Interval Scheduling (Earliest Deadline)",
    tags: ["greedy", "intervals", "scheduling", "sort"],
    when: "Maximum non-overlapping intervals; minimum arrows to burst; meeting rooms.",
    idea: "Sort by end time (or start time for merging). Greedily accept next compatible interval."
  },
  {
    id: "huffman",
    title: "Huffman Coding",
    tags: ["greedy", "huffman", "compression", "priority-queue"],
    when: "Optimal prefix-code compression / minimum weighted external path length.",
    idea: "Priority queue of weights. Repeatedly merge two smallest; sum accumulates."
  },
  {
    id: "backtracking",
    title: "Backtracking Skeleton",
    tags: ["backtracking", "recursion", "permutation", "combination", "subset", "n-queens", "sudoku"],
    when: "Enumerate/decide over combinatorial search spaces with pruning.",
    idea: "Choose → recurse → un-choose. Prune early using constraints; sort input for lexicographic order or duplicate skipping."
  },
  {
    id: "bitwise-tricks",
    title: "Bit Manipulation Tricks",
    tags: ["bit", "bitwise", "lowbit", "popcount", "gray-code"],
    when: "Set bits, subsets, parity, XOR-based tricks.",
    idea: "x & -x isolates lowest set bit; x & (x-1) clears it; iterate submasks via s = (s-1) & mask. Use popcount for cardinality."
  },
  {
    id: "xor-basis",
    title: "Linear Basis over GF(2) (XOR Basis)",
    tags: ["bit", "xor", "basis", "linear-algebra", "subset-xor"],
    when: "Max XOR of subset; count distinct XOR values.",
    idea: "Insert numbers into a basis via Gaussian elimination MSB→LSB; greedy query takes max XOR by trying each basis vector."
  },
  {
    id: "reservoir-sampling",
    title: "Reservoir Sampling",
    tags: ["random", "streaming", "sampling"],
    when: "Uniform sample of k items from an unknown-length stream.",
    idea: "Keep first k; for i-th arrival (i > k), replace a random slot with probability k/i."
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    tags: ["design", "cache", "hashmap", "doubly-linked-list"],
    when: "O(1) get / put with least-recently-used eviction.",
    idea: "HashMap key → node in doubly-linked list. On access, move node to head; on evict, remove tail."
  },
  {
    id: "hopcroft-karp",
    title: "Hopcroft–Karp (Bipartite Matching)",
    tags: ["graph", "bipartite", "matching", "hopcroft-karp", "flow"],
    when: "Maximum matching in a bipartite graph in O(E√V).",
    idea: "BFS builds layered graph of shortest augmenting paths; DFS augments multiple disjoint paths per phase."
  },
  {
    id: "hungarian",
    title: "Hungarian Algorithm (Assignment Problem)",
    tags: ["graph", "assignment", "hungarian", "min-cost", "matching"],
    when: "Minimum-cost perfect matching in a bipartite graph with square cost matrix.",
    idea: "Maintain potentials for rows/cols so reduced costs ≥ 0; grow alternating tree; update slacks. O(n^3)."
  },
  {
    id: "min-cost-max-flow",
    title: "Min-Cost Max Flow",
    tags: ["graph", "flow", "min-cost", "spfa", "dijkstra", "potentials"],
    when: "Maximize flow while minimizing total cost (assignment, transportation, matching with weights).",
    idea: "Repeatedly find shortest-cost augmenting path (SPFA or Dijkstra with Johnson potentials) and push flow along it."
  },
  {
    id: "2-sat",
    title: "2-SAT",
    tags: ["graph", "2-sat", "scc", "boolean", "implication"],
    when: "Boolean satisfiability with clauses of size 2 in O(N + M).",
    idea: "Build implication graph (a ∨ b becomes ¬a → b and ¬b → a). Feasible iff no variable and its negation are in the same SCC (Tarjan/Kosaraju)."
  },
  {
    id: "heavy-light-decomposition",
    title: "Heavy-Light Decomposition (HLD)",
    tags: ["tree", "hld", "path-query", "segment-tree", "lca"],
    when: "Path/subtree updates and queries on a tree in O(log^2 n).",
    idea: "Split each vertex's edge to its 'heavy' (largest subtree) child. Path root→v crosses at most O(log n) light edges; concatenate O(log n) contiguous chain segments and use a segment tree over the linearization."
  },
  {
    id: "centroid-decomposition",
    title: "Centroid Decomposition",
    tags: ["tree", "centroid", "divide-conquer", "path-count"],
    when: "Answer path-based queries by dividing the tree at centroids (paths counting by length, k-th ancestor across all pairs).",
    idea: "Recursively remove the centroid; each path passes through exactly one centroid at some level. Depth ≤ log n."
  },
  {
    id: "small-to-large",
    title: "Small-to-Large Merging (DSU on Tree)",
    tags: ["tree", "small-to-large", "dsu-on-tree", "offline", "subtree"],
    when: "Aggregate subtree information (distinct colors, mode, frequency) for every node in O(n log n).",
    idea: "Keep the heavy child's data; recompute light children and merge into it. Each element is re-added O(log n) times."
  },
  {
    id: "arborescence",
    title: "Chu–Liu / Edmonds (Min Arborescence)",
    tags: ["graph", "arborescence", "directed-mst", "chu-liu", "edmonds"],
    when: "Minimum-cost spanning arborescence in a directed graph rooted at r.",
    idea: "Pick each vertex's min in-edge; contract cycles; recurse. O(VE) simple, O(E + V log V) with Tarjan's."
  },
  {
    id: "offline-dsu-rollback",
    title: "DSU with Rollback (Offline Dynamic Connectivity)",
    tags: ["union-find", "rollback", "offline", "segment-tree-time", "dynamic-connectivity"],
    when: "Answer connectivity queries with edge additions AND deletions offline.",
    idea: "Segment tree over the timeline; each edge lives on an interval; DFS the segtree using DSU with union-by-rank (no path compression) so rollbacks are O(1)."
  },
  {
    id: "suffix-array",
    title: "Suffix Array + LCP",
    tags: ["string", "suffix-array", "sa", "lcp", "kasai"],
    when: "Substring queries, distinct substrings count, longest common substring across strings.",
    idea: "Sort all suffixes in O(n log n) via doubling (or SA-IS in O(n)). Kasai's algorithm computes LCP array in O(n)."
  },
  {
    id: "suffix-automaton",
    title: "Suffix Automaton",
    tags: ["string", "suffix-automaton", "sam", "substring", "distinct-substrings"],
    when: "Count/enumerate substrings, longest common substring, k-th smallest substring, matching.",
    idea: "Minimal DFA accepting every suffix. Online construction in O(n · |Σ|); path count from initial state = distinct substrings."
  },
  {
    id: "aho-corasick",
    title: "Aho–Corasick (Multi-Pattern Matching)",
    tags: ["string", "aho-corasick", "trie", "multi-pattern", "failure-links"],
    when: "Find all occurrences of many patterns in a text simultaneously in O(n + m + occ).",
    idea: "Build a trie of patterns; compute failure links (like KMP over the trie) via BFS; walk the text following goto/fail edges."
  },
  {
    id: "eertree",
    title: "Palindromic Tree (Eertree)",
    tags: ["string", "eertree", "palindromic-tree", "palindrome", "distinct-palindromes"],
    when: "Count/enumerate distinct palindromic substrings; longest palindromic factor at each position.",
    idea: "Two roots (imag length −1 and 0). Extend by suffix palindrome and follow suffix links. O(n · |Σ|)."
  },
  {
    id: "min-rotation-booth",
    title: "Booth's Algorithm (Least Cyclic Rotation)",
    tags: ["string", "booth", "min-rotation", "lyndon", "cyclic"],
    when: "Lexicographically smallest rotation of a string in O(n).",
    idea: "Failure-function-style scan on s+s, tracking a candidate rotation index."
  },
  {
    id: "cht-li-chao",
    title: "Convex Hull Trick / Li Chao Tree",
    tags: ["dp", "cht", "li-chao", "line-container", "min-of-lines"],
    when: "DP recurrences of the form dp[i] = min_j(m_j · x_i + b_j), evaluate min-of-lines at points.",
    idea: "Maintain envelope of lines. If x's are sorted, use monotonic deque O(1) amortized. Otherwise Li Chao tree in O(log V) per op."
  },
  {
    id: "dnc-opt",
    title: "Divide-and-Conquer DP Optimization",
    tags: ["dp", "divide-and-conquer", "opt(i)-monotone", "quadrangle"],
    when: "dp[i][j] = min_{k < j}(dp[i-1][k] + cost(k, j)) where opt(j) is monotonic in j.",
    idea: "Recursively split range and use opt bounds; O(n log n) per layer instead of O(n^2)."
  },
  {
    id: "knuth-opt",
    title: "Knuth's Optimization",
    tags: ["dp", "knuth", "interval-dp", "quadrangle-inequality"],
    when: "Interval DP dp[l][r] = min_{l ≤ k < r}(...) satisfying opt[l][r-1] ≤ opt[l][r] ≤ opt[l+1][r].",
    idea: "Limit inner k loop using opt bounds; reduces O(n^3) to O(n^2)."
  },
  {
    id: "aliens-trick",
    title: "Aliens Trick (Lambda / Wqs Binary Search)",
    tags: ["dp", "aliens-trick", "lambda", "wqs", "binary-search", "convex"],
    when: "Constrained DP 'pick exactly k items' with convex cost in k. Turn constraint into a Lagrangian multiplier.",
    idea: "Binary search λ; solve unconstrained DP that adds −λ per pick. Track number of picks to nudge λ."
  },
  {
    id: "sqrt-decomposition",
    title: "SQRT Decomposition",
    tags: ["range-query", "sqrt-decomposition", "block-decomposition", "offline"],
    when: "Range updates/queries when segment trees are too heavy or the operation is not associative in a clean way.",
    idea: "Split array into √n blocks; maintain per-block aggregate. Point ops in O(1), range ops in O(√n)."
  },
  {
    id: "mos-algorithm",
    title: "Mo's Algorithm (Offline Range Queries)",
    tags: ["range-query", "mos-algorithm", "offline", "sqrt", "add-remove"],
    when: "Many offline range queries where an [l, r] answer updates in O(1) when l or r shifts by ±1.",
    idea: "Sort queries by (l/√n, r); slide two pointers across all queries. Total O((n + q)√n)."
  },
  {
    id: "persistent-segtree",
    title: "Persistent Segment Tree",
    tags: ["segment-tree", "persistent", "version", "range-kth"],
    when: "Historical queries, k-th smallest in subrange, wavelet-like problems.",
    idea: "Every update creates new nodes along the affected root-to-leaf path (O(log n) new nodes) sharing the rest with the previous version."
  },
  {
    id: "treap",
    title: "Treap / Implicit Treap",
    tags: ["bst", "treap", "randomized", "split-merge", "implicit"],
    when: "Order-statistic tree, implicit-key rope operations (reverse/rotate ranges), balanced BST alternative.",
    idea: "BST by key, heap by random priority. Two primitives: split(t, k) and merge(a, b). Everything derives from them."
  },
  {
    id: "miller-rabin",
    title: "Miller–Rabin Primality Test",
    tags: ["math", "primality", "miller-rabin", "deterministic-64bit"],
    when: "Fast primality up to 2^64 (deterministic with the right witness set) or probabilistic for larger.",
    idea: "Write n-1 = d·2^r. For witness a, if a^d ≠ 1 (mod n) and a^(d·2^i) ≠ n-1 for all i < r, then composite."
  },
  {
    id: "pollards-rho",
    title: "Pollard's Rho (Integer Factorization)",
    tags: ["math", "factor", "pollards-rho", "gcd", "cycle-detection"],
    when: "Factor 64-bit composites quickly (paired with Miller–Rabin).",
    idea: "Random walk x ← x^2 + c (mod n); collect gcd(|x − y|, n) until it splits n. Floyd/Brent cycle detection."
  },
  {
    id: "crt",
    title: "Chinese Remainder Theorem (CRT)",
    tags: ["math", "crt", "modular", "system-congruences"],
    when: "Solve x ≡ a_i (mod m_i) systems; combine multiple modular constraints.",
    idea: "Iteratively merge (a, m) with next (a', m') using extended Euclidean when gcd(m, m') divides (a' − a); else no solution."
  },
  {
    id: "bsgs",
    title: "Baby-Step Giant-Step (Discrete Log)",
    tags: ["math", "discrete-log", "bsgs", "modular", "meet-in-the-middle"],
    when: "Solve a^x ≡ b (mod p) for prime p in O(√p log p).",
    idea: "Set m = ⌈√p⌉; store {a^j · b} for j in [0, m); scan a^(m·i) for i in [1, m] and look up in the hash map."
  },
  {
    id: "fft-ntt",
    title: "FFT / NTT (Polynomial Multiplication)",
    tags: ["math", "fft", "ntt", "polynomial", "convolution"],
    when: "Multiply polynomials of degree n in O(n log n); count pairs with sum property; big-int multiplication.",
    idea: "Evaluate polys on nth roots of unity (or in a modular field with a primitive root), multiply pointwise, interpolate. NTT works with p = 998244353."
  },
  {
    id: "gaussian-elimination",
    title: "Gaussian Elimination",
    tags: ["math", "linear-algebra", "gaussian-elimination", "gf2", "system"],
    when: "Solve linear systems in R or GF(2); rank; determinant; XOR-basis (bitset variant).",
    idea: "Row reduce to RREF. In GF(2) use bitsets for O(n^2 · n / 64) speed. Watch numeric stability in R."
  },
  {
    id: "rotating-calipers",
    title: "Rotating Calipers",
    tags: ["geometry", "rotating-calipers", "convex-hull", "diameter"],
    when: "Diameter of point set, width, farthest pair, minimum enclosing rectangle on a convex polygon.",
    idea: "Walk two antipodal pointers around the hull; each moves monotonically. O(n) after hull."
  },
  {
    id: "closest-pair",
    title: "Closest Pair of Points (Divide & Conquer)",
    tags: ["geometry", "closest-pair", "divide-conquer", "sweep-line"],
    when: "Closest pair among n points in O(n log n).",
    idea: "Sort by x; split at median; recurse; only need to check pairs within a strip of width 2δ around the split line, and each point compares against ≤ 7 others."
  },
  {
    id: "half-plane-intersection",
    title: "Half-Plane Intersection",
    tags: ["geometry", "half-plane", "intersection", "convex", "linear-programming"],
    when: "Feasible region of many linear constraints; visibility polygons; LP in 2D.",
    idea: "Sort half-planes by angle; use a deque of active edges, popping when new plane invalidates back/front. O(n log n) with sort, O(n) after."
  },
  {
    id: "bitset-speedup",
    title: "Bitset Speedup",
    tags: ["bitset", "optimization", "constant-factor", "subset-sum", "reachability"],
    when: "n^2 or n^3 DP/graph algorithms where the state can be represented as a bitmask row.",
    idea: "Replace nested bit ops with std::bitset operations for a 32/64x constant-factor speedup. Great for subset-sum (~n·W/64), reachability closure."
  },
  {
    id: "randomization",
    title: "Randomization Tricks",
    tags: ["random", "hashing", "monte-carlo", "las-vegas", "unordered-map-attack"],
    when: "Adversarial hash collisions, probabilistic checks, symmetry breaking.",
    idea: "Randomize hash seed (custom hash for unordered_map/HashMap), randomize pivots for quicksort, randomize root for hashing trees to avoid isomorphism attacks."
  },
  {
    id: "matrix-exp-graph",
    title: "Matrix Exp on Graphs (Path Counting)",
    tags: ["graph", "matrix-exponentiation", "path-counting"],
    when: "Count walks of exactly k edges between vertices in a fixed graph.",
    idea: "A^k[i][j] = number of length-k walks i→j. Use fast exp with (min, +) semiring for shortest path with exactly k edges."
  }
];
