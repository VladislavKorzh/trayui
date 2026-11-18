# Open Graph images from HTML with Playwright

Draw a 1200 by 630 link picture for every page: an HTML template for each kind of page, a Playwright screenshot, a cache that redraws only what changed.

A link to a page, pasted into a chat or a post, shows a picture: the page's `og:image`. Tray UI's site has more than 200 pages, and its build draws a picture for each of them in Chrome, from HTML, with the system's own stylesheet. The build is Python (`tools/og.py`), and the examples here use Playwright's Node API, which has the same methods under camel-case names.

## The tags a page needs

The Open Graph protocol names four properties that every page must have: `og:title`, `og:type`, `og:image` and `og:url`. It adds that "if the page specifies an og:image it should specify `og:image:alt`", "a description of what is in the image (not a caption)". `og:image:width` and `og:image:height` give its size in pixels.

X reads its own tags first and falls back to Open Graph. Its table of card tags gives `og:image` as the fallback for `twitter:image`, and `og:image:alt` for `twitter:image:alt`. The tag worth adding is `twitter:card`: without it, X says, "a summary card may be rendered", and `summary_large_image` asks for the large picture instead. This is the head of Tray UI's Button page:

```html
<meta property="og:title" content="Button">
<meta property="og:description" content="A button starts an action; the yellow one is the single most important action in view. A Tray UI component in plain HTML and CSS.">
<meta property="og:site_name" content="Tray UI">
<meta property="og:type" content="website">
<meta property="og:url" content="https://trayui.com/components/button">
<link rel="canonical" href="https://trayui.com/components/button">
<meta property="og:image" content="https://trayui.com/_/og/components/button.bb857b024d36.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Tray UI: Button">
<meta name="twitter:card" content="summary_large_image">
```

The picture's address is absolute, as in every example of the Open Graph protocol, which defines a URL as one that uses `http://` or `https://`. When a page has no picture, the template writes `summary` in `twitter:card` and leaves the `og:image` lines out.

## The size

LinkedIn's help page gives a minimum of 1200 by 627 pixels, a ratio of 1.91 to 1, and at most 5 MB. X takes images under 5 MB in JPG, PNG, WEBP or GIF, and says "SVG is not supported". So the picture is a raster image, and 1200 by 630 meets both. A browser can draw any HTML at that size and save it, which is what Playwright is for here.

## A template for each kind of page

A card is a small HTML page of its own. Tray UI has four kinds:

| Page | What its card shows |
| --- | --- |
| The home page | The accent ground, the mark, "108 components in plain HTML and CSS" and a line with the other counts |
| A component | The mark, the word "Component" and the name on the left; on the right, the component's live preview, scaled to fit |
| A block | The word "Block" and the name across the top; under it, the top of the whole screen in a frame |
| Any other page | The kind of page (Docs, Guide, Charts, Article), its name, its summary cut at about 110 characters, and a large mark |

Every card links `tokens.css`, `components/bundle.css` and `components/bundle.js`. The Button card is the Button preview, drawn by the Button's own CSS, and a change to the stylesheet shows in the cards at the next build.

## Drawing the cards

This is a complete version for a small site with one template. `makeCards()` takes the cards, draws the ones it has not drawn before, and returns the address of each picture:

