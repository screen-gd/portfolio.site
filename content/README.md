# Publishing articles

Add a Markdown file to `content/articles/`, such as `my-first-article.md`.

Without metadata, start it with a `# Title` heading. The first paragraph becomes the summary on the Articles page. The rest is the article body. The filename becomes its URL: `/articles/my-first-article`.

For the Articles listing, add optional metadata before the heading:

```md
---
date: 2026-09-26
category: Design
cover: /articles/desk.jpg
---
# Title

Opening summary.
```

Articles with dates appear newest first. The newest article is featured; its cover image appears when supplied. Reading time is calculated from the article text.

Put images in `public/articles/` and reference them as `/articles/image-name.png`. Rebuild or redeploy the site after adding an article.
