# Publishing blog posts

## With the editor

Open `/admin` on the live site (or `/admin` on the local server from `npm run dev`). Sign in with a GitHub personal access token that has **Contents: read and write** access to `screen-gd/portfolio.site`. In Chrome or Edge you can also pick "Work with Local Repository" to edit this folder directly, then commit and push the changes yourself.

- **New post** creates a Markdown file in `content/blog/`.
- Images you upload (cover or inline) are saved in `public/blog/`.
- **Publish** commits to `main`. The site updates on the next build and deploy.

## By hand

Add a Markdown file to `content/blog/`, such as `my-first-post.md`. The filename becomes its URL: `/blog/my-first-post`.

```md
---
title: My first post
date: 2026-09-26
category: Design
cover: /blog/desk.jpg
---

Opening summary.

## A section

More text.
```

Only `title` is required. You can also put the title in a leading `# Title` heading instead. The first paragraph becomes the summary on the Blog page. Posts with dates appear newest first; the newest is featured, with its cover when supplied.

Use `##` for section headings. A link to an X post, such as `[Chike](https://x.com/user/status/123)`, shows a preview of the post on hover.

Put images in `public/blog/` and reference them as `/blog/image-name.png`.