```js
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from 'playwright';

const LOOK = '1'; // change it when card() changes: every card is drawn again
const CACHE = '.cache/og';
const STYLE = `body { margin: 0; box-sizing: border-box; inline-size: 1200px; block-size: 630px;
  overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;
  padding: 64px; background: #f4f2ee; color: #141414; font-family: system-ui, sans-serif; }
h1 { margin: 0; font-size: 72px; line-height: 1.05; }
p { margin: 0; font-size: 28px; color: #4d4d4d; }`;

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const card = (c) => `<!doctype html><html lang="en"><meta charset="utf-8"><style>${STYLE}</style>
<body><p><b>Shelf</b></p><div><p>${esc(c.kind)}</p><h1>${esc(c.title)}</h1></div></body></html>`;

export async function makeCards(cards, out) {
  mkdirSync(CACHE, { recursive: true });
  const keys = new Map(), todo = [];
  for (const c of cards) {
    const key = createHash('sha256').update(LOOK + JSON.stringify(c)).digest('hex').slice(0, 12);
    keys.set(c.path, key);
    if (!existsSync(`${CACHE}/${key}.jpg`)) todo.push([c, `${CACHE}/${key}.jpg`]);
  }
  if (todo.length) {
    const browser = await chromium.launch({ channel: 'chrome' });
    const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' });
    const worker = async () => {
      for (let job; (job = todo.pop()); ) {
        const page = await context.newPage();
        await page.setContent(card(job[0]), { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: job[1], type: 'jpeg', quality: 86 });
        await page.close();
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker)); // six pages at a time
    await browser.close();
  }
  const urls = {};
  for (const [path, key] of keys) {
    const name = `og/${path || 'index'}.${key}.jpg`;
    mkdirSync(dirname(`${out}/${name}`), { recursive: true });
    copyFileSync(`${CACHE}/${key}.jpg`, `${out}/${name}`);
    urls[path] = `/${name}`;
  }
  const kept = new Set(keys.values());
  for (const f of readdirSync(CACHE)) if (!kept.has(f.slice(0, -4))) rmSync(`${CACHE}/${f}`);
  return urls;
}
```

`makeCards([{ path: 'docs/install', kind: 'Docs', title: 'Installation' }], 'site')` returns `{ 'docs/install': '/og/docs/install.<hash>.jpg' }`. Prefix the site's address and that is the `og:image`.

- **The viewport is the card.** A context of 1200 by 630 makes the screenshot exactly the picture, with nothing to crop.
- **No motion.** `reducedMotion: 'reduce'` makes the page match `prefers-reduced-motion: reduce`: animations written for `no-preference` do not run, and the rules written for `reduce` apply, so nothing is caught halfway.
- **The font first.** `document.fonts.ready` waits until the web fonts the page uses have loaded, so the screenshot is taken in the font the card was designed in.
- **Six at a time.** One browser and one context, with six pages open at most. Tray UI uses the same number.
- **`channel: 'chrome'`** uses the Google Chrome installed on the machine; Tray UI's build does the same, and its `requirements.txt` says to install it with `python3 -m playwright install chrome`.

## Linking the real stylesheet

`setContent()` gives the page no address, so a link to `/tokens.css` has nothing to resolve against. Tray UI gives every card a made-up origin, `https://og.local`, and answers its requests from the disk. No server runs, and the cards link files by the same paths as the site:

```js
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

await context.route('https://og.local/**', async (route) => {
  const path = decodeURIComponent(new URL(route.request().url()).pathname);
  if (path.startsWith('/__card/')) {
    return route.fulfill({ body: docs.get(path.slice(8)), contentType: 'text/html; charset=utf-8' });
  }
  const file = join('site', path);
  if (existsSync(file) && statSync(file).isFile()) return route.fulfill({ path: file });
  return route.fulfill({ status: 404, body: '' });
});
await page.goto(`https://og.local/__card/${key}`, { waitUntil: 'load' });
```

`docs` is a `Map` from each card's key to its HTML. Given a `path`, `route.fulfill()` sends the file with a content type taken from its extension: in a test, the stylesheets came back as `text/css`, the script as `application/javascript`, and the font that `tokens.css` names as `font/woff2`. A block's card holds an `iframe` whose address, under `/__block/`, is answered with the block's HTML the same way.

## Fitting a live preview

A preview is as wide as it needs to be, and the card's panel is not. After the page loads, Tray UI measures the preview, overflow included, and scales it down until it fits, never up:

```js
const box = document.querySelector('.og__show');
const fit = box.querySelector('.og__fit');
const w = Math.max(fit.offsetWidth, fit.scrollWidth), h = Math.max(fit.offsetHeight, fit.scrollHeight);
if (w > fit.offsetWidth) fit.style.inlineSize = w + 'px';
const k = Math.min(1, (box.clientWidth - 16) / w, (box.clientHeight - 16) / h);
fit.style.transform = 'translate(-50%, -50%) scale(' + k + ')';
```

A block is drawn in a frame 1280 pixels wide and 800 high, scaled by the panel's width over 1280, so the card shows the top of the screen as a desktop window would. After the fit, Tray UI waits 150 milliseconds, or 400 for a block, before the screenshot.

## A cache that redraws only what changed

A browser takes a moment for each card, and most cards are the same from one build to the next. The key of a card is a hash of everything that changes how it looks: in Tray UI, a version string for the template, the three built files, the card's data as JSON with its keys sorted, and for a block, its HTML. A card whose key is already in `.cache/og/` is copied, and only new keys are drawn. In the example above, 31 cards were drawn on the first run, none on the second, and one after one title changed.

Two details make the cache safe:

1. **The template is not in the hash.** Tray UI puts a constant in the key instead, `VERSION = '2'`, and the comment beside it says to change it "to draw every card again after the look of the cards changes". Anything else that alters the picture and is not in the key needs the same treatment.
2. **Old cards go.** After a build, every file in the cache that no page uses is deleted, so the cache never holds more than the site shows.

## Names that change with the picture

The picture of a page is written as `_/og/<address>.<key>.jpg`: the Button's is `_/og/components/button.bb857b024d36.jpg`. A changed card has a new key, so a new name, and a name never holds a different picture. That lets the host keep them for a year. Tray UI's `_headers` file says so for everything under `_/`:

```text
/_/*
  Cache-Control: public, max-age=31536000, immutable
```

The page's `og:image` follows the new name at the next build.

## The size of the files

The build measured here wrote 211 cards, 8.3 MB together. The median card is 38 KB; the smallest, Kbd, is 19 KB, and the largest, Video Player, 100 KB. Blocks, which show a whole screen, average 50 KB; components average 35 KB.

JPEG at quality 86 is smaller than PNG for these cards, though not by much. Three cards drawn again with the build's own template, once in each format:

| Card | PNG | JPEG, quality 86 |
| --- | --- | --- |
| Button | 44.7 KB | 38.4 KB |
| Data Table | 53.5 KB | 45.8 KB |
| Kbd | 22.0 KB | 19.2 KB |

Every one is far below the 5 MB limit. Before trusting a template, draw the card of the longest title on the site: a title that wraps to one more line than planned pushes the text past the bottom edge, and `overflow: hidden` cuts it off without an error.

## When Chrome is not there

A build should not fail for want of a picture. `tools/og.py` imports Playwright inside a `try`; without it, the site is built with no cards and the build says so: "Playwright is not installed, so the pages have no picture for links". If Chrome does not start, the same happens, and the note carries the first line of the error. The pages then carry `twitter:card` set to `summary` and no `og:image` lines. The cache is left as it was, so the next build that can start Chrome draws only the cards it lacks.

## Open Graph images in Tray UI

`tools/site.py` copies the system's three files into the site first, then hands `tools/og.py` one card for each page: its address, its kind, its title, its summary line, and for a component the preview with its script, or for a block its name. `og.make()` returns the address of each picture, and the page template fills in the tags of every page written after it. The head of [Button](#c-button) names a card with its live preview, [Dashboard](#b-dashboard-01) one with the top of the screen, and [Installation](#d-installation) one with its name and summary.
