# CSS prefers-contrast: more, one grey step up

Answer prefers-contrast: more in CSS by moving each grey token one step towards the ink and giving fills an edge, then test it in DevTools and Playwright.

Some people ask their system for more contrast. Firefox's documentation says its `more` state "is triggered when a user has macOS's 'Increase Contrast' setting enabled", and MDN says user agents "are likely to rely on the settings provided by the operating system". A page answers with one media query. Tray UI's answer has two parts, both in CSS: each grey takes the value its theme already gives the next step towards the ink, and every control or tray drawn as a fill gets a thin edge.

## What the media feature says

`prefers-contrast` is defined in Media Queries Level 5 and has four values.

| Value | The specification says |
| --- | --- |
| `no-preference` | "the user has made no preference known to the system" |
| `more` | the user prefers "an interface that has a higher level of contrast" |
| `less` | the user prefers "an interface that has a lower level of contrast" |
| `custom` | the user wants "a specific set of colors", whose contrast matches neither `more` nor `less` |

In a boolean context, `@media (prefers-contrast)`, every value but `no-preference` is true, `less` included. The specification warns that "using an unqualified `@media (prefers-contrast) { … }` to apply high contrast styles is incorrect and user-hostile". Name the value: `@media (prefers-contrast: more)`.

The feature also meets forced colours. When forced colours are active, the browser "must also match one of prefers-contrast: more or prefers-contrast: less" if it can tell that the chosen palette has a particularly high or low contrast, and `custom` otherwise. Firefox's documentation puts its line at a ratio "higher than 7:1" between the chosen foreground and background. So a more-contrast rule can also apply under Windows high contrast. There the browser replaces most of the page's colours and, MDN says, forces `box-shadow` to `none`, so the edges below do not show, and Tray UI draws that mode's edges in a separate `forced-colors` block. MDN lists `prefers-contrast` as Baseline, widely available since May 2022.

## What more contrast should change

Two things in a quiet design fall short for someone who asks for more.

- **Grey text.** WCAG's level AA asks 4.5:1 for text, and many designs set captions and hints close to that line. Level AAA, [1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html), asks 7:1. A person who asks for more contrast is better served by the higher figure.
- **Faint edges.** A hairline at 1.37:1 groups a list for most eyes and disappears for some. A field drawn as a pale fill on a white page is a shape at 1.11:1. [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) asks 3:1 for what identifies a control, and that is a useful target for every edge in this mode.

Colours that carry a brand, such as the accent, can stay. They are fills behind dark text, and the text on them already holds its own contrast.

## One step along the scale

Tray UI's greys are steps on a line from the tray to the ink, each placed at a contrast with the page; [the four-colour article](#a-colour-theme-from-four-colours) shows how. With more contrast, each step takes the value of a step further along. In Light, measured on the page:

| Token | Usually | With more contrast | Takes the value of |
| --- | --- | --- | --- |
| `ink-soft` | `#4a4a46`, 8.9:1 | `#141414`, 18.42:1 | `ink` |
| `ink-muted` | `#5c5c57`, 6.72:1 | `#4a4a46`, 8.9:1 | `ink-soft` |
| `ink-hint` | `#6e6c66`, 5.25:1 | `#5c5c57`, 6.72:1 | `ink-muted` |
| `control-off` | `#8a8882`, 3.54:1 | `#6e6c66`, 5.25:1 | `ink-hint` |
| `rule-strong` | `#b5b3ac`, 2.1:1 | `#6e6c66`, 5.25:1 | `ink-hint` |
| `hairline` | `#dedcd6`, 1.37:1 | `#8a8882`, 3.54:1 | `control-off` |
| `track` | `#d9d7d0`, 1.44:1 | `#b5b3ac`, 2.1:1 | `rule-strong` |

Three more move on the ink card: `on-dark-soft` takes `on-inverse`, `on-dark-muted` takes `on-dark-soft`, and the rule colour `dark-rule` takes `on-dark-muted`.

Most steps move by one. Two move further, on purpose. The hairline jumps past `track` and `rule-strong` to the value of `control-off`, so a dividing line and the edge of a field reach 3:1: across the ten themes, 3.17:1 or more on the page and on the tray. On a floating panel of a dark theme `control-off` reaches only 2.86:1, so in Dark, Midnight, Forest and Espresso the hairline goes one step further, to `ink-hint`, 4.53:1 or more there; the build checks each theme and takes the next step where a rule falls short. `rule-strong` then moves two steps, to `ink-hint`, and stays stronger than the hairline. The yellow card has greys of its own, and its hairline and track take `paper-soft`, which reads 4.6:1 or more on the accent of every theme.

Measured across all ten themes, on the grounds their rules name, `ink-soft` becomes the ink and reads 10:1 or more everywhere. `ink-muted` reads at least 7.98:1 on the page, the tray and floating panels, and 6.61:1 on the green `leaf`. `ink-hint` reads at least 6.02:1. Secondary text and captions reach the AAA figure on the main grounds; hints come close to it.

## Why the values are written out

The short way to write this is a chain of aliases:

```css
@media (prefers-contrast: more) {
  :root {
    --ink-soft: var(--ink);
    --ink-muted: var(--ink-soft);
    --ink-hint: var(--ink-muted);
  }
}
```

In Chrome, all three come out as `#141414`. Custom properties on one element resolve against each other, so `--ink-muted: var(--ink-soft)` reads the new `--ink-soft`, which is already the ink, and the whole scale collapses into one colour. Each step has to point at a value the media rule leaves alone.

Tray UI writes the values themselves. `tools/build.py` has the list of ten pairs above, and for each of the ten themes writes the value that theme gives the step a grey moves to:

