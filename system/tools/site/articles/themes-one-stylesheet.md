# Ten themes from one stylesheet with data-theme

Ten colour themes in one CSS file: each a rule of custom properties on data-theme, with color-scheme, the system's dark setting, and a theme inside a theme.

Tray UI has ten colour themes: Light, Dark, Linen, Mint, Sky, Rose, Lilac, Midnight, Forest and Espresso. All ten are in one file, `tokens.css`, and one attribute chooses between them. No component has a class per theme, and no second stylesheet is loaded when the theme changes.

## A theme is a rule with the same names

Every theme gives the same custom properties new values. The first theme also sits on `:root`, so a page with no attribute is in Light.

```css
:root, [data-theme="light"] {
  color-scheme: light;
  --page: #ffffff;
  --surface: #f4f3f0;
  --ink: #141414;
  --accent: #ffd426;
  /* … */
}
[data-theme="dark"] {
  color-scheme: dark;
  --page: #111110;
  --surface: #1e1e1c;
  --ink: #f4f3f0;
  --accent: #ffd426;
  /* … */
}
```

```html
<html lang="en" data-theme="dark">
```

Components read `var(--page)` and `var(--ink)` and never learn which theme they are in. Changing the attribute changes the values, and every rule that reads them follows.

Order matters. On `<html data-theme="dark">` both rules match: `:root` is a pseudo-class and `[data-theme="dark"]` an attribute selector, and the two weigh the same. The one that comes later wins. Put the dark rule before the `:root` rule and the page stays light, whatever the attribute says.

