// Minimal dependency-free Markdown -> HTML parser for blog posts.
// Handles: frontmatter, headings, paragraphs, bold/italic/code, links,
// ordered/unordered lists, fenced code blocks, blockquotes, images, hr.

export function parseMarkdown(raw) {
  const { body } = extractFrontmatter(raw);
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeLines = [];
  let listStack = [];

  const closeLists = () => {
    while (listStack.length) {
      html.push(`</${listStack.pop()}>`);
    }
  };

  const escapeHtml = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inline = (text) => {
    let t = escapeHtml(text);
    // inline code (protect from further formatting)
    const codes = [];
    t = t.replace(/`([^`]+)`/g, (_, c) => {
      codes.push(`<code>${c}</code>`);
      return `\u0000${codes.length - 1}\u0000`;
    });
    // images
    t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');
    // links
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // bold + italic combos
    t = t.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    t = t.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    t = t.replace(/_([^_]+)_/g, "<em>$1</em>");
    // restore code placeholders
    t = t.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[i]);
    return t;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        inCodeBlock = false;
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      }
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (/^ {2,}/.test(line)) {
      closeLists();
      html.push(`<pre><code>${escapeHtml(line)}</code></pre>`);
      continue;
    }

    if (line.trim() === "") {
      closeLists();
      continue;
    }

    // headings
    const h = /^#{1,6}\s+(.*)$/.exec(line);
    if (h) {
      closeLists();
      const level = h[0].match(/^#/)[0].length;
      html.push(`<h${level}>${inline(h[1])}</h${level}>`);
      continue;
    }

    // hr
    if (/^(---|\*\*\*|___)\s*$/.test(line.trim())) {
      closeLists();
      html.push("<hr />");
      continue;
    }

    // blockquote
    if (line.startsWith(">")) {
      closeLists();
      const content = line.replace(/^\s*>\s?/, "");
      html.push(`<blockquote>${inline(content)}</blockquote>`);
      continue;
    }

    // lists
    const ul = /^[-*+]\s+(.*)$/.exec(line);
    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ul || ol) {
      const tag = ol ? "ol" : "ul";
      const item = (ol ? ol[1] : ul[1]).trim();
      if (listStack[listStack.length - 1] !== tag) {
        closeLists();
        listStack.push(tag);
        html.push(`<${tag}>`);
      }
      html.push(`<li>${inline(item)}</li>`);
      continue;
    }

    closeLists();
    // paragraph — join until blank line handled by loop; emit single line as p
    html.push(`<p>${inline(line)}</p>`);
  }

  closeLists();
  return html.join("\n");
}

export function extractFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data = {};
  const fmLines = match[1].split("\n");
  for (const ln of fmLines) {
    const idx = ln.indexOf(":");
    if (idx === -1) continue;
    const key = ln.slice(0, idx).trim();
    let val = ln.slice(idx + 1).trim();
    // array like ["A", "B"]
    if (val.startsWith("[")) {
      const items = val.replace(/[\[\]]/g, "").split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
      data[key] = items.filter(Boolean);
    } else {
      data[key] = val.replace(/^"|"$/g, "");
    }
  }
  return { data, body: match[2] };
}
