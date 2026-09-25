# Screen portfolio

## Cloudflare Workers

This site builds as a static Next.js export served by Workers Static Assets.

```sh
npm ci
npm run build
npx wrangler deploy
```

The build creates `out/`, which is the asset directory in `wrangler.jsonc`. Markdown articles in `content/articles` are generated during the build, so commit and rebuild after adding one.