```css
@media (prefers-contrast: more) {
  :root, [data-theme="light"] {
    --ink-soft: #141414;
    --ink-muted: #4a4a46;
    --ink-hint: #5c5c57;
    --control-off: #6e6c66;
    --rule-strong: #6e6c66;
    --hairline: #8a8882;
    --track: #b5b3ac;
    --on-dark-soft: #ffffff;
    --on-dark-muted: #c9c7c0;
    --dark-rule: #a8a69f;
  }
  [data-theme="dark"] {
    --ink-soft: #f4f3f0;
    --ink-muted: #c9c7c0;
    /* … and the other eight themes */
  }
}
```

The block comes after the theme rules in `tokens.css` and uses the same selectors, so it wins in every theme, also on a part of the page that names a theme of its own: in Chrome, a `data-theme="dark"` section on a Light page takes the Dark theme's values. The values are already the theme's, so the greys keep its tint, and nothing new needs measuring: each text grey takes the value of a step whose own rule is at least as strict, on the same grounds. The whole block is ten small rules, about 3 KB.

Without a build step, the same works with a second set of names. Keep the raw steps as `--grey-1` to `--grey-9` in each theme rule, and point the role names at them, in both modes, on `:root, [data-theme]`: `--ink-soft: var(--grey-7)` usually and `var(--grey-9)` with more contrast. Nothing in the media rule then changes a name another line reads. Tray UI keeps one set of names and lets the build write the numbers. A theme made on the [Themes](#d-themes) page gets the same block for its own colours.

## Give every fill an edge

Most of Tray UI is fills with no edge: a tray on the page, a field filled with the tray. With more contrast, `src/css/95-modes.css` draws a 1px edge inside 40 of them, from fields and quiet buttons to cards, badges and tab strips:

```css
@media (prefers-contrast: more) {
  .tray-input, .tray-select-trigger, .tray-btn--quiet, .tray-tabs, .tray-card, .tray-badge /* and 34 more */ {
    box-shadow: inset 0 0 0 1px var(--hairline);
  }
  /* the accent is bright but light: on a pale page its edge is drawn in its own ink */
  .tray-btn:not(.tray-btn--quiet, .tray-btn--ghost, .tray-btn--link, .tray-btn--dark, .tray-btn--danger),
  .tray-card--accent, .tray-island, .tray-badge--accent { box-shadow: inset 0 0 0 1px var(--on-accent); }
  /* what floats keeps its shadow and gains a ring */
  .tray-pop, .tray-dialog, .tray-sheet, .tray-drawer, .tray-toast, .tray-command, .tray-raised {
    box-shadow: var(--shadow-float), 0 0 0 1px var(--hairline);
  }
  .tray-check__box, .tray-radio__ring { border-width: 2px; }
  .tray-switch__track { box-shadow: inset 0 0 0 1px var(--ink); }
}
```

- **The edge is the hairline**, which this mode moves to the value of `control-off`, or of `ink-hint` in the four dark themes. That one token change brings the edges to 3:1 on the page, the tray and floating panels, in every theme.
- **An inset shadow changes no size.** It is painted inside the box, over the fill, so a field stays 56px high and nothing on the page moves when the setting changes.
- **The accent is bright but light**, so on a pale page its edge is drawn in its own ink, `on-accent`, and a yellow button or card ends in a dark line.

## Test it

In Chrome, open DevTools, then the Rendering tab, and choose `prefers-contrast: more` under **Emulate CSS media feature prefers-contrast**. The same menu has `less` and `custom`.

Playwright emulates it as well: `page.emulateMedia({ contrast: 'more' })` in JavaScript, `page.emulate_media(contrast='more')` in Python. The supported values are `'more'` and `'no-preference'`. This test reads two tokens and the edge of a field, before and after:

```js
// node more-contrast.test.mjs http://localhost:8000/form.html
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto(process.argv[2]);
const read = () => page.evaluate(() => {
  const root = getComputedStyle(document.documentElement);
  return {
    ink: root.getPropertyValue('--ink').trim(),
    inkSoft: root.getPropertyValue('--ink-soft').trim(),
    edge: getComputedStyle(document.querySelector('.tray-input')).boxShadow,
  };
});

const usual = await read();
await page.emulateMedia({ contrast: 'more' });
const more = await read();
assert.notEqual(usual.inkSoft, usual.ink);
assert.equal(more.inkSoft, more.ink); // secondary text takes the ink
assert.equal(usual.edge, 'none');
assert.match(more.edge, /inset/); // the field gets an edge
await browser.close();
console.log('more contrast: ok', more);
```

On a page with Tray UI's two stylesheets it passes, and the edge reads `rgb(138, 136, 130) 0px 0px 0px 1px inset`, the Light hairline in this mode. Leave out `bundle.css` and the last assertion fails. Tray UI's own `tools/smoke.py` makes the same check on the Input preview: `--ink-soft` equals `--ink`, `--ink-muted` is `#4a4a46`, and the field has an inset edge. To measure every piece of text in this mode as well, run a page check with the media emulated, as [Testing colour contrast in every theme](#a-contrast-testing-themes) does.

A script that draws, such as a chart on a canvas, can ask too: `matchMedia('(prefers-contrast: more)').matches`, with a `change` listener for a setting changed while the page is open.

## More contrast in Tray UI

- There is nothing to turn on. `tokens.css` holds the greys for every theme, and `components/bundle.css` holds the edges; both answer the setting by themselves.
- A theme you make on the [Themes](#d-themes) page carries its own `@media (prefers-contrast: more)` rule, made the same way from its own steps.
- The [Accessibility](#g-accessibility) guide describes this mode beside forced colours and print. For Windows high contrast and other forced palettes, see [Forced colours mode: fills become edges](#a-forced-colors-mode).
