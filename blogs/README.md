# Blog Posts

Add your blog posts here. Each post is a single **`.md`** file. The site discovers published Markdown files through the public GitHub API; there is no database or manual post index.

## How to add a new post

1. Copy `TEMPLATE.md` to `blogs/your-post-title.md`.
2. Fill in the frontmatter at the top (the part between the `---`).
3. Write your content in Markdown below.
4. Push to GitHub. The published site discovers the new post automatically.

That's genuinely all you do. New posts appear at the **top** of the homepage automatically because they're sorted by date.

## Frontmatter format

```markdown
---
title: "My Post Title"
date: 2025-01-15
tags: ["LLM", "Agents"]
cover: "blogs/images/my-cover.png"   # optional path to an image
excerpt: "A one-line summary that shows on the card."
---

Your markdown body goes here...
```

| Field    | Required | Notes                                                        |
| -------- | -------- | ------------------------------------------------------------ |
| `title`  | yes      | Displayed as the headline and card title.                    |
| `date`   | yes      | `YYYY-MM-DD`. Posts sort newest-first by this.               |
| `tags`   | no       | Array of strings; shown as tags.                             |
| `cover`  | no       | Path to a cover image (relative to repo root).             |
| `excerpt`| no       | Shown on the card. Falls back to first paragraph if missing. |

## Images

Put post images in `blogs/images/` and reference them from your markdown, e.g.:

```markdown
![Architecture](/blogs/images/architecture.png)
```

The parser handles headings, paragraphs, bold/italic, links, lists, code blocks with syntax highlighting via inline `<code>`, blockquotes, and images out of the box. Use paths relative to `blogs/` for inline images, such as `images/rabbitmq/flow.png`.

## Existing posts

- `docker-image-optimization.md` — Shrinking Docker images 2.3GB → 87MB
- `covering-indexes.md` — Speeding up SQL queries with covering indexes
- `rabbitmq-microservices.md` — Bidirectional messaging patterns
