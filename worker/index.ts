// Serves the static site and handles GitHub sign-in for the blog editor at /admin.
// Needs GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET from a GitHub OAuth app whose
// callback URL is https://<site>/oauth/callback.

type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
};

const stateCookie = 'oauth_state';

// The editor opens this page in a popup and waits for the token in Decap/Sveltia's message format.
function reply(status: 'success' | 'error', content: object) {
  const message = JSON.stringify(`authorization:github:${status}:${JSON.stringify(content)}`).replace(/</g, '\u003c');
  const html = `<!doctype html><meta charset="utf-8"><title>Signing in…</title><script>
(() => {
  if (!window.opener) return document.write('Open this from the blog editor.');
  addEventListener('message', (event) => {
    if (event.origin !== location.origin) return;
    window.opener.postMessage(${message}, location.origin);
    setTimeout(() => window.close(), 100);
  });
  window.opener.postMessage('authorizing:github', location.origin);
})();
</script>`;
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${stateCookie}=; Path=/oauth; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

function authorize(url: URL, env: Env) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return reply('error', { message: 'GitHub sign-in is not configured.' });
  const scope = url.searchParams.get('scope') ?? '';
  const state = crypto.randomUUID();
  const github = new URL('https://github.com/login/oauth/authorize');
  github.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  github.searchParams.set('redirect_uri', `${url.origin}/oauth/callback`);
  github.searchParams.set('scope', /^[a-z_:,]+$/.test(scope) ? scope : 'repo,user');
  github.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: github.toString(),
      'Set-Cookie': `${stateCookie}=${state}; Path=/oauth; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

async function callback(request: Request, url: URL, env: Env) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = request.headers.get('Cookie')?.match(new RegExp(`(?:^|;\s*)${stateCookie}=([^;]+)`))?.[1];
  if (!code || !state || state !== expected) return reply('error', { message: 'Sign-in expired. Try again.' });

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'portfolio-blog-editor' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/oauth/callback`,
    }),
  });
  const result = await response.json().catch(() => ({})) as { access_token?: string; error_description?: string };
  if (!result.access_token) return reply('error', { message: result.error_description ?? 'GitHub did not return a token.' });
  return reply('success', { token: result.access_token, provider: 'github' });
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === '/oauth/auth') return authorize(url, env);
    if (url.pathname === '/oauth/callback') return callback(request, url, env);
    return env.ASSETS.fetch(request);
  },
};
