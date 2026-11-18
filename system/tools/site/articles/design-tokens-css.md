# Design tokens in plain CSS custom properties

Design tokens as CSS custom properties in one file: colour, type, space, shape and motion, how components read them, and the same tokens for Tailwind and Figma.

A design token is a named design decision: the colour of secondary text, the corner of a card, the height of a button, the length of a fade. Components refer to the name, and the value lives in one place. In plain CSS a token is a custom property. The browser does the rest: the property inherits, and any rule can read it with `var()`.

Tray UI keeps every token in one file, `tokens.css`, and whoever uses it needs no build step. Behind it is one JSON source, which also becomes a Tailwind theme and Figma variables.

## One file of tokens

The colours are declared on `:root`, which matches the `<html>` element, so every element on the page inherits them. The rest of the scale follows in a second `:root` rule.

```css
:root, [data-theme="light"] {
  color-scheme: light;
  --page: #ffffff;
  --surface: #f4f3f0;
  --ink: #141414;
  --ink-soft: #4a4a46;
  --hairline: #dedcd6;
  --accent: #ffd426;
  --on-accent: #141414;
  /* and 53 more colours, and the shadow */
}
:root {
  --space-4: 16px;
  --space-8: 32px;
  --radius-card: 40px;
  --radius-button: 20px;
  --size-lg: 64px;
  --size-hit: 44px;
  --title-size: clamp(1.75rem, 0.25rem + 2.6vw, 2.5rem);
  --duration-press: .15s;
  --ease: cubic-bezier(.2, .8, .2, 1);
  --font-sans: Onest, "Helvetica Neue", Arial, sans-serif;
  /* and the rest of the scale */
}
```

Counted in `project/tokens.json`, the source of the file, Tray UI has 116 tokens.

| Family | Tokens | Examples |
| --- | --- | --- |
| Colour | 60 | `page`, `surface`, `ink-soft`, `accent`, `danger`, `data-1` |
| Shadow | 1 | `shadow-float` |
| Space | 12 | `space-1` (4px) to `space-16` (64px) |
| Corners | 8 | `radius-card` (40px) to `radius-mark` (4px), and `radius-pill` |
| Sizes | 7 | `size-lg` (64px), `size-hit` (44px), `size-icon` (20px) |
| Layout | 6 | `container`, `page-pad`, `card-pad`, `measure` |
| Fluid type | 5 | `display-size` to `figure-size`, each a `clamp()` |
| Motion | 8 | five durations, and the curves `ease`, `ease-exit` and `ease-spring` |
| Layers | 4 | `z-sticky` to `z-toast` |
| Breakpoints | 4 | `bp-phone` (34rem) to `bp-header` (76rem) |
| Opacity | 1 | `opacity-disabled` |

The file also writes the two font stacks as `--font-sans` and `--font-mono`, so it declares 118 custom properties in all. Type styles are classes: 15 of them, from `.display` to `.kbd`, each setting a size, a line height and a weight together, and a tracking where the style has one. The five heading sizes are tokens as well, because they grow with the width of the window. With all ten themes, the file is about 16 KB, and about 3 KB compressed.

## Name a token for its job

A name such as `grey-600` says what a colour is. `ink-muted` says what it is for: captions and hints. Only the second still fits in a dark theme, where the caption colour is a light grey. Tray UI names every token for its job: `surface` is the tray every resting card sits on, `size-hit` is the smallest target a finger has to hit, `radius-panel` is the corner of a panel inside a card.

