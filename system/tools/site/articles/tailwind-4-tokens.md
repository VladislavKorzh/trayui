# Tray UI tokens in a Tailwind 4 project

Use Tray UI's tokens as Tailwind 4 utilities that follow data-theme: why @theme needs inline, the theme file, dark mode, cascade layers and the v3 preset.

Tailwind 4 keeps its configuration in CSS: theme variables, written in `@theme`, decide which utilities exist. Tray UI keeps its design in custom properties that a `data-theme` attribute changes, on the whole page or on one element. Joined, they give utilities such as `bg-page` and `text-ink-soft` that change with the theme. Everything below was built with Tailwind CSS 4.3.5 and its CLI, and measured in Chrome.

## Theme variables make utilities

Tailwind's [theme variables](https://tailwindcss.com/docs/theme) live in namespaces, and each namespace feeds a family of utilities. A variable in `--color-*` makes `bg-*`, `text-*`, `border-*` and `fill-*`; `--text-*` makes font sizes, `--spacing-*` paddings, gaps and sizes, `--container-*` the `max-w-*` widths, and `--breakpoint-*` makes variants such as `bento:`.

So a token becomes a utility when a theme variable points at it. The obvious way to write that breaks a theme set on one part of the page.

## Why the theme needs `inline`

Point a theme variable at a Tray UI token with plain `@theme`:

```css
@import "tailwindcss";
@theme {
  --color-page: var(--page);
}
```

Tailwind writes the variable on `:root` and makes the utility read it: `:root { --color-page: var(--page); }` and `.bg-page { background-color: var(--color-page); }`. A custom property that holds `var()` is worked out where it is declared, and descendants inherit the result. Tailwind's docs explain the same trap with fonts: "`var(--font-sans)` is resolved where `--font-sans` is defined". So `--color-page` takes the page colour of `<html>`, and a section with `data-theme="midnight"` and `bg-page` stayed white in Chrome.

The `inline` option makes the utility use the value itself:

```css
@theme inline {
  --color-page: var(--page);
}
```

Now `.bg-page` is `background-color: var(--page)`, read on the element, and the same section took Midnight's page colour, `#090f1c`.

## The theme file

Tray UI's download has a file that does this for every token, `tailwind/theme.css`, written by the build from the same source as `tokens.css`. A few of its lines:

```css
@theme inline reference {
  --color-page: var(--page);
  --color-surface: var(--surface);
  --color-ink: var(--ink);
  --color-accent: var(--accent);
  --radius-card: var(--radius-card);
  --text-title: var(--title-size);
  --text-title--line-height: 1.05;
  --spacing-card: var(--card-pad);
  --container-measure: var(--measure);
  /* … */
}
```

It holds 60 colours, 8 corner radii, the float shadow, 2 font families, 15 type styles with their line height, weight and tracking, 11 spaces and sizes (`card`, `gutter`, `section`, `grid`, four control heights, `segment`, `hit`, `icon`), 2 widths, `page` and `measure`, and the system's easing. `reference` keeps Tailwind from declaring the variables again, since `tokens.css` declares them. Tailwind's theme page does not list that option; Tailwind 4.3.5 accepts it, and the build declared none of the 60 colour variables.

A second `@theme` block, without `inline`, adds four breakpoints at the widths where Tray UI's own layouts change: `phone:` at 34rem, `tablet:` at 40rem, `bento:` at 56rem and `header:` at 76rem. Spacing needs nothing: Tailwind's scale goes in 4px steps, as Tray UI's `--space-*` tokens do, so `p-4` and `--space-4` are both 16px.

Tailwind's colours stay beside the system's. To keep only the system's, reset the namespace before the import, as Tailwind's docs show for any namespace:

```css
@import "tailwindcss";
@theme { --color-*: initial; }
@import "./trayui/tailwind/theme.css";
```

With that line, `bg-red-500` was no longer generated.

## Set it up

Install Tailwind and its CLI, and copy the `trayui` folder of the download beside your CSS: `tokens.css`, `fonts/`, `tailwind/` and `components/`.

```sh
npm install tailwindcss @tailwindcss/cli
npx @tailwindcss/cli -i app.css -o build/app.css
```

`app.css` imports Tailwind and the theme file. Link `tokens.css` on its own, before the output, and `bundle.css` after it:

```html
<link rel="stylesheet" href="trayui/tokens.css">
<link rel="stylesheet" href="build/app.css">
<link rel="stylesheet" href="trayui/components/bundle.css">
```

Tray UI's own lines import `tokens.css` into the Tailwind file instead. With the CLI that import is copied into the output, and the font's address, `fonts/Onest-Variable.woff2`, stays as written. The browser then looks for the font beside the output file: in the test it asked for `build/fonts/Onest-Variable.woff2`, found nothing, and drew the page in the next font of `--font-sans`. Link `tokens.css` as above, or write the output into the folder that holds `tokens.css`.

## Utilities that follow the theme

A page made of utilities and components together:

```html
<body class="bg-page text-ink">
  <main class="tray-container grid gap-grid py-section bento:grid-cols-[2fr_1fr]">
    <section class="bg-surface rounded-card p-card">
      <h2 class="title">Orders today</h2>
      <p class="text-lead text-ink-soft max-w-measure">Twelve jars leave the farm at 9:00.</p>
      <button class="tray-btn" type="button">Pack the orders</button>
    </section>
    <section data-theme="midnight" class="bg-page text-ink rounded-card p-card">
      <p class="text-ink-soft">The same utilities in Midnight.</p>
    </section>
  </main>
</body>
```

The utilities do the layout glue: `gap-grid` is the system's 16px grid gap, `py-section` its fluid section spacing, and `bento:` switches to two columns at 56rem, where the bento grid of the components does. The parts with states, the button here, stay Tray UI classes. `text-lead` sets the size, line height and weight of the lead style in one utility, from the theme variable and its `--line-height` and `--font-weight` companions.

Chrome's computed colours, with each theme set on `<html>`:

| Theme on `<html>` | `body`, `bg-page` | First section, `bg-surface` | Second section, `bg-page` |
| --- | --- | --- | --- |
| `light` | `#ffffff` | `#f4f3f0` | `#090f1c` |
| `dark` | `#111110` | `#1e1e1c` | `#090f1c` |
| `espresso` | `#140e09` | `#241b13` | `#090f1c` |

Every utility reads the token where it is used, so the page follows `<html>` and the second section keeps Midnight under any of them. Opacity works as well: `bg-ink/10` compiles to `color-mix(in oklab, var(--ink) 10%, transparent)`, which follows the theme like the rest.

## Dark mode with `@custom-variant`

Tailwind's `dark:` follows the system setting, `prefers-color-scheme`, until you override it. Its [dark mode page](https://tailwindcss.com/docs/dark-mode) shows the override for a data attribute: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`. Tray UI's theme file does the same for its four dark themes: Dark, Midnight, Forest and Espresso.

- **A dark theme of your own.** The variant lists theme names, so a theme made on the [Themes](#d-themes) page is not in it. Write the variant again after the import, with every dark theme you use; in the build, the later definition replaced the file's.
- **Nesting.** The selector matches anything inside a dark theme, so an element in a light theme nested in a dark one still gets its `dark:` styles. Chrome showed it. Prefer token utilities, which follow the nearest theme, and keep `dark:` for what differs in kind, such as a logo or a picture.
- **The system setting.** Like the components, `dark:` follows `data-theme`, and nothing sets that attribute from the system setting by itself. [Theming](#d-theming) has the short script that does, following the system setting until a theme is chosen.

```css
@import "tailwindcss";
@import "./trayui/tailwind/theme.css";
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *, [data-theme="midnight"], [data-theme="midnight"] *, [data-theme="my-night"], [data-theme="my-night"] *));
```

## Utilities and components: cascade layers

Tailwind 4 uses native cascade layers, and its utilities sit in `@layer utilities`. `tokens.css` and `bundle.css` are in no layer. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer) states the rule: "Styles that are not defined in a layer always override styles declared in named and anonymous layers", whatever their specificity. Two results of that, measured in Chrome on a window 1200px wide:

- **A utility on a component does nothing where the class sets the same property.** `p-4` on a `tray-card` left its padding at `--card-pad`, 40.8px. Put utilities around components, not on them; what the class leaves alone, such as a margin or `self-start`, is free.
- **Headings keep their reset.** `bundle.css` resets headings with `h1, h2, h3, h4, h5, h6 { font: inherit; }`, so `text-title` on an `<h2>` gave 18px, the size of the text around it. Use the type classes on headings, `class="title"` (35.2px there), and the `text-` utilities on other elements, where `text-title` gave the same 35.2px.

## Tailwind 3: the preset

For Tailwind 3 the download has `tailwind/preset.cjs`, a [preset](https://v3.tailwindcss.com/docs/presets) with the same names. Link `tokens.css` on the page, since every value reads one of its properties.

```js
// tailwind.config.js
module.exports = {
  presets: [require('./trayui/tailwind/preset.cjs')],
  content: ['./src/**/*.html'],
};
```

It also carries `z-float`, `z-toast`, `duration-press` and `ease-tray`, and sets `darkMode` to the `variant` strategy with the same selector as the version 4 file. It has no breakpoints. Built with Tailwind 3.4.19, two things behave differently:

- **Arbitrary widths need px.** `min-[34rem]:` produced no CSS, and the CLI warned: "The `min-*` and `max-*` variants are not supported with a `screens` configuration containing mixed units." Tailwind 3's default screens are in px; `min-[544px]:`, the same 34rem at 16px, works.
- **No opacity modifier.** `bg-ink/10` produced nothing. Tailwind 3's [colour docs](https://v3.tailwindcss.com/docs/customizing-colors#using-css-variables) say a colour in a CSS variable takes the modifier only when the variable holds bare channels, and Tray UI's tokens hold hex values.

Tailwind 3 writes no native layers, so the order of the files decides: link `bundle.css` after Tailwind's output and the `tray-` classes win, as they do in version 4.

## More on Tailwind and Tray UI

[Coming from Tailwind](#d-from-tailwind) maps Tailwind habits to Tray UI's classes and shows a card written both ways. [Tailwind and Figma](#d-tailwind-figma) lists every utility the theme file makes, and [Theming](#d-theming) the tokens behind them.
