
export const TEMPLATES = [
  {
    id: "sliding-window-variable",
    language: "python",
    code: `def longest_window(a, valid):
    l = 0
    best = 0
    for r, x in enumerate(a):
        add(x)
        while not valid():
            remove(a[l]); l += 1
        best = max(best, r - l + 1)
    return best`
  },
  {
    id: "binary-search",
    language: "python",
    code: `def lower_bound(a, target):
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo  # first index with a[i] >= target (== len(a) if none)`
  },
  {
    id: "binary-search-on-answer",
    language: "python",
    code: `def bs_answer(lo, hi, feasible):
    while lo < hi:
        mid = (lo + hi) // 2
        if feasible(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo  # smallest feasible x`
  },
  {
    id: "monotonic-stack",
    language: "python",
    code: `def next_greater(a):
    n = len(a)
    ans = [-1] * n
    st = []  # indices, values strictly decreasing
    for i, x in enumerate(a):
        while st and a[st[-1]] < x:
            ans[st.pop()] = x
        st.append(i)
    return ans`
  },
  {
    id: "monotonic-deque",
    language: "python",
    code: `from collections import deque

def sliding_max(a, k):
    dq, out = deque(), []
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] == i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(a[dq[0]])
    return out`
  },
  {
    id: "kadane",
    language: "python",
    code: `def max_subarray(a):
    cur = best = a[0]
    for x in a[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best`
  },
  {
    id: "prefix-sum",
    language: "python",
    code: `def prefix_sums(a):
    P = [0] * (len(a) + 1)
    for i, x in enumerate(a):
        P[i + 1] = P[i] + x
    return P  # range_sum(l, r) = P[r+1] - P[l]`
  },
  {
    id: "difference-array",
    language: "python",
    code: `def apply_ranges(n, updates):
    diff = [0] * (n + 1)
    for l, r, d in updates:
        diff[l] += d
        diff[r + 1] -= d
    out, run = [0] * n, 0
    for i in range(n):
        run += diff[i]
        out[i] = run
    return out`
  },
  {
    id: "cyclic-sort",
    language: "python",
    code: `def cyclic_sort(a):
    # a is a permutation of 0..n-1 possibly with duplicates/missing
    i = 0
    while i < len(a):
        j = a[i]
        if 0 <= j < len(a) and a[i] != a[j]:
            a[i], a[j] = a[j], a[i]
        else:
            i += 1
    return a`
  },
  {
    id: "fast-slow-pointer",
    language: "python",
    code: `def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast: break
    else:
        return None
    slow = head
    while slow is not fast:
        slow, fast = slow.next, fast.next
    return slow`
  },
  {
    id: "bfs",
    language: "python",
    code: `from collections import deque

def bfs(graph, src):
    dist = {src: 0}
    q = deque([src])
    while q:
        u = q.popleft()
        for v in graph[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist`
  },
  {
    id: "dfs-graph",
    language: "python",
    code: `def dfs_iter(graph, src):
    order, seen = [], {src}
    stack = [src]
    while stack:
        u = stack.pop()
        order.append(u)
        for v in graph[u]:
            if v not in seen:
                seen.add(v); stack.append(v)
    return order`
  },
  {
    id: "topological-sort",
    language: "python",
    code: `from collections import deque

def topo(n, edges):
    graph = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        graph[u].append(v); indeg[v] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft(); order.append(u)
        for v in graph[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else None  # None → has a cycle`
  },
  {
    id: "union-find",
    language: "python",
    code: `class DSU:
    def __init__(self, n):
        self.p = list(range(n))
        self.r = [0] * n
    def find(self, x):
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]  # path compression
            x = self.p[x]
        return x
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb: return False
        if self.r[ra] < self.r[rb]: ra, rb = rb, ra
        self.p[rb] = ra
        if self.r[ra] == self.r[rb]: self.r[ra] += 1
        return True`
  },
  {
    id: "dijkstra",
    language: "python",
    code: `import heapq

def dijkstra(graph, src):
    dist = {src: 0}
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, w in graph[u]:
            nd = d + w
            if nd < dist.get(v, float('inf')):
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist`
  },
  {
    id: "bellman-ford",
    language: "python",
    code: `def bellman_ford(n, edges, src):
    dist = [float('inf')] * n
    dist[src] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    # Negative-cycle detection
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            return None
    return dist`
  },
  {
    id: "floyd-warshall",
    language: "python",
    code: `def floyd_warshall(d):
    n = len(d)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if d[i][k] + d[k][j] < d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
    return d`
  },
  {
    id: "01-bfs",
    language: "python",
    code: `from collections import deque

def bfs01(graph, src):
    dist = {src: 0}
    dq = deque([src])
    while dq:
        u = dq.popleft()
        for v, w in graph[u]:
            nd = dist[u] + w
            if nd < dist.get(v, float('inf')):
                dist[v] = nd
                (dq.appendleft if w == 0 else dq.append)(v)
    return dist`
  },
  {
    id: "segment-tree",
    language: "python",
    code: `class SegTree:
    def __init__(self, a, op=lambda x, y: x + y, e=0):
        n = 1
        while n < len(a): n <<= 1
        self.n, self.op, self.e = n, op, e
        self.t = [e] * (2 * n)
        for i, x in enumerate(a): self.t[n + i] = x
        for i in range(n - 1, 0, -1):
            self.t[i] = op(self.t[2*i], self.t[2*i+1])
    def update(self, i, x):
        i += self.n; self.t[i] = x; i >>= 1
        while i: self.t[i] = self.op(self.t[2*i], self.t[2*i+1]); i >>= 1
    def query(self, l, r):  # [l, r)
        res_l = res_r = self.e
        l += self.n; r += self.n
        while l < r:
            if l & 1: res_l = self.op(res_l, self.t[l]); l += 1
            if r & 1: r -= 1; res_r = self.op(self.t[r], res_r)
            l >>= 1; r >>= 1
        return self.op(res_l, res_r)`
  },
  {
    id: "fenwick",
    language: "python",
    code: `class BIT:
    def __init__(self, n):
        self.n = n; self.b = [0] * (n + 1)
    def update(self, i, delta):  # 1-indexed
        while i <= self.n:
            self.b[i] += delta; i += i & -i
    def query(self, i):  # prefix sum a[1..i]
        s = 0
        while i > 0:
            s += self.b[i]; i -= i & -i
        return s
    def range(self, l, r):
        return self.query(r) - self.query(l - 1)`
  },
  {
    id: "trie",
    language: "python",
    code: `class Trie:
    def __init__(self):
        self.ch = {}
        self.end = False
    def insert(self, w):
        node = self
        for c in w:
            node = node.ch.setdefault(c, Trie())
        node.end = True
    def search(self, w, prefix=False):
        node = self
        for c in w:
            if c not in node.ch: return False
            node = node.ch[c]
        return prefix or node.end`
  },
  {
    id: "lis",
    language: "python",
    code: `from bisect import bisect_left

def lis(a):
    tails = []
    for x in a:
        i = bisect_left(tails, x)
        if i == len(tails): tails.append(x)
        else:               tails[i] = x
    return len(tails)`
  },
  {
    id: "edit-distance",
    language: "python",
    code: `def edit_distance(a, b):
    dp = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        prev, dp[0] = dp[0], i
        for j, cb in enumerate(b, 1):
            prev, dp[j] = dp[j], min(dp[j] + 1, dp[j-1] + 1, prev + (ca != cb))
    return dp[-1]`
  },
  {
    id: "dp-knapsack-01",
    language: "python",
    code: `def knapsack01(weights, values, W):
    dp = [0] * (W + 1)
    for wt, v in zip(weights, values):
        for w in range(W, wt - 1, -1):
            dp[w] = max(dp[w], dp[w - wt] + v)
    return dp[W]`
  },
  {
    id: "sos-dp",
    language: "python",
    code: `def sos(f, n):
    # f indexed by mask in [0, 2^n)
    for i in range(n):
        for mask in range(1 << n):
            if mask & (1 << i):
                f[mask] += f[mask ^ (1 << i)]
    return f`
  },
  {
    id: "kmp",
    language: "python",
    code: `def prefix_function(p):
    pi = [0] * len(p)
    for i in range(1, len(p)):
        j = pi[i - 1]
        while j and p[i] != p[j]: j = pi[j - 1]
        if p[i] == p[j]: j += 1
        pi[i] = j
    return pi

def kmp_find(t, p):
    pi = prefix_function(p)
    res, j = [], 0
    for i, c in enumerate(t):
        while j and c != p[j]: j = pi[j - 1]
        if c == p[j]: j += 1
        if j == len(p):
            res.append(i - j + 1); j = pi[j - 1]
    return res`
  },
  {
    id: "z-function",
    language: "python",
    code: `def z_function(s):
    n = len(s); z = [0] * n
    l = r = 0
    for i in range(1, n):
        if i < r: z[i] = min(r - i, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]: z[i] += 1
        if i + z[i] > r: l, r = i, i + z[i]
    return z`
  },
  {
    id: "sieve",
    language: "python",
    code: `def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if is_prime[i]:
            for j in range(i * i, n + 1, i):
                is_prime[j] = False
    return [i for i, p in enumerate(is_prime) if p]`
  },
  {
    id: "modular-exponentiation",
    language: "python",
    code: `def mod_pow(a, b, m):
    r = 1 % m
    a %= m
    while b:
        if b & 1: r = r * a % m
        a = a * a % m
        b >>= 1
    return r`
  },
  {
    id: "convex-hull",
    language: "python",
    code: `def convex_hull(points):
    pts = sorted(set(map(tuple, points)))
    if len(pts) <= 1: return pts
    def cross(o, a, b):
        return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
    lower = []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    upper = []
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]`
  },
  {
    id: "backtracking",
    language: "python",
    code: `def backtrack(state, choices):
    if is_solution(state):
        record(state); return
    for c in choices:
        if valid(state, c):
            apply(state, c)
            backtrack(state, choices)
            undo(state, c)`
  },
  {
    id: "lru-cache",
    language: "python",
    code: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.od = OrderedDict()
    def get(self, key):
        if key not in self.od: return -1
        self.od.move_to_end(key)
        return self.od[key]
    def put(self, key, value):
        if key in self.od: self.od.move_to_end(key)
        self.od[key] = value
        if len(self.od) > self.cap:
            self.od.popitem(last=False)`
  },
  {
    id: "miller-rabin",
    language: "python",
    code: `def is_prime(n):
    if n < 2: return False
    for p in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        if n % p == 0: return n == p
    d, r = n - 1, 0
    while d % 2 == 0:
        d //= 2; r += 1
    for a in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):  # deterministic < 3.3e24
        x = pow(a, d, n)
        if x == 1 or x == n - 1: continue
        for _ in range(r - 1):
            x = x * x % n
            if x == n - 1: break
        else:
            return False
    return True`
  },
  {
    id: "2-sat",
    language: "python",
    code: `import sys
sys.setrecursionlimit(1 << 20)

class TwoSAT:
    # variables 0..n-1; literals are 2*i (true) and 2*i+1 (false)
    def __init__(self, n):
        self.n = n
        self.g = [[] for _ in range(2 * n)]
        self.gr = [[] for _ in range(2 * n)]
    def add_clause(self, a, av, b, bv):
        # (x_a == av) OR (x_b == bv)
        na = 2 * a + (0 if av else 1)
        nb = 2 * b + (0 if bv else 1)
        self.g[na ^ 1].append(nb)
        self.g[nb ^ 1].append(na)
        self.gr[nb].append(na ^ 1)
        self.gr[na].append(nb ^ 1)
    def solve(self):
        n2 = 2 * self.n
        order, seen = [], [False] * n2
        def dfs1(v):
            stack = [(v, iter(self.g[v]))]
            seen[v] = True
            while stack:
                _, it = stack[-1]
                for u in it:
                    if not seen[u]:
                        seen[u] = True
                        stack.append((u, iter(self.g[u])))
                        break
                else:
                    order.append(stack.pop()[0])
        for v in range(n2):
            if not seen[v]: dfs1(v)
        comp = [-1] * n2
        c = 0
        for v in reversed(order):
            if comp[v] == -1:
                stack = [v]; comp[v] = c
                while stack:
                    u = stack.pop()
                    for w in self.gr[u]:
                        if comp[w] == -1:
                            comp[w] = c; stack.append(w)
                c += 1
        assign = [False] * self.n
        for i in range(self.n):
            if comp[2*i] == comp[2*i+1]: return None
            assign[i] = comp[2*i] > comp[2*i+1]
        return assign`
  },
  {
    id: "sqrt-decomposition",
    language: "python",
    code: `import math

class SqrtBlocks:
    def __init__(self, a):
        self.a = a[:]
        self.n = len(a)
        self.blk = max(1, int(math.isqrt(self.n)))
        self.b = [0] * ((self.n + self.blk - 1) // self.blk)
        for i, x in enumerate(a):
            self.b[i // self.blk] += x
    def update(self, i, x):
        self.b[i // self.blk] += x - self.a[i]
        self.a[i] = x
    def query(self, l, r):  # inclusive
        s = 0
        while l <= r and l % self.blk:
            s += self.a[l]; l += 1
        while l + self.blk - 1 <= r:
            s += self.b[l // self.blk]; l += self.blk
        while l <= r:
            s += self.a[l]; l += 1
        return s`
  },
  {
    id: "mos-algorithm",
    language: "python",
    code: `import math

def mos(a, queries):
    n = len(a); B = max(1, int(math.isqrt(n)))
    order = sorted(range(len(queries)),
                   key=lambda i: (queries[i][0] // B,
                                  queries[i][1] if (queries[i][0] // B) & 1 == 0 else -queries[i][1]))
    ans = [0] * len(queries)
    l, r = 0, -1
    cur = 0
    def add(x): nonlocal cur; cur += x
    def rem(x): nonlocal cur; cur -= x
    for idx in order:
        ql, qr = queries[idx]
        while r < qr: r += 1; add(a[r])
        while l > ql: l -= 1; add(a[l])
        while r > qr: rem(a[r]); r -= 1
        while l < ql: rem(a[l]); l += 1
        ans[idx] = cur
    return ans`
  },
  {
    id: "fft-ntt",
    language: "python",
    code: `import cmath

def fft(a, invert=False):
    n = len(a)
    if n == 1: return a
    # iterative Cooley-Tukey
    j = 0
    for i in range(1, n):
        bit = n >> 1
        while j & bit:
            j ^= bit; bit >>= 1
        j ^= bit
        if i < j: a[i], a[j] = a[j], a[i]
    length = 2
    while length <= n:
        ang = 2 * cmath.pi / length * (-1 if invert else 1)
        w_len = cmath.rect(1, ang)
        for i in range(0, n, length):
            w = 1
            for k in range(length // 2):
                u = a[i + k]; v = a[i + k + length // 2] * w
                a[i + k] = u + v
                a[i + k + length // 2] = u - v
                w *= w_len
        length <<= 1
    if invert:
        for i in range(n): a[i] /= n
    return a

def multiply(p, q):
    n = 1
    while n < len(p) + len(q): n <<= 1
    fa = [complex(x, 0) for x in p] + [0j] * (n - len(p))
    fb = [complex(x, 0) for x in q] + [0j] * (n - len(q))
    fft(fa); fft(fb)
    for i in range(n): fa[i] *= fb[i]
    fft(fa, invert=True)
    return [round(x.real) for x in fa[:len(p) + len(q) - 1]]`
  },
  {
    id: "suffix-array",
    language: "python",
    code: `def suffix_array(s):
    s = s + "\\0"
    n = len(s)
    sa = sorted(range(n), key=lambda i: s[i])
    rank = [0] * n
    for i in range(1, n):
        rank[sa[i]] = rank[sa[i-1]] + (s[sa[i]] != s[sa[i-1]])
    k = 1
    tmp = [0] * n
    while k < n:
        def key(i): return (rank[i], rank[i + k] if i + k < n else -1)
        sa.sort(key=key)
        tmp[sa[0]] = 0
        for i in range(1, n):
            tmp[sa[i]] = tmp[sa[i-1]] + (key(sa[i]) != key(sa[i-1]))
        rank = tmp[:]
        if rank[sa[-1]] == n - 1: break
        k <<= 1
    return sa[1:]  # drop the sentinel

def kasai_lcp(s, sa):
    n = len(sa)
    rank = [0] * n
    for i, x in enumerate(sa): rank[x] = i
    lcp = [0] * (n - 1)
    h = 0
    for i in range(n):
        if rank[i] > 0:
            j = sa[rank[i] - 1]
            while i + h < n and j + h < n and s[i + h] == s[j + h]: h += 1
            lcp[rank[i] - 1] = h
            if h > 0: h -= 1
    return lcp`
  },
  {
    id: "aho-corasick",
    language: "python",
    code: `from collections import deque

class AhoCorasick:
    def __init__(self):
        self.g = [{}]    # goto
        self.out = [[]]  # matches ending here
        self.fail = [0]
    def add(self, w, idx):
        v = 0
        for c in w:
            if c not in self.g[v]:
                self.g.append({}); self.out.append([]); self.fail.append(0)
                self.g[v][c] = len(self.g) - 1
            v = self.g[v][c]
        self.out[v].append(idx)
    def build(self):
        q = deque()
        for c, u in self.g[0].items():
            self.fail[u] = 0; q.append(u)
        while q:
            v = q.popleft()
            for c, u in self.g[v].items():
                f = self.fail[v]
                while f and c not in self.g[f]: f = self.fail[f]
                self.fail[u] = self.g[f].get(c, 0) if self.g[f].get(c, 0) != u else 0
                self.out[u].extend(self.out[self.fail[u]])
                q.append(u)
    def find_all(self, text):
        v = 0; hits = []
        for i, c in enumerate(text):
            while v and c not in self.g[v]: v = self.fail[v]
            v = self.g[v].get(c, 0)
            for idx in self.out[v]:
                hits.append((i, idx))
        return hits`
  }
];

export const TEMPLATE_BY_ID = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));
