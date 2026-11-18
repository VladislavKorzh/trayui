# Theming

Every colour, size, radius and space in the stylesheet is a custom property from `tokens.css`. Change a token and everything that uses it follows.

## Themes

A theme gives every colour token a value. 10 come with the system, all in `tokens.css`: `light` and `dark`, tuned by hand, and `linen`, `mint`, `sky`, `rose`, `lilac`, `midnight`, `forest` and `espresso`. [Themes](https://trayui.com/docs/themes.md) shows them, and lets you make your own.

Name the theme on `<html>`:

```html
<html lang="en" data-theme="midnight">
```

No theme is another one inverted: each has its own steps, chosen against its own page, and its own accent. Follow the system setting until the person chooses, also when it changes, then remember the choice:

```js
var system = matchMedia('(prefers-color-scheme: dark)');
function apply() {
  var theme = localStorage.getItem('theme') || (system.matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}
apply();
system.addEventListener('change', apply);  // the setting changed: follow it, unless a theme was chosen

function choose(theme) {  // from your own theme menu
  localStorage.setItem('theme', theme);
  apply();
}
```

Put it in a `<script>` in the `<head>`, so the page is drawn in its theme from the first frame.

Accent surfaces, and everything on them, keep the light palette in every theme (the Island Rule): a yellow card is a lit island on a dark page. `tray-card--accent` and `tray-island` do that for you. That is also why an accent must stay bright: ink text goes on it.

## A part of a page in another theme

`data-theme` works on any element, not only on `<html>`: what is inside takes that theme.

```html
<section data-theme="dark" class="tray-card">…a dark card on a light page…</section>
```

## A theme of your own

A theme is one rule that gives the colour tokens new values. [The maker](https://trayui.com/docs/themes.md) writes it for you from four colours, and checks its contrast as you go. Link it after the system and name it on `<html>`:

```css
[data-theme="orchard"] {
  color-scheme: light;
  --page: #fbfdf6;
  --surface: #eef3e2;
  --ink: #16200d;
  --accent: #c6ec5b;
  /* and the steps between the page and the ink */
}
```

Tokens that are not colours are overridden the same way, after `tokens.css`. The names are in [Colours](https://trayui.com/docs/colours.md), [Typography](https://trayui.com/docs/typography.md) and [Space and shape](https://trayui.com/docs/space-and-shape.md).

```css
:root {
  --radius-card: 24px;               /* calmer corners */
  --radius-panel: 18px;
  --font-sans: "Your Sans", system-ui, sans-serif;
}
```

Rules that keep a retuned system working:

- Keep one loud colour. `accent` is for the primary action and at most one large surface in view; a second accent colour breaks the whole idea.
- Text on `accent` is `on-accent`, which is ink, and the pair must hold 4.5:1: choose a bright accent. A dark accent would need white text, and the accent card, which keeps the light palette, does not carry it.
- Corners step down with nesting: a card is rounder than the panel inside it, which is rounder than its buttons. Keep the order when you change the values.
- `data-1` to `data-4` are for chart series only, and must stay told apart by lightness, not hue alone.
- Say whether a theme is light or dark: `color-scheme` in its rule sets the browser's own controls and scrollbars to match.
- Do not restyle a component by overriding its class. If a token does not reach what you want to change, the system is missing a token.

## Your own typeface

Declare the face, then point `--font-sans` at it. The type styles keep their sizes and weights; check the heading styles, which are set at weight 700 with tight tracking.

```css
@font-face { font-family: "Your Sans"; src: url("fonts/YourSans.woff2"); font-weight: 100 900; font-display: swap; }
:root { --font-sans: "Your Sans", system-ui, sans-serif; }
```

## Right-to-left

The stylesheet uses logical properties throughout. Set `dir="rtl"` on `<html>` and layouts mirror; icons that point along the reading direction take `tray-icon--flip`. The Direction component shows it.
