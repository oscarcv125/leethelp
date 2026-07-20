
const COMMON = new Set([
  "if","else","for","while","do","return","break","continue","switch","case",
  "default","new","this","true","false","null","void","try","catch","finally",
  "throw","typeof","instanceof","in","of","yield","await","async","import","export","from","as"
]);

const LANGS = {
  python: {
    keywords: new Set([
      "def","class","return","if","elif","else","for","while","break","continue",
      "pass","import","from","as","in","is","not","and","or","try","except","finally",
      "raise","with","lambda","yield","global","nonlocal","assert","True","False","None","async","await","match","case"
    ]),
    types: new Set(["int","float","str","list","dict","set","tuple","bool","bytes","object","Any","Optional","List","Dict","Set","Tuple"]),
    lineComment: "#",
    blockComment: null,
    strings: ['"""',"'''",'"',"'"]
  },
  javascript: {
    keywords: new Set([
      ...COMMON, "var","let","const","function","class","extends","super","static","get","set","enum","interface","implements","package","private","protected","public","readonly","abstract","namespace","module","declare","type","satisfies"
    ]),
    types: new Set(["string","number","boolean","any","unknown","never","void","object","bigint","symbol","undefined","Promise","Array","Map","Set","Record"]),
    lineComment: "//",
    blockComment: ["/*","*/"],
    strings: ['"',"'","`"]
  },
  cpp: {
    keywords: new Set([
      ...COMMON, "int","long","short","char","float","double","bool","auto","const","constexpr","static","virtual","override","final","struct","class","enum","union","template","typename","namespace","using","public","private","protected","friend","operator","sizeof","nullptr","this","new","delete","include","define","ifndef","ifdef","endif","pragma"
    ]),
    types: new Set(["int","long","short","char","float","double","bool","auto","void","size_t","string","vector","map","set","pair","tuple","unordered_map","unordered_set","deque","stack","queue","priority_queue"]),
    lineComment: "//",
    blockComment: ["/*","*/"],
    strings: ['"',"'"]
  },
  java: {
    keywords: new Set([
      ...COMMON, "public","private","protected","static","final","abstract","synchronized","volatile","transient","native","strictfp","class","interface","extends","implements","package","enum","record","sealed","permits","yield"
    ]),
    types: new Set(["int","long","short","byte","char","float","double","boolean","void","String","Integer","Long","Double","Boolean","Object","List","Map","Set","HashMap","HashSet","ArrayList","LinkedList","Queue","Deque","PriorityQueue"]),
    lineComment: "//",
    blockComment: ["/*","*/"],
    strings: ['"',"'"]
  },
  go: {
    keywords: new Set([
      ...COMMON, "func","var","const","package","import","type","struct","interface","map","chan","go","defer","select","fallthrough","range"
    ]),
    types: new Set(["int","int32","int64","uint","uint32","uint64","float32","float64","bool","string","byte","rune","error","any"]),
    lineComment: "//",
    blockComment: ["/*","*/"],
    strings: ['"',"'","`"]
  },
  rust: {
    keywords: new Set([
      "fn","let","mut","const","static","struct","enum","trait","impl","for","in","while","loop","match","if","else","return","break","continue","pub","use","mod","crate","self","Self","super","as","where","move","ref","box","unsafe","async","await","dyn","type"
    ]),
    types: new Set(["i8","i16","i32","i64","i128","isize","u8","u16","u32","u64","u128","usize","f32","f64","bool","char","str","String","Vec","Option","Result","Box","Rc","Arc","HashMap","HashSet","BTreeMap","BTreeSet"]),
    lineComment: "//",
    blockComment: ["/*","*/"],
    strings: ['"',"'"]
  },
  csharp: {
    keywords: new Set([
      ...COMMON, "public","private","protected","internal","static","readonly","abstract","virtual","override","sealed","partial","namespace","using","class","struct","interface","enum","record","get","set","var","ref","out","params","event","delegate","operator","implicit","explicit","checked","unchecked","fixed","stackalloc","unsafe","async","await"
    ]),
    types: new Set(["int","long","short","byte","char","float","double","decimal","bool","void","string","object","dynamic","List","Dictionary","HashSet","IEnumerable","IList","IDictionary","Task"]),
    lineComment: "//",
    blockComment: ["/*","*/"],
    strings: ['"',"'"]
  },
  kotlin: {
    keywords: new Set([
      ...COMMON, "fun","val","var","class","object","interface","enum","data","sealed","open","abstract","final","override","init","companion","when","is","!is","!in","by","lateinit","package","import","internal","private","protected","public","operator","infix","inline","noinline","crossinline","suspend"
    ]),
    types: new Set(["Int","Long","Short","Byte","Char","Float","Double","Boolean","String","Any","Unit","Nothing","List","MutableList","Map","MutableMap","Set","MutableSet","Array"]),
    lineComment: "//",
    blockComment: ["/*","*/"],
    strings: ['"',"'"]
  },
  swift: {
    keywords: new Set([
      ...COMMON, "func","let","var","class","struct","enum","protocol","extension","init","deinit","subscript","self","Self","super","guard","defer","repeat","fallthrough","where","associatedtype","inout","internal","private","fileprivate","public","open","final","lazy","weak","unowned","mutating","nonmutating","override","required","convenience"
    ]),
    types: new Set(["Int","UInt","Int8","Int16","Int32","Int64","Float","Double","Bool","String","Character","Any","AnyObject","Array","Dictionary","Set","Optional"]),
    lineComment: "//",
    blockComment: ["/*","*/"],
    strings: ['"',"'"]
  },
  ruby: {
    keywords: new Set([
      "def","end","class","module","if","elsif","else","unless","while","until","do","begin","rescue","ensure","return","break","next","redo","retry","yield","nil","true","false","self","and","or","not","then","case","when","in","require","require_relative","include","extend","attr_accessor","attr_reader","attr_writer"
    ]),
    types: new Set(["Integer","Float","String","Symbol","Array","Hash","Range","Regexp","Proc","Lambda","Object"]),
    lineComment: "#",
    blockComment: null,
    strings: ['"',"'"]
  },
  php: {
    keywords: new Set([
      "abstract","and","array","as","break","callable","case","catch","class","clone","const","continue","declare","default","do","echo","else","elseif","empty","enddeclare","endfor","endforeach","endif","endswitch","endwhile","enum","extends","final","finally","fn","for","foreach","function","global","goto","if","implements","include","include_once","instanceof","insteadof","interface","isset","list","match","namespace","new","or","print","private","protected","public","readonly","require","require_once","return","static","switch","throw","trait","try","unset","use","var","while","xor","yield","null","true","false"
    ]),
    types: new Set(["int","integer","float","double","string","bool","boolean","array","object","void","mixed","self"]),
    lineComment: "//",
    blockComment: ["/*","*/"],
    strings: ['"',"'"]
  },
  sql: {
    keywords: new Set(
      "select from where and or not in is null like between order by group having limit offset insert into values update set delete create table alter drop index primary foreign key references join left right inner outer cross on as case when then else end union all distinct with as return begin commit rollback true false"
        .split(" ")
    ),
    types: new Set(["int","bigint","smallint","varchar","text","char","date","datetime","timestamp","boolean","bool","decimal","numeric","float","double","blob","json","uuid"]),
    lineComment: "--",
    blockComment: ["/*","*/"],
    strings: ["'",'"']
  },
  bash: {
    keywords: new Set(["if","then","else","elif","fi","for","while","do","done","case","esac","function","return","in","local","export","readonly","source","alias"]),
    types: new Set([]),
    lineComment: "#",
    blockComment: null,
    strings: ['"',"'","`"]
  }
};

