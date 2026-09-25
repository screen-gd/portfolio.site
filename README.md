# Screen portfolio

## Cloudflare Workers

This site builds as a static Next.js export served by Workers Static Assets.

```sh
npm ci
npx wrangler deploy
```

Wrangler runs `npm run build` before uploading `out/`, as configured in `wrangler.jsonc`. Use `npm run build` to check the static export without deploying. Markdown articles in `content/articles` are generated during the build, so commit and redeploy after adding one.
