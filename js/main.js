import { parseMarkdown, extractFrontmatter } from "./markdown.js";

const REPO = "D-Ajay-Kumar/D-Ajay-Kumar.github.io";
const BRANCH = "main";
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/`;

// ---- Data: edit this to add projects/skills/resume without touching markdown ----
export const PROFILE = {
  name: "D Ajay Kumar",
  tagline: "AI Engineer · LLMs · Agents",
  linkedin: "https://www.linkedin.com/in/d-ajay-kumar/",
  github: "https://github.com/D-Ajay-Kumar",
};

export const RESUME = {
  summary:
    "Software engineer building agentic AI platforms, developer tools, and distributed systems used at production scale.",
  experience: [
    {
      title: "Software Engineer 2",
      org: "Amadeus",
      date: "Apr 2025 – Present",
      desc: "Leading an A2A and MCP-powered multi-agent platform for infrastructure automation and investigation. Built an offline agentic engineering harness for open-weight 9B–35B MoE models, now used by 400+ developers.",
    },
    {
      title: "Software Engineer 1",
      org: "Amadeus",
      date: "Jul 2023 – Apr 2025",
      desc: "Led development of a GitOps cloud deployment platform for 30+ airport management tools used by 190+ airports. Built distributed services with Java, Kafka, Redis, RabbitMQ, PostgreSQL, and Kubernetes.",
    },
    {
      title: "Google Summer of Code Mentor",
      org: "52°North GmbH",
      date: "May 2022 – Sep 2022",
      desc: "Mentored the design and implementation of data privacy controls for location-based data in the enviroCar application.",
    },
    {
      title: "Software Engineering Intern",
      org: "Amadeus",
      date: "Feb 2022 – Jul 2022",
      desc: "Integrated an internal data-mocking library into an Angular application and added 60+ Playwright tests covering core features.",
    },
    {
      title: "Google Summer of Code Contributor",
      org: "52°North GmbH",
      date: "May 2021 – Sep 2021",
      desc: "Built the foundation of a cross-platform Flutter and SQLite application, merged 30+ pull requests, and automated Android builds with GitHub Actions.",
    },
  ],
  education: [
    { title: "Bachelor of Technology", org: "Punjab Engineering College, Chandigarh", date: "2019 – 2023" },
  ],
};

export const SKILLS = [
  {
    icon: "01",
    title: "AI & Languages",
    items: ["Python", "Java", "LangGraph", "vLLM", "Agentic AI", "MCP", "RAG", "Azure AI Search"],
  },
  {
    icon: "02",
    title: "Distributed Systems",
    items: ["Kafka", "RabbitMQ", "Redis", "Microservices", "Event-driven systems"],
  },
  {
    icon: "03",
    title: "Databases & Cloud",
    items: ["PostgreSQL", "MongoDB", "Kubernetes", "Docker", "ArgoCD"],
  },
  {
    icon: "04",
    title: "Core Engineering",
    items: ["System Design", "Microservice Architecture", "CI/CD", "Object-oriented design"],
  },
];

export const PROJECTS = [
  {
    icon: "[ 01 ]",
    title: "Agent Framework",
    desc: "A lightweight multi-agent orchestration layer with tool use and MCP support.",
    tags: ["Python", "MCP", "LangChain"],
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    icon: "[ 02 ]",
    title: "Inference Optimizer",
    desc: "Quantization + KV-cache pipeline that cut latency by 40% on a production LLM endpoint.",
    tags: ["C++", "CUDA", "LLM"],
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    icon: "[ 03 ]",
    title: "RAG Playground",
    desc: "Interactive retrieval-augmented generation playground with chunking strategies.",
    tags: ["React", "Vector DB", "OpenAI"],
    links: [{ label: "Live", href: "#" }],
  },
];

// ---- Post loading ----
async function fetchPosts() {
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/contents/blogs?ref=${BRANCH}`);
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const files = await response.json();
    return Promise.all(
      files
        .filter(({ name }) => name.endsWith(".md") && !name.startsWith("TEMPLATE") && name !== "README.md")
        .map(({ path }) => fetchPost(path))
    );
  } catch (error) {
    console.error("Could not load blog posts:", error);
    return [];
  }
}

function assetPath(path) {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
  const normalized = path.startsWith("blogs/") ? path : `blogs/${path}`;
  return `${RAW_BASE}${normalized}`;
}