const ALIASES = {
  py: "python", py3: "python", python3: "python",
  js: "javascript", jsx: "javascript",
  ts: "javascript", tsx: "javascript", typescript: "javascript",
  "c++": "cpp", cxx: "cpp", cc: "cpp", c: "cpp", h: "cpp", hpp: "cpp",
  golang: "go",
  rs: "rust",
  "c#": "csharp", cs: "csharp",
  kt: "kotlin",
  rb: "ruby",
  sh: "bash", shell: "bash", zsh: "bash"
};

function resolveLang(lang) {
  if (!lang) return null;
  const l = lang.toLowerCase();
  const alias = ALIASES[l] || l;
  return LANGS[alias] || null;
}

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
function esc(s) { return s.replace(/[&<>"]/g, (c) => ESC[c]); }
function span(kind, text) { return `<span class="tok tok-${kind}">${esc(text)}</span>`; }

export function highlight(source, langName) {
  const lang = resolveLang(langName);
  if (!lang) return highlightGeneric(source);

  const src = source;
  const N = src.length;
  let i = 0;
  let out = "";

  const isIdStart = (c) => /[A-Za-z_$]/.test(c);
  const isIdCont = (c) => /[A-Za-z0-9_$]/.test(c);
  const isDigit = (c) => /[0-9]/.test(c);

  const strDelims = lang.strings.slice().sort((a, b) => b.length - a.length); // longer first ("""')

  while (i < N) {
    const c = src[i];

    // line comments
    if (lang.lineComment && src.startsWith(lang.lineComment, i)) {
      const nl = src.indexOf("\n", i);
      const end = nl === -1 ? N : nl;
      out += span("comment", src.slice(i, end));
      i = end;
      continue;
    }
    // block comments
    if (lang.blockComment && src.startsWith(lang.blockComment[0], i)) {
      const [open, close] = lang.blockComment;
      const end = src.indexOf(close, i + open.length);
      const stop = end === -1 ? N : end + close.length;
      out += span("comment", src.slice(i, stop));
      i = stop;
      continue;
    }
    // strings
    let stringMatched = false;
    for (const delim of strDelims) {
      if (src.startsWith(delim, i)) {
        let j = i + delim.length;
        while (j < N) {
          if (src[j] === "\\" && j + 1 < N) { j += 2; continue; }
          if (src.startsWith(delim, j)) { j += delim.length; break; }
          j++;
        }
        out += span("string", src.slice(i, j));
        i = j;
        stringMatched = true;
        break;
      }
    }
    if (stringMatched) continue;

    // numbers
    if (isDigit(c) || (c === "." && isDigit(src[i + 1] || ""))) {
      let j = i;
      // hex/binary/oct prefix
      if (c === "0" && /[xXbBoO]/.test(src[i + 1] || "")) {
        j += 2;
        while (j < N && /[0-9a-fA-F_]/.test(src[j])) j++;
      } else {
        while (j < N && /[0-9_]/.test(src[j])) j++;
        if (src[j] === ".") {
          j++;
          while (j < N && /[0-9_]/.test(src[j])) j++;
        }
        if (/[eE]/.test(src[j])) {
          j++;
          if (/[+-]/.test(src[j])) j++;
          while (j < N && /[0-9]/.test(src[j])) j++;
        }
      }
      // suffix: L, f, u, ...
      while (j < N && /[a-zA-Z]/.test(src[j])) j++;
      out += span("number", src.slice(i, j));
      i = j;
      continue;
    }

    // identifiers → keyword / type / function / plain
    if (isIdStart(c)) {
      let j = i + 1;
      while (j < N && isIdCont(src[j])) j++;
      const word = src.slice(i, j);
      let kind = null;
      if (lang.keywords.has(word)) kind = "keyword";
      else if (lang.types.has(word)) kind = "type";
      else if (src[j] === "(") kind = "function";
      else if (/^[A-Z]/.test(word)) kind = "type";
      if (kind) out += span(kind, word);
      else out += esc(word);
      i = j;
      continue;
    }

    // punctuation / operators (grouped runs)
    if (/[+\-*/%=<>!&|^~?:.,;()\[\]{}]/.test(c)) {
      let j = i + 1;
      // keep operator runs together for coloring
      while (j < N && /[+\-*/%=<>!&|^~?:]/.test(src[j])) j++;
      out += span("punct", src.slice(i, j));
      i = j;
      continue;
    }

    // whitespace / other
    out += esc(c);
    i++;
  }
  return out;
}

function highlightGeneric(src) {
  const N = src.length;
  let i = 0, out = "";
  const strDelims = ['"', "'", "`"];
  while (i < N) {
    const c = src[i];
    // #, // and /* comments
    if (src.startsWith("//", i) || c === "#") {
      const end = src.indexOf("\n", i);
      const stop = end === -1 ? N : end;
      out += span("comment", src.slice(i, stop));
      i = stop; continue;
    }
    if (src.startsWith("/*", i)) {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? N : end + 2;
      out += span("comment", src.slice(i, stop));
      i = stop; continue;
    }
    let hit = false;
    for (const d of strDelims) {
      if (c === d) {
        let j = i + 1;
        while (j < N) {
          if (src[j] === "\\" && j + 1 < N) { j += 2; continue; }
          if (src[j] === d) { j++; break; }
          j++;
        }
        out += span("string", src.slice(i, j));
        i = j; hit = true; break;
      }
    }
    if (hit) continue;
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < N && /[0-9.]/.test(src[j])) j++;
      out += span("number", src.slice(i, j));
      i = j; continue;
    }
    out += ESC[c] ?? c;
    i++;
  }
  return out;
}
