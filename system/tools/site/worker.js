/* The door of the site while it is private. Every request passes here before the static files (run_worker_first).
   A visitor without the cookie gets a page that asks for the password; the right password sets the cookie for 30 days.

   The password is the secret SITE_PASSWORD:   npx wrangler secret put SITE_PASSWORD
   With no secret set, nobody gets in. Changing the secret signs everyone out.
   To open the site to everyone, take this script out of wrangler.jsonc (see the README). */

const COOKIE = 'tray_site';
const MAX_AGE = 60 * 60 * 24 * 30;
const DOOR = '/__door';

/* What the cookie holds: a keyed hash made from the password, never the password itself. */
async function token(password) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('trayui-site'));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* Where to go after the door: the page asked for, if it is a page of this site; else the home page. */
function back(url) {
  const to = url.searchParams.get('to') || '/';
  if (!to.startsWith('/') || to.startsWith('//') || to.startsWith('/\\') || to.startsWith(DOOR)) return '/';
  try {
    const there = new URL(to, url.origin);
    return there.origin === url.origin ? there.pathname + there.search : '/';
  } catch (e) { return '/'; }
}

/* Compare two strings without stopping at the first difference. */
function same(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function cookieOf(request) {
  const all = request.headers.get('Cookie') || '';
  for (const part of all.split(/;\s*/)) {
    const at = part.indexOf('=');
    if (at > 0 && part.slice(0, at) === COOKIE) return part.slice(at + 1);
  }
  return '';
}

const HEADERS = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };

/* The page at the door. It links nothing: the stylesheet and the font of the system are behind the door too. */
function door(status, state) {
  const closed = state === 'closed';
  const message = closed
    ? '<p class="note" role="alert">No password has been set for this site yet, so it cannot be opened.</p>'
    : state === 'wrong' ? '<p class="error" id="error" role="alert">That password is not right. Check it and try again.</p>' : '';
  const form = closed ? '' : `
      <form method="post" action="${DOOR}" id="door">
        <div class="field">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required autofocus${state === 'wrong' ? ' aria-invalid="true" aria-describedby="error"' : ''}>
        </div>
        ${message}
        <button type="submit">Open the site</button>
      </form>
      <script>
        /* Keep the page the visitor asked for: after the password they land on it. The part after # never reaches the
           server, so it rides on the address the form goes to, and comes back with it. */
        var door = '${DOOR}', asked = location.pathname === door ? location.search : '?to=' + encodeURIComponent(location.pathname + location.search);
        document.getElementById('door').action = door + asked + location.hash;  /* after a wrong password the page is the door's, and already says where to */
      </script>`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Tray UI is private</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='10' fill='%23ffd426'/%3E%3Crect x='8' y='14' width='16' height='10' rx='4' fill='%23141414'/%3E%3C/svg%3E">
<style>
  :root { color-scheme: light dark; --page: #ffffff; --surface: #f4f3f0; --ink: #141414; --soft: #4a4a46; --accent: #ffd426; --on-accent: #141414; --danger: #b3261e; }
  @media (prefers-color-scheme: dark) { :root { --page: #111110; --surface: #1e1e1c; --ink: #f6f5f1; --soft: #c9c7c0; --danger: #ff8a80; } }
  * { box-sizing: border-box; }
  body { display: grid; place-items: center; min-height: 100dvh; margin: 0; padding: 16px; background: var(--page); color: var(--ink); font: 400 1.0625rem/1.45 "Helvetica Neue", Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  main { display: grid; gap: 24px; width: min(100%, 27rem); padding: 32px; border-radius: 40px; background: var(--surface); }
  .name { display: inline-flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.375rem; letter-spacing: -.04em; }
  /* The mark of the system: its bar is set down once when the door is shown. */
  .mark { flex: none; width: 28px; height: 28px; overflow: visible; }
  .mark .tile { fill: var(--accent); }
  .mark .bar { fill: var(--on-accent); transform-box: fill-box; transform-origin: 50% 100%; animation: set .6s cubic-bezier(.2, .8, .2, 1) .15s backwards; }
  @keyframes set { from { transform: translateY(-9px) scaleX(.55); opacity: 0; } 55% { opacity: 1; } }
  h1 { margin: 0 0 8px; font-size: 2rem; line-height: 1.05; letter-spacing: -.03em; text-wrap: balance; }
  p { margin: 0; color: var(--soft); }
  form { display: grid; gap: 24px; }
  .field { display: grid; gap: 8px; }
  label { font-weight: 500; font-size: .9375rem; }
  input { width: 100%; min-height: 56px; padding: 0 18px; border: 0; border-radius: 16px; background: var(--page); color: var(--ink); font: inherit; }
  input:focus-visible { outline: 2px solid var(--ink); outline-offset: 0; }
  input[aria-invalid="true"] { outline: 2px solid var(--danger); }
  button { min-height: 64px; border: 0; border-radius: 20px; background: var(--accent); color: var(--on-accent); font: 600 1.1875rem/1.1 "Helvetica Neue", Arial, sans-serif; cursor: pointer; transition: filter .15s ease, transform .15s ease; }
  button:hover { filter: brightness(.96); }
  button:active { transform: scale(.97); }
  button:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }
  .error { color: var(--danger); font-size: .9375rem; margin-top: -12px; }
  ::selection { background: var(--accent); color: var(--on-accent); }
  @media (prefers-reduced-motion: reduce) { button { transition: none; } .mark .bar { animation: none; } }
</style>
</head>
<body>
  <main>
    <span class="name"><svg class="mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect class="tile" width="32" height="32" rx="10"/><rect class="bar" x="8" y="14" width="16" height="10" rx="4"/></svg>Tray UI</span>
    <div>
      <h1>${closed ? 'This site is closed' : 'This site is private'}</h1>
      <p>${closed ? 'It will open when its owner sets a password.' : 'It is not open to everyone yet. Enter the password to look around.'}</p>
    </div>${closed ? message : form}
  </main>
</body>
</html>`;
  return new Response(html, { status, headers: HEADERS });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!env.SITE_PASSWORD) return door(503, 'closed');
    const expected = await token(env.SITE_PASSWORD);

    if (same(cookieOf(request), expected)) {
      if (url.pathname === DOOR) return new Response(null, { status: 303, headers: { Location: back(url) } });
      return env.ASSETS.fetch(request);
    }

    if (request.method === 'POST' && url.pathname === DOOR) {
      let given = '';
      try { given = String((await request.formData()).get('password') || ''); } catch (e) { given = ''; }
      if (same(await token(given), expected)) {
        return new Response(null, { status: 303, headers: { Location: back(url), 'Cache-Control': 'no-store',
          'Set-Cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax` } });
      }
      await new Promise((done) => setTimeout(done, 600));  /* a wrong guess costs time */
      return door(401, 'wrong');
    }

    /* Not signed in: someone opening a page meets the door; a request for a file gets a plain refusal. */
    const wantsPage = request.method === 'GET' && (request.headers.get('Accept') || '').includes('text/html');
    if (wantsPage) return door(401, 'ask');
    return new Response('This site is private.', { status: 401, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
  },
};
