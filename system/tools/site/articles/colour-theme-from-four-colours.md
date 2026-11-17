# Generate an accessible colour theme from four colours

Derive every colour token of a theme from a page, a tray, an ink and an accent: greys mixed in OKLab, each placed by its contrast, then checked against WCAG.

## Colour tokens and themes

A colour token is a named colour that components use in place of a value. In Tray UI each token is a custom property in `tokens.css`: a card's fill is `var(--surface)`, secondary text is `var(--ink-soft)`, and no component names a hex value.

A theme is a set of values for the same names. Switching theme changes the values and keeps the names, so every component follows. Tray UI has 60 colour tokens, listed in [Colours](#f-colours); 30 differ between themes, and the rest, such as `on-accent`, are the same in all of them. Your own rules follow the themes too:

```css
.order-note {
  background: var(--surface);
  color: var(--ink-soft);
  border-block-end: 1px solid var(--hairline);
}
```

Ten themes come with the system. Light and Dark were tuned by hand; the other eight were each derived from four colours by one engine, `tools/site/theme.js`. The [Themes](#d-themes) page runs the same file in the browser, so a theme made there follows the same rules as the built-in ones.

## The four colours

| Input | Token | What it is |
| --- | --- | --- |
| The page | `page` | The ground. A pale page makes a light theme, a dark page a dark one. |
| The tray | `surface` | Every resting card, and the fill of controls. Leave it out and it is derived from the page. |
| The ink | `ink` | Text. It needs 10:1 on the page, the tray, floating panels and `leaf`. |
| The accent | `accent` | The one loud colour. Ink text goes on it, so it must be bright. |

The page decides the mode: if white has more contrast with it than black, the theme is dark. The two are equal for a page of relative luminance 0.179, roughly. The mode picks a base, the hand-tuned Light or Dark theme. The four colours replace their own tokens, the greys are derived, and the rest, such as `danger`, `success`, `leaf` and the data colours, keep the values of the base.

## The greys are steps between the tray and the ink

Every other grey is a point on a straight line from the tray to the ink, chosen by its contrast with the page. The targets are the contrasts each step has in the hand-tuned Light and Dark themes.

| Token | What it is for | Light target | Dark target | In Linen |
| --- | --- | --- | --- | --- |
| `surface` | Cards | 1.11 | 1.13 | `#f4eee0`, given |
| `raised` | Floating panels | the page | 1.25 | `#fefaf1` |
| `inverse` | The ink card | the ink | 1.31 | `#1c140c` |
| `hairline` | Dividers | 1.37 | 1.39 | `#ded7ca` |
| `track` | A meter's empty part | 1.44 | 1.65 | `#d9d2c5` |
| `rule-strong` | A chart baseline, a grip | 2.1 | 2.52 | `#b6aea2` |
| `control-off` | An off switch | 3.54 | 3.6 | `#8c8479` |
| `ink-hint` | Placeholders | 5.25 | 5.69 | `#70685e` |
| `ink-muted` | Captions | 6.72 | 7.76 | `#60574d` |
| `ink-soft` | Secondary text | 8.9 | 11.17 | `#4e453c` |

The last column is what the engine derives from Linen's four colours: `#fefaf1`, `#f4eee0`, `#1c140c` and `#ffae4e`.

### Mixing in OKLab

The line runs through OKLab, a colour space made to be perceptually even: lightness on one axis (L), hue and its strength on the other two (a and b). A straight line in OKLab looks even, so a step between the tray and the ink keeps their tint, and a grey between a warm tray and a warm ink stays warm.

A mix is linear interpolation of the three coordinates. To reach OKLab, the sRGB channels are made linear, multiplied by a matrix, cube-rooted and multiplied by a second matrix; the way back reverses each step. The engine's functions, written shorter:

```js
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function toLab(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromLab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return '#' + rgb.map((c) => Math.round(Math.min(1, Math.max(0, gam(c))) * 255).toString(16).padStart(2, '0')).join('');
}

// The colour a share t of the way from a to b, mixed in OKLab
function mix(a, b, t) {
  const x = toLab(a), y = toLab(b);
  return fromLab(x.map((v, i) => v + (y[i] - v) * t));
}
```

CSS mixes the same way in the browser: `color-mix(in oklab, var(--surface), var(--ink) 40%)` is 40% of the way from the tray to the ink. CSS cannot search for a contrast, though, so the engine works in JavaScript and writes hex.

### Finding a step by its contrast

To place a step, the engine looks for the first colour on the line whose contrast with the page reaches the target. It treats contrast as rising towards the ink and halves the interval 24 times, far finer than one step of a hex value. `contrast()` is in the next section.

```js
// The first colour on the line from `from` to `to` whose contrast with `ground` reaches `ratio`
function along(from, to, ground, ratio) {
  if (contrast(from, ground) >= ratio) return from;
  if (contrast(to, ground) <= ratio) return to;
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {
    const t = (lo + hi) / 2;
    if (contrast(mix(from, to, t), ground) >= ratio) hi = t; else lo = t;
  }
  return mix(from, to, hi);
}
```

A tray you leave out is found the same way, on the line from the page to the ink. Every other step starts from the tray, so a tinted tray tints every grey. For a light theme:

```js
const LIGHT = { hairline: 1.37, track: 1.44, 'rule-strong': 2.1, 'control-off': 3.54, 'ink-hint': 5.25, 'ink-muted': 6.72, 'ink-soft': 8.9 };

function lightTheme(page, tray, ink, accent) {
  const t = { page, surface: tray, ink, accent, raised: page, inverse: ink };
  for (const [name, ratio] of Object.entries(LIGHT)) t[name] = along(tray, ink, page, ratio);
  return t;
}

lightTheme('#fefaf1', '#f4eee0', '#1c140c', '#ffae4e');
// ink-hint '#70685e', ink-muted '#60574d', ink-soft '#4e453c': the greys of Linen
```

In a light theme, floating panels take the page and the ink card takes the ink. `dark-rule`, the rule colour on the ink card, lies on the line from `inverse` to white, at 1.33:1 with `inverse`.

## Checking the contrast

WCAG 2.2 measures contrast from relative luminance: each sRGB channel made linear, then weighted 0.2126, 0.7152 and 0.0722. The ratio is the lighter luminance plus 0.05 over the darker plus 0.05, from 1 to 21.

```js
// The relative luminance of a #rrggbb colour, as WCAG 2.2 defines it
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// The contrast ratio of two colours, from 1 to 21
function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

contrast('#000000', '#ffffff'); // 21
contrast('#767676', '#ffffff'); // 4.54…, the lightest grey that passes 4.5:1 on white
```

WCAG does not round: 4.499:1 does not meet 4.5:1. The maker shows ratios cut to two decimals but decides on the exact figure.

[Success criterion 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) asks 4.5:1 for text and 3:1 for large text. [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) asks 3:1 against adjacent colours for what identifies a control and its state. Tray UI sets its minimums at those levels or above: 32 rules, each a token, the grounds it is read on and the least contrast it needs, which make 66 pairs to measure.

| Token | Read on | Needs |
| --- | --- | --- |
| `ink` | `page`, `surface`, `raised`, `leaf` | 10:1 |
| `ink-soft` | the same four | 6.6:1 |
| `ink-muted` | the same four | 4.5:1 |
| `ink-hint` | `page`, `surface`, `raised` | 4.5:1 |
| `control-off` | `page`, `surface` | 3:1 |
| `on-accent` | `accent` | 4.5:1 |
| `on-inverse` | `inverse` | 10:1 |
| `on-dark-soft` | `inverse` | 7:1 |
| The rest: status, code and ink-card colours | their grounds | 4.5:1 |

Each of the 10 themes holds all 66; `python3 tools/themes.py --check` measures them and writes nothing.

## When a pair fails

The four colours stay as you gave them. What moves depends on the token.

1. **A derived grey moves towards the ink.** A step is placed against the page but read on other grounds too. Give a white page a darker tray, `#e0ddd5`, and `ink-hint` at 5.25:1 on the page reads 3.87:1 on the tray. The engine mixes it towards the ink, with the same halving search, until its weakest ground holds: `#62625f`, 4.5:1 on the tray. `control-off` goes from 2.61:1 to 3.02:1. Only the four steps with rules move: `ink-soft`, `ink-muted`, `ink-hint`, `control-off`.
2. **The system's own colours move towards the text of their ground.** The status colours of the yellow and the ink card, and the code colours, keep their hue in every theme. Where a ground is too close to one, it moves towards `paper-ink`, `on-inverse` or `ink`, whichever is read there, until it reads 4.5:1. On the darker tray, the red of code keywords goes from 4.08:1 to `#bc232c` at 4.53:1.
3. **Anything else is reported.** Give Linen a deep blue accent, `#1d4ed8`, and the ink text on it reads 2.74:1. `on-accent` is the same in every theme, so nothing moves. The maker says 3 of 66 rules are missed, names up to three with their ratio and need, and advises moving the ink and the page further apart or making the accent brighter.

The maker still writes the CSS of a theme that misses a rule; the choice is yours. `tools/themes.py`, which writes the built-in themes, is stricter: if any theme misses a rule, it writes nothing.

## Dark themes

A dark page takes the Dark theme as its base, and the dark targets, each higher than its light one: `ink-soft` sits at 11.17:1, against 8.9:1. `raised` and `inverse` become steps on the same line, at 1.25:1 and 1.31:1 with the page, so floating panels and the ink card are a little lighter than the tray. The rule says `color-scheme: dark`, so the browser's own scrollbars and controls turn dark too, and the shadow takes its Dark value.

Midnight is page `#090f1c`, tray `#141d2e`, ink `#f2f7fd` and accent `#87d5ff`. Its `ink-soft` comes out as `#c1c8d0`, 11.34:1 on the page, a blue-grey with the tint of its page and ink. No theme is another one inverted.

The accent stays bright in a dark theme too. Accent surfaces keep the light palette in every theme and their text is the dark `on-accent`, so a dark accent misses its rule on any page.

## More contrast and forced colours

A theme's CSS carries a second rule inside `@media (prefers-contrast: more)`. Each grey takes the value its theme gives the next step towards the ink: `ink-soft` becomes `ink`, `ink-muted` becomes `ink-soft`, and so on down to `hairline` and `track`: ten tokens, three of them on the ink card. The values already belong to the theme, so the greys keep its tint and need no new search. `tokens.css` does the same for the built-in themes, and in that mode the stylesheet adds a 1px edge to trays, fields and quiet controls.

Forced colours, such as Windows high contrast, need nothing from a theme: the browser replaces the theme's colours with the person's own, and the stylesheet draws an edge where a fill was. [Accessibility](#g-accessibility) has the details.

## Apply a theme

The engine writes a theme as one CSS rule on an attribute selector. For Linen it begins:

```css
[data-theme="linen"] {
  color-scheme: light;
  --page: #fefaf1;
  --surface: #f4eee0;
  --raised: #fefaf1;
  --inverse: #1c140c;
  --accent: #ffae4e;
  --ink: #1c140c;
  --ink-soft: #4e453c;
  --ink-muted: #60574d;
  --ink-hint: #70685e;
  --hairline: #ded7ca;
  --rule-strong: #b6aea2;
  --track: #d9d2c5;
  --control-off: #8c8479;
  /* and the other tokens that differ between themes */
}
@media (prefers-contrast: more) {
  [data-theme="linen"] {
    --ink-soft: #1c140c;
    --ink-muted: #4e453c;
    --ink-hint: #60574d;
    /* and the other greys, each a step towards the ink */
  }
}
```

It sets all 30 tokens that differ between themes, even those that match Light. Custom properties inherit, so a rule that set only some would take the rest from the theme around it. Setting them all makes `data-theme` work on any element:

```html
<html lang="en" data-theme="linen">
  <body>
    <section class="tray-card" data-theme="midnight">…a Midnight card on a Linen page…</section>
  </body>
</html>
```

## Make one on the Themes page

Open [Themes](#d-themes) and go to **Make your own**. It runs the engine above as you type.

1. Choose a theme in **Start from**, and give yours a **Name**.
2. Set **Page**, **Tray**, **Ink** and **Accent**, with the colour picker or as hex. The tray follows the page until you set it.
3. Move **Corners** for squarer or rounder corners.
4. Open **Every colour** to set one token by hand; it wins over the derived value.
5. Read **Does it hold?**, and open **Show every rule** for all 66 pairs.
6. Under **Take it with you**, copy the CSS, save it as a stylesheet and link it after the system.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components/bundle.css">
<link rel="stylesheet" href="my-theme.css">
```

Then name it on `<html>`: a theme called "My theme" is `<html lang="en" data-theme="my-theme">`. **Copy a link** puts the colours in the address, so whoever opens it finds the theme in the maker; **Use on this site** wears it here, in your browser only. Nothing is sent anywhere. [Theming](#d-theming) covers the rest: following the system's dark setting, and the tokens that are not colours.
