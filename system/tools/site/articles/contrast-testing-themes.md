# Testing colour contrast in every theme

Test WCAG colour contrast in every theme automatically: rules for token pairs measured in Node, then the text of real pages measured on its ground in a browser.

A theme can break contrast in places nobody looks. With ten themes, 108 components and 64 blocks, nobody looks at every pair by hand, so Tray UI measures contrast in two ways, both automatic and both run on every change. The tokens are measured by rules, before anything is drawn. The pages are measured in a browser, piece of text by piece of text, on the colour each one actually sits on. Each kind of test finds what the other misses.

## The thresholds

Three success criteria of WCAG 2.2 set the numbers.

| Criterion | Level | What it asks |
| --- | --- | --- |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | AA | 4.5:1 for text, 3:1 for large-scale text |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) | AA | 3:1 against adjacent colours for what identifies a control and its state, and for the parts of a graphic needed to understand it |
| [1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html) | AAA | 7:1 for text, 4.5:1 for large-scale text |

Large-scale text is at least 18 point, or 14 point bold. In CSS pixels that is 24px, or about 18.7px in bold. Text that is "part of an inactive user interface component", pure decoration, or not visible to anyone has no requirement, and neither does a logo. The ratio is compared as it is: the Understanding document says the values "should not be rounded (e.g., 4.499:1 would not meet the 4.5:1 threshold)". The formula itself, in JavaScript, is in [the four-colour article](#a-colour-theme-from-four-colours).

## Write the pairs down as rules

A token test needs to know which colour is read on which. Tray UI writes that down in `tools/site/theme.js` as a list of rules: a token, the grounds it is read on, the least contrast it needs there, and a note.

```js
var NEEDS = [
  ['ink', ['page', 'surface', 'raised', 'leaf'], 10, 'Text'],
  ['ink-soft', ['page', 'surface', 'raised', 'leaf'], 6.6, 'Secondary text'],
  ['ink-muted', ['page', 'surface', 'raised', 'leaf'], 4.5, 'Captions and hints'],
  ['ink-hint', ['page', 'surface', 'raised'], 4.5, 'Axis ticks and placeholders'],
  ['control-off', ['page', 'surface'], 3, 'An unselected ring, an off switch'],
  ['on-accent', ['accent'], 4.5, 'Text on the accent'],
  // … 32 rules in all
];
```

The 32 rules make 66 pairs. Most need the WCAG minimum, and some sit above it: `ink` and `on-inverse` need 10:1, `on-dark-soft` 7:1 and `ink-soft` 6.6:1. `control-off` is the one rule for non-text contrast, at 3:1 for the edge of an unselected control.

The list of grounds is also a promise about use. `ink-hint` has no rule on `leaf`, and its note in `tokens.json` says so: "Not for text on `leaf` or `inverse`, where it falls below 4.5:1." The [Accessibility](#g-accessibility) guide repeats it. The rules shape the components too. `control-off` has no rule on `raised`, so a floating panel sets the colour of its off switches and unselected rings to `ink-hint`, which has one: `.tray-raised { --tray-off: var(--ink-hint); }`. A rule list states what the system allows; the page test, further down, finds where a page does something else.

## Measure every theme in Node

With the rules written down, a script can measure every pair in every theme in well under a second. This one reads a built `tokens.css`, takes each theme rule from it, and exits with an error when a pair falls short:

```js
// node check-themes.mjs tokens.css: measures every rule in every theme, and fails when one is missed
import { readFileSync } from 'node:fs';

const RULES = [
  // token, the grounds it is read on, the least contrast
  ['ink', ['page', 'surface', 'raised', 'leaf'], 10],
  ['ink-muted', ['page', 'surface', 'raised', 'leaf'], 4.5],
  ['ink-hint', ['page', 'surface', 'raised'], 4.5],
  ['control-off', ['page', 'surface'], 3],
  ['on-accent', ['accent'], 4.5],
  ['danger', ['page', 'surface', 'raised'], 4.5],
];

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// each theme rule at the start of a line, its name and its colours (the indented rules inside @media are left out)
const css = readFileSync(process.argv[2], 'utf8');
const themes = {};
for (const [, name, body] of css.matchAll(/^(?::root, )?\[data-theme="([\w-]+)"\] \{([^}]*)\}/gm)) {
  themes[name] = Object.fromEntries([...body.matchAll(/--([\w-]+): (#[0-9a-f]{6});/g)].map((m) => [m[1], m[2]]));
}
const first = Object.values(themes)[0];

let pairs = 0, missed = 0;
for (const [name, own] of Object.entries(themes)) {
  const t = { ...first, ...own }; // a theme rule sets what differs; the rest is the first theme's
  for (const [token, grounds, need] of RULES) {
    for (const ground of grounds) {
      const ratio = contrast(t[token], t[ground]);
      pairs += 1;
      if (ratio < need) {
        missed += 1;
        console.log(`${name}: ${token} on ${ground} is ${ratio.toFixed(3)}:1, needs ${need}:1`);
      }
    }
  }
}
console.log(`${Object.keys(themes).length} themes, ${pairs} pairs, ${missed} missed`);
process.exitCode = missed ? 1 : 0;
```

On Tray UI's `dist/tokens.css` it prints `10 themes, 170 pairs, 0 missed`. Give Linen a deep blue accent, `#1d4ed8`, and it prints `linen: on-accent on accent is 2.749:1, needs 4.5:1` and exits with 1, which stops a CI job.

Tray UI's own check is `python3 tools/themes.py --check`. It runs the report of `theme.js` in Node, over the values in `tokens.json`, for all 66 pairs, and prints one line per theme with its tightest pair:

```text
light     66 rules, 0 missed; the tightest: ink-hint on surface 4.73 (needs 4.5)
dark      66 rules, 0 missed; the tightest: ink-soft on leaf 6.61 (needs 6.6)
linen     66 rules, 0 missed; the tightest: ink-hint on surface 4.73 (needs 4.5)
lilac     66 rules, 0 missed; the tightest: paper-danger on accent 4.60 (needs 4.5)
midnight  66 rules, 0 missed; the tightest: ink-soft on leaf 6.62 (needs 6.6)
```

The tightest pair is the one to watch: in Dark, secondary text on `leaf` holds its rule by about 0.01. The check is the third step of `tools/check.py`, which CI runs. Without `--check`, the same script derives the eight themes that are not tuned by hand, and writes nothing if any of them misses a rule. The [Themes](#d-themes) page runs the same report as you make a theme, under **Does it hold?**.

## Measure the text on the page

Rules only see the pairs they list. Put a hint in a leaf card and no rule covers it:

```html
<div class="tray-card tray-card--leaf">
  <p class="tray-hint">Picked on Monday</p>
</div>
```

That is `ink-hint` on `leaf`, at 4.19:1 in Light and 3.37:1 in Dark. To catch it, measure what the browser draws. For each piece of text, take its computed colour, find the colour behind it, and measure the two:

```js
// Run in the page: every piece of text measured on the colour behind it, as far as the DOM can tell
export function lowContrast() {
  const rgba = (s) => s.match(/[\d.]+/g).map(Number);
  const alpha = (c) => (c.length > 3 ? c[3] : 1);
  const over = (top, under) => [0, 1, 2].map((i) => top[i] * alpha(top) + under[i] * (1 - alpha(top)));
  const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ground = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (alpha(c) > 0) layers.push(c);
      if (alpha(c) === 1) break;
    }
    return layers.reduceRight((under, top) => over(top, under), [255, 255, 255]);
  };
  const low = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node; (node = walker.nextNode()); ) {
    const text = node.textContent.trim(), el = node.parentElement, cs = getComputedStyle(el);
    if (!text || cs.visibility === 'hidden' || !el.getClientRects().length) continue;
    if (el.closest('[hidden], :disabled, [aria-disabled="true"], [inert], svg')) continue;
    const bg = ground(el), fg = over(rgba(cs.color), bg);
    const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    const ratio = (hi + 0.05) / (lo + 0.05);
    const size = parseFloat(cs.fontSize);
    const large = size >= 24 || (Number(cs.fontWeight) >= 700 && size >= 18.66);
    if (ratio < (large ? 3 : 4.5)) low.push(`${ratio.toFixed(2)}:1 "${text.slice(0, 30)}"`);
  }
  return low;
}
```

- **The ground** is the first opaque background up the tree, with any translucent ones above it laid over it in turn. With none, it is white, which is what WCAG assumes when no background is set.
- **The text colour** is laid over that ground too, so a translucent ink is measured as it looks.
- **What is skipped** is what WCAG exempts or nobody sees: hidden text, disabled and inert controls. Text inside SVG is skipped too, since its colour is its `fill`.

Playwright opens the page, sets each theme in turn, and runs the function there. This also runs every theme with more contrast:

```js
// node check-pages.mjs http://localhost:8000/ … : every page in every theme, and with more contrast
import { chromium } from 'playwright';
import { lowContrast } from './contrast-on-page.js';

const THEMES = ['light', 'dark', 'linen', 'mint', 'sky', 'rose', 'lilac', 'midnight', 'forest', 'espresso'];
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
let failures = 0;
for (const url of process.argv.slice(2)) {
  await page.goto(url);
  for (const contrast of ['no-preference', 'more']) {
    await page.emulateMedia({ contrast });
    for (const theme of THEMES) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      for (const line of await page.evaluate(lowContrast)) {
        failures += 1;
        console.log(`${url} [${theme}, contrast ${contrast}] ${line}`);
      }
    }
  }
}
await browser.close();
console.log(failures ? `${failures} pieces of text below their contrast` : 'all text holds its contrast');
process.exitCode = failures ? 1 : 0;
```

On a page with the leaf card above, it reports the hint in all ten themes, from 3.33:1 in Espresso to 4.38:1 in Linen, and exits with 1. With more contrast it reports nothing, because the hint then takes the value of `ink-muted`, which holds 4.5:1 on `leaf`.

## What the DOM cannot tell

The function walks up the tree, and a page is painted in layers that the tree does not always show. Keep its limits in mind when it passes.

- **A ground from a sibling.** The chosen segment of a segmented control and the chosen tab sit on a sliding pill, an element beside them. Tray UI's check knows that pill, `.tray-glide`, and measures the chosen item on it. Anything else positioned under text needs the same care.
- **Images and gradients.** The function reads `background-color` only. Text over a photo or a gradient needs a look, or a screenshot to measure.
- **Opacity, filters and blending** on an ancestor change what is painted and are not counted. Tray UI's check skips text whose own element is under half opacity.
- **States.** It measures what is on the page when it runs. A hover, an open menu or an error message is measured only if the test opens it.
- **Non-text contrast.** It reads text. For 1.4.11 there is the `control-off` rule, and the rest is a person looking.

## Contrast checks in Tray UI

Tray UI's page check is `CONTRAST_JS` in `tools/shoot.py`, and four tools run it.

| Tool | What it opens | Themes |
| --- | --- | --- |
| `tools/shoot.py` | each of the 108 component previews | Light and Dark; all ten with `--themes all` |
| `tools/play_check.py` | every variant of the 52 component playgrounds | Light and Dark |
| `tools/pages.py` | each of the 64 blocks, at 1280, 768 and 390 pixels wide | Light and Dark |
| `tools/site_check.py` | 15 pages of the site in Light and Dark, and 6 in each of the other eight themes | all ten |

Each tool exits with an error on any text it reports, and `tools/check.py` runs them all in CI, after `themes.py --check`. On demand, `shoot.py --media contrast` renders the previews with more contrast. It also differs from the short version above. It reports text only when it is more than 0.05 under its need. It skips skeletons, visually hidden text and anything marked `data-no-contrast`. Its luminance step is 0.03928, the value WCAG used before May 2021. WCAG's note on the change says it "has no practical effect on the calculations".

The rules, and the way a theme maker moves a grey until it holds, are in [Generate an accessible colour theme from four colours](#a-colour-theme-from-four-colours). What more contrast does to each grey is in [prefers-contrast: more](#a-prefers-contrast-more), and the [Accessibility](#g-accessibility) guide has the rules for using the tokens.
