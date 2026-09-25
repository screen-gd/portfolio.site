# Screen portfolio

## Cloudflare Pages

This site builds as a static Next.js export. Connect this repository to Cloudflare Pages with:

- Production branch: `main`
- Framework preset: **Next.js (Static HTML Export)**
- Build command: `npm run build`
- Build output directory: `out`

Run `npm ci` and `npm run build` locally to check the export. Markdown articles in `content/articles` are generated during the build, so publish a new article by committing its file and rebuilding the site.