Each token in `tokens.json` carries a usage note beside its value, and the note is part of the system. `radius-pill` is for "Meters, sliders and the switch only." A note like that keeps a token out of places it was never meant for. The [Colours](#f-colours) page shows each colour's note beside its swatches.

## How components read them

A component rule names tokens and holds no colour of its own. This is the start of Tray UI's button:

```css
.tray-btn {
  gap: var(--space-4);
  min-block-size: var(--size-lg);
  padding: 0 var(--space-8);
  border-radius: var(--radius-button);
  background: var(--accent);
  color: var(--on-accent);
  font: 600 1.1875rem/1.1 var(--font-sans);
  transition: filter var(--duration-press) ease, transform var(--duration-press) ease;
}
```

Counted in `src/css`, the stylesheet of the components reads a token 1,813 times and names 111 of the 118. It holds no hex value and a single colour function: the dimmed backdrop behind a dialog, a sheet or a drawer in forced colours mode. The seven tokens it never names are the four breakpoints, `paper-muted`, `space-16` and `z-overlay`.

Tokens combine with `calc()`. An extra small button is 40px high to the eye and 44px to a finger, because a pseudo-element reaches past its edge by half the difference:

```css
.tray-btn--xs { position: relative; }
.tray-btn--xs::before {
  content: "";
  position: absolute;
  inset: calc((var(--size-xs) - var(--size-hit)) / 2); /* -2px on every side */
}
```

A component also needs to know what it sits on. A quiet button is filled with the tray when it sits on the page, and with the page when it sits on a tray. Tray UI answers with a second layer of custom properties, local to the stylesheet and named `--tray-…`. `:root` sets `--tray-fill: var(--surface)`, a card sets `--tray-fill: var(--page)`, and the quiet button reads `background: var(--tray-fill)`. The button needs no class for where it is: the ground around it says so. [Grounds and nesting](#g-grounds) has the whole set.

## What a custom property cannot do

`var()` works in the value of a property and nowhere else. MDN's guide to custom properties says you cannot use it "for property names, selectors, or anything aside from property values, which means you can't use it in a media query or container query."

```css
/* Never matches: a media query cannot read a custom property */
@media (max-width: var(--bp-phone)) { … }

/* The value of bp-phone, written out */
@media (max-width: 34rem) { … }
```

In Chrome the first rule is kept, and its query never matches, at any width. Tray UI keeps its four breakpoints as tokens anyway, so that each width is written down once with a note, and writes the values out in its media queries: `34rem` appears in six of them. The Tailwind export below turns the same four into variants.

A custom property that refers to another is resolved on the element where it is declared. `:root { --tray-fill: var(--surface); }` stores the root's tray colour, and every element below inherits that colour, even inside a part of the page that wears another theme. [Ten themes from one stylesheet](#a-themes-one-stylesheet) shows the problem and the rule that fixes it.

A misspelt token fails quietly. `color: var(--ink-softer)` names nothing, so the declaration is invalid at computed-value time, and MDN says the property is then "treated as if it has value `unset`". The text takes its inherited colour and nothing says why. A build can catch it, as the next section shows.

## One source, three outputs

Tray UI writes its tokens once, in `project/tokens.json`. A colour token has a value for each theme and a note; any other token has one value and a note.

```json
{
  "name": "surface",
  "value": {
    "light": "#f4f3f0", "dark": "#1e1e1c", "linen": "#f4eee0", "mint": "#e7f3ec", "sky": "#e8f0f7",
    "rose": "#f8ecee", "lilac": "#f1eef8", "midnight": "#141d2e", "forest": "#102117", "espresso": "#241b13"
  },
  "usage": "Tray Grey / Night Tray. Every resting card, and the fill of inputs and controls that sit on `page` or `raised`."
}
```

`tools/build.py` turns it into `tokens.css`. The core of that step fits in a short Node script. Run on Tray UI's `tokens.json`, this one writes the same custom properties as the real `tokens.css`, rule for rule, and exits with an error when a stylesheet given after it reads a name that is not a token:

```js
// node build-tokens.mjs tokens.json bundle.css …
import { readFileSync, writeFileSync } from 'node:fs';

const tok = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const themes = tok.color.themes.map((t) => t.id);
const first = themes[0];
const themed = [...tok.color.tokens, ...tok.shadow.tokens];
const valueIn = (t, theme) => (typeof t.value === 'string' ? t.value : t.value[theme] ?? t.value[first]);
const rule = (selector, rows) => `${selector} {\n${rows.map((r) => `  ${r};`).join('\n')}\n}`;

// the first theme on :root, then every other theme as a rule on its attribute
const out = [rule(`:root, [data-theme="${first}"]`, themed.map((t) => `--${t.name}: ${valueIn(t, first)}`))];
for (const theme of themes.slice(1)) {
  // every token that differs between themes, even where this theme has the first theme's value
  const rows = themed.filter((t) => typeof t.value !== 'string').map((t) => `--${t.name}: ${valueIn(t, theme)}`);
  out.push(rule(`[data-theme="${theme}"]`, rows));
}
const scale = Object.entries(tok)
  .filter(([family, body]) => !['color', 'shadow', 'type'].includes(family) && body?.tokens)
  .flatMap(([, body]) => body.tokens.map((t) => `--${t.name}: ${t.value}`));
out.push(rule(':root', [...scale, ...Object.entries(tok.type.families).map(([k, v]) => `--font-${k}: ${v}`)]));

// every var() in the stylesheets must name a token, or one of the stylesheet's own --tray- properties
const defined = new Set(out.join('\n').match(/--[\w-]+(?=:)/g));
for (const file of process.argv.slice(3)) {
  for (const [, name] of readFileSync(file, 'utf8').matchAll(/var\((--[\w-]+)/g)) {
    if (!defined.has(name) && !name.startsWith('--tray-')) {
      console.error(`${file}: ${name} is not a token`);
      process.exitCode = 1;
    }
  }
}
writeFileSync('tokens.css', out.join('\n') + '\n');
console.log(`${defined.size} custom properties, ${themes.length} themes`); // 118 custom properties, 10 themes
```

The real build writes more: `color-scheme` in each theme, a second value for each grey under `prefers-contrast: more`, the light values for print, the type classes and the `@font-face` of the typeface. It also fails when a token name is used twice or holds a character it should not, and it reports every `var()` in the components, the blocks and the previews that names nothing.

## Tailwind and Figma from the same tokens

The same build writes two more folders, `dist/tailwind` and `dist/figma`.

For Tailwind CSS 4, `tailwind/theme.css` maps each token to a theme variable that reads it:

```css
@theme inline reference {
  --color-page: var(--page);
  --color-ink-soft: var(--ink-soft);
  --radius-card: var(--radius-card);
  --spacing-hit: var(--size-hit);
  /* and the rest */
}
```

`bg-page`, `text-ink-soft`, `rounded-card` and `h-hit` then exist as utilities. With the `inline` option, Tailwind's documentation says, "the utility class will use the theme variable value instead of referencing the actual theme variable", so `.bg-page` holds `var(--page)` itself. The colour is then looked up on the element that has the class, and a theme set on any element reaches the utilities inside it. For Tailwind 3, `tailwind/preset.cjs` gives the same names as a preset. [Tailwind and Figma](#d-tailwind-figma) has the setup.

For Figma, each theme becomes one file of 60 colour variables in the Design Tokens Community Group format. Dropped into one collection, the ten files become ten modes, so a frame switches theme as a page does. A second file holds the scale: space, corners, sizes, layout and breakpoints, type sizes and weights, the two font families, durations, layers and opacity. Figma takes px only, so a rem is counted at 16px and a `clamp()` takes its largest value. Each variable keeps the token's name and the first sentence of its note:

```json
{
  "surface": {
    "$type": "color",
    "$value": { "colorSpace": "srgb", "components": [0.9569, 0.9529, 0.9412], "alpha": 1, "hex": "#f4f3f0" },
    "$description": "--surface. Tray Grey / Night Tray."
  }
}
```

The shadow and the easing curves stay out: Figma has no variable for them.

## Tokens in Tray UI

- Link `tokens.css` before `components/bundle.css`, as [Installation](#d-installation) shows. Every rule of the components reads it.
- The values, with their notes, are on [Colours](#f-colours), [Typography](#f-type) and [Space and shape](#f-scale).
- To change a token, override it in a rule after `tokens.css`. [Theming](#d-theming) lists the rules that keep a retuned system working, such as keeping the corners in their order.
- A whole colour theme starts from four colours: [Generate an accessible colour theme from four colours](#a-colour-theme-from-four-colours).
- For a Tailwind 4 project, [Tray UI tokens in a Tailwind 4 project](#a-tailwind-4-tokens) goes further than the export above.
