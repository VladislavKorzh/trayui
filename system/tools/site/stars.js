/* The stars of the repository, as they are now: the one address of the site a script answers, /stars.json (wrangler.jsonc
   names this file as the Worker and runs it first for that address only; every other address is the static files').
   The build writes the count of that moment into every page, and into site/stars.json with the repository's name; after
   the page has loaded, site.js asks this address and puts the count it gets in the header. A visitor asks only this
   site, never GitHub.

   GitHub is asked at most once in 15 minutes from each of Cloudflare's data centres, and its answer kept in the data
   centre's cache. With the secret GITHUB_TOKEN (a fine-grained token that may only read public repositories:
   npx wrangler secret put GITHUB_TOKEN) the question counts against that token's 5,000 an hour; without it, against the
   60 an hour GitHub allows an address, and Workers share their addresses with other sites. When GitHub does not answer,
   the last count it gave is kept, or else the build's, and GitHub is asked again a minute later. The answer is always
   200 (a refusal would be an error in the browser's console): {"stars": n, "from": ..., "at": ...}, where from says whose
   count it is ("github": GitHub's own; "kept": the last GitHub gave, as it does not answer now; "build": the build's, as
   GitHub has not answered since this data centre began keeping one; "none": no count is known, and stars is null) and
   at is when GitHub gave it (null for the build's). */

const PATH = '/stars.json';
const FRESH = 15 * 60 * 1000;   // how long a count from GitHub stands
const RETRY = 60 * 1000;        // after GitHub did not answer, how long until it is asked again
const KEEP = 7 * 24 * 60 * 60;  // how long the cache holds a count, in seconds, so there is one to fall back on
const BROWSER = 10 * 60;        // how long a browser may reuse the answer, in seconds

const HEADERS = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Strict-Transport-Security': 'max-age=31536000' };

function answer(stars, from, at) {
  return new Response(JSON.stringify({ stars, from, at: at ? new Date(at).toISOString() : null }) + '\n', { headers: {
    ...HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${BROWSER}`, 'X-Robots-Tag': 'noindex' } });
}

/* A count, if it is one: a whole number, not below zero. */
const count = (n) => (Number.isInteger(n) && n >= 0 ? n : null);

/* What the build wrote: {repo: "owner/name", stars: n}. */
async function built(request, env) {
  try {
    const r = await env.ASSETS.fetch(new URL(PATH, request.url));
    if (r.ok) return await r.json();
  } catch (e) { /* no file: the repository is not open, or the site was built without it */ }
  return {};
}

/* The count GitHub gives now, or null. */
async function ask(repo, env) {
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'trayui-site' };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}`, { headers, signal: AbortSignal.timeout(4000) });
    if (!r.ok) return null;
    return count((await r.json()).stargazers_count);
  } catch (e) { return null; }
}

export async function stars(request, env, ctx) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { ...HEADERS, Allow: 'GET, HEAD' } });
  }
  const cache = caches.default;
  const key = new Request(new URL(PATH, request.url).toString());
  let kept = null;  // {repo, stars, from, at, next}: the last count, whose it is, when GitHub gave it, and when to ask again
  try {
    const hit = await cache.match(key);
    if (hit) kept = await hit.json();
  } catch (e) { kept = null; }
  const now = Date.now();
  if (kept && now < kept.next) return answer(count(kept.stars), kept.from, kept.at);

  const build = await built(request, env);
  const repo = typeof build.repo === 'string' && /^[\w.-]+\/[\w.-]+$/.test(build.repo) ? build.repo : '';
  if (!repo) return answer(null, 'none', null);
  const fresh = await ask(repo, env);
  const last = kept && kept.repo === repo && kept.at ? count(kept.stars) : null;
  const next = fresh !== null ? { repo, stars: fresh, from: 'github', at: now }
    : last !== null ? { repo, stars: last, from: 'kept', at: kept.at }
    : { repo, stars: count(build.stars), from: count(build.stars) === null ? 'none' : 'build', at: null };
  next.next = now + (fresh === null ? RETRY : FRESH);
  const store = cache.put(key, new Response(JSON.stringify(next), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${KEEP}` } }));
  if (ctx && ctx.waitUntil) ctx.waitUntil(store.catch(() => {})); else await store.catch(() => {});
  return answer(next.stars, next.from, next.at);
}

export default {
  async fetch(request, env, ctx) {
    if (new URL(request.url).pathname === PATH) return stars(request, env, ctx);
    return env.ASSETS.fetch(request);  // should another address reach the Worker, the files answer it, with their 404 page
  },
};