async function fetchPost(path) {
  const response = await fetch(`${RAW_BASE}${path}`);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  const raw = await response.text();
  const { data, body } = extractFrontmatter(raw);
  const normalizedBody = body.replace(/(!\[[^\]]*\]\()([^\)]+)(\))/g, (_, start, image, end) => `${start}${assetPath(image)}${end}`);
  const plainText = normalizedBody.replace(/[#*`_>\[\]()!]/g, "").replace(/\n+/g, " ").trim();
  return {
    slug: path.split("/").pop().replace(/\.md$/, ""),
    title: data.title || "Untitled",
    date: data.date || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    cover: data.cover || "",
    excerpt: data.excerpt || plainText.slice(0, 140),
    html: parseMarkdown(normalizedBody),
  };
}

export async function getPosts() {
  const posts = await fetchPosts();
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ---- Rendering (homepage cards) ----
function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function renderPostsGrid(posts, containerId = "posts-grid") {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  if (!posts.length) {
    grid.innerHTML = `<div class="empty">No posts yet. Add a .md file in /blogs to get started.</div>`;
    return;
  }
  grid.innerHTML = posts.map((p) => {
    const tags = p.tags.slice(0, 3).map((t) => `<span class="post-card__tag">${escapeHtml(t)}</span>`).join("");
    return `
      <a class="post-card" href="blog.html?post=${encodeURIComponent(p.slug)}">
        <div class="post-card__body">
          <div class="post-card__meta">${tags}<span>· ${formatDate(p.date)}</span></div>
          <h3 class="post-card__title">${escapeHtml(p.title)}</h3>
          <p class="post-card__excerpt">${escapeHtml(p.excerpt)}</p>
          <span class="post-card__arrow">Read post →</span>
        </div>
      </a>`;
  }).join("");
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---- Blog post reader page ----
export function renderReader(slug) {
  const posts = document.getElementById("reader-posts"); // hidden data source
  (async () => {
    const all = await getPosts();
    const post = all.find((p) => p.slug === slug);
    if (!post) {
      document.body.innerHTML = `<div class="container"><p class="empty">Post not found.</p></div>`;
      return;
    }
    const idx = all.findIndex((p) => p.slug === slug);
    const prev = all[idx + 1];
    const next = all[idx - 1];
    const cover = post.cover ? assetPath(post.cover) : "";
    const meta = post.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join(" · ");
    const nav = (p, label) =>
      p ? `<a href="blog.html?post=${encodeURIComponent(p.slug)}">${label}: ${escapeHtml(p.title)}</a>` : `<span style="color:var(--text-faint)">${label}</span>`;

    document.getElementById("reader-meta").innerHTML = `${meta}${post.date ? ` · ${formatDate(post.date)}` : ""}`;
    document.getElementById("reader-title").textContent = post.title;
    const coverEl = document.getElementById("reader-cover");
    if (cover) {
      coverEl.src = cover;
      coverEl.style.display = "block";
    } else {
      coverEl.style.display = "none";
    }
    document.getElementById("reader-content").innerHTML = post.html;
    document.getElementById("reader-nav").innerHTML = `
      <div class="reader__nav">
        <div>${nav(prev, "← Previous")}</div>
        <div><a href="index.html#posts" class="reader__back">All posts →</a></div>
        <div>${nav(next, "Next →")}</div>
      </div>`;
  })();
}

// ---- Animated background ----
export function initBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas || typeof window === "undefined") return;
  const ctx = canvas.getContext("2d");
  let w, h, particles;
  const COUNT = Math.min(60, Math.floor(window.innerWidth / 22));

  function resize() {
    w = canvas.width = window.innerWidth * devicePixelRatio;
    h = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }

  function makeParticles() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
      r: (Math.random() * 1.5 + 0.5) * devicePixelRatio,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    // connect nearby particles with lines
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160 * devicePixelRatio) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124, 92, 255, ${0.18 * (1 - dist / (160 * devicePixelRatio))})`;
          ctx.lineWidth = devicePixelRatio;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    // draw dots
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(160, 160, 190, 0.6)";
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    requestAnimationFrame(draw);
  }

  resize();
  makeParticles();
  window.addEventListener("resize", () => { resize(); makeParticles(); });
  draw();
}

// ---- Boot ----
document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("posts-grid");
  if (grid) {
    const posts = await getPosts();
    renderPostsGrid(posts);
  }
  if (document.getElementById("reader-content")) {
    renderReader(new URLSearchParams(window.location.search).get("post") || "");
  }
});