The first rule declares all 60 colours and the shadow. Each of the nine others declares 31 properties: the 30 colours that differ between themes, and the shadow. The other 30 colours, such as `on-accent` and the paper palette of the yellow card, are the same in every theme and stay on `:root`. A theme rule repeats a value even where it matches Light; [the four-colour article](#a-colour-theme-from-four-colours) explains why that lets `data-theme` work on any element. The nine rules come to about 7 KB, or 1.3 KB compressed.

## Say whether the theme is light or dark

Each rule sets `color-scheme`. It tells the browser which of its own colour schemes to use for what it draws itself. MDN lists them: "the color of the canvas surface", "the default colors of scrollbars and other interaction UI", "the default colors of form controls", and the colours of other browser UI, such as spellcheck underlines. Without it, a dark theme keeps the browser's light scrollbars, and an unstyled text field stays white on the dark page.

The property inherits, so a section in a dark theme gets dark scrollbars and dark default controls of its own. In Chrome, an unstyled `<input>` inside `<section data-theme="dark">` takes a dark grey fill.

Tray UI says it twice. `tokens.css` sets it in each theme rule, and `bundle.css` begins with a fallback for a page whose tokens come from somewhere else:

```css
:where(:root, [data-theme]) { color-scheme: light; }
:where([data-theme="dark"], [data-theme="midnight"], [data-theme="forest"], [data-theme="espresso"]) { color-scheme: dark; }
```

`:where()` gives a selector no weight at all, so any theme rule that sets the property wins over these two.

## Follow the system's dark setting

`prefers-color-scheme` knows two values. MDN describes `dark` as a person who "has notified that they prefer an interface that has a dark theme", and `light` as a person who prefers a light one or "has not expressed an active preference". So the system can choose between Light and Dark, and the other eight themes are a person's own choice, which the page has to remember.

This script goes in the `<head>`, before the stylesheets, so the first paint is already in the right theme. It reads a saved choice, falls back to the system's setting, and keeps following that setting while nothing is saved:

```html
<script>
  const dark = matchMedia('(prefers-color-scheme: dark)');
  function savedTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }
  function applyTheme() {
    document.documentElement.dataset.theme = savedTheme() || (dark.matches ? 'dark' : 'light');
  }
  applyTheme();
  dark.addEventListener('change', applyTheme);

  // from the theme menu: a theme's id, or 'system' to follow the setting again
  function chooseTheme(id) {
    try {
      if (id === 'system') localStorage.removeItem('theme');
      else localStorage.setItem('theme', id);
    } catch (e) { /* the choice lasts until the page is left */ }
    if (id === 'system') applyTheme();
    else document.documentElement.dataset.theme = id;
  }
</script>
<link rel="stylesheet" href="tokens.css">
```

- **The listener.** A `change` event fires on the media query list when the system's setting changes, by the person's hand or on a schedule. `applyTheme` runs again, and a saved choice still wins.
- **The try.** `localStorage` throws when the browser blocks storage. The page then follows the system, and a choice lasts until the page is left.
- **A way back.** `chooseTheme('system')` forgets the choice, so a theme menu can offer "As the system" beside the ten themes.

Tray UI's site runs the first half of this before its stylesheets, with its own storage key, and the [Theming](#d-theming) page gives the same three lines for your pages. Both keep following the system setting while no theme is chosen: a page that is open when the system turns dark turns dark with it.

A page can follow the setting in CSS alone, by repeating the dark values inside `@media (prefers-color-scheme: dark)` for a `:root` with no `data-theme`. That puts a second copy of a theme in the file, and a menu with ten themes needs the script all the same.

## A theme inside a theme

`data-theme` works on any element, since custom properties inherit: everything inside takes the new values. Most of the page follows at once. Two things do not, and both catch people out.

A custom property that refers to another is resolved where it is declared. The specification says custom properties "resolve any var() functions in their values at computed-value time", and what the children inherit is that computed value. A rule on `:root` that says `--ground: var(--page)` stores the root's page colour, and a dark section inherits the white.

`color` inherits as a computed value too. `body { color: var(--ink) }` gives the body the light theme's ink, and a dark section inherits that dark ink, now on a dark ground.

This page shows both:

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<style>
  :root, [data-theme="light"] { color-scheme: light; --page: #ffffff; --surface: #f4f3f0; --ink: #141414; }
  [data-theme="dark"] { color-scheme: dark; --page: #111110; --surface: #1e1e1c; --ink: #f4f3f0; }

  :root { --ground: var(--page); }          /* the colour behind a control */
  body { background: var(--page); color: var(--ink); }
  .panel { background: var(--page); }
  .chip { background: var(--ground); }
</style>
</head>
<body>
  <section class="panel" data-theme="dark">
    <p>Autumn batch</p>
    <span class="chip">In season</span>
  </section>
</body>
</html>
```

In Chrome the panel is dark, `#111110`, as it should be. Its text is `#141414`, the light theme's ink, which cannot be read on it, and the chip is white. One rule fixes both: declare the derived properties again on any element that names a theme, and set its text colour there.

```css
[data-theme]:not(:root) { --ground: var(--page); color: var(--ink); }
```

On the section, `var(--page)` now resolves to the dark page, and `var(--ink)` to the dark theme's ink. `:not(:root)` leaves `<html>` alone, where the `:root` rule already declares them. Tray UI's own rule, in `src/css/00-base.css`, declares seven such properties: the ground, the fill of a control on it, the colour of an off switch, the text on a solid ink fill, the ink for a ring drawn outside a surface, and the two colours a filled component hands to its children.

The themed element also needs a fill of its own if it should look like the theme. A section with no background shows the page around it. In Tray UI that is the job of a class such as `tray-card`, which paints `--surface`:

```html
<section class="tray-card" data-theme="dark">…a dark card on a light page…</section>
```

## Islands that keep their colours

The accent card keeps the light palette in every theme, so on a dark page it is a lit island. Tray UI does it with a theme made by a class. `.tray-card--accent` and `.tray-island` point the greys at the paper palette, which has one value in every theme:

```css
.tray-card--accent, .tray-island {
  color-scheme: light;
  --page: var(--paper);
  --surface: var(--paper-tray);
  --ink: var(--paper-ink);
  --ink-soft: var(--paper-ink);
  --hairline: var(--paper-hairline);
  --danger: var(--paper-danger);
  /* and the other greys, the status and code colours, and the grounds */
  background: var(--accent);
  color: var(--paper-ink);
}
```

The declarations sit on the card, so `var(--paper)` resolves there, and a button or a badge inside reads `--ink` and gets the paper ink. Only the fill, the theme's accent, changes from theme to theme; the text on it does not. The ink card, `.tray-card--inverse`, does the same with the on-dark steps, which are also the same in every theme, over the fill each theme gives `inverse`.

## Print is one more theme

Paper is light, so `tokens.css` ends its colours with a rule for print that gives every themed token its Light value, whatever the page wears:

```css
@media print {
  :root:root, [data-theme][data-theme] {
    color-scheme: light;
    --page: #ffffff;
    --surface: #f4f3f0;
    /* and every other token that differs between themes */
  }
}
```

The doubled selectors are for weight. `:root:root` matches the same element as `:root` and counts twice, so the rule outweighs any single theme selector, also one in a stylesheet linked after the system, such as a theme you made. In Chrome, with print emulated, a page in a theme linked later prints with the white page; with single selectors it keeps its theme's page. [Print styles for a web app](#a-print-styles-web-app) covers the rest of printing.

## Themes in Tray UI

- [Themes](#d-themes) shows the ten, puts the whole site in the one you choose, and makes a theme of your own from four colours. A theme you make there is one more rule of the same shape, with its own `color-scheme`.
- [Theming](#d-theming) covers the tokens that are not colours, a typeface of your own, and the rules that keep a retuned theme working.
- In the Tailwind export, `dark:` applies inside any of the four dark themes, on the element with the attribute or below it, and not on the system setting: see [Tailwind and Figma](#d-tailwind-figma).
- How the eight derived themes are made is in [Generate an accessible colour theme from four colours](#a-colour-theme-from-four-colours), and how they are checked in [Testing colour contrast in every theme](#a-contrast-testing-themes).
