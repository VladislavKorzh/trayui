# Tailwind and Figma

The tokens of the system for two more tools: a theme for Tailwind CSS, and variables for Figma with a mode for each theme.

## Tailwind CSS 4

Import [tailwind/theme.css](tailwind/theme.css) after Tailwind, and link `tokens.css` on the page as a file of its own. Both are in [the download]({{zip}}).

```css
@import "tailwindcss";
@import "./tailwind/theme.css";
```

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="app.css">  <!-- what Tailwind writes -->
<link rel="stylesheet" href="components/bundle.css">
```

`tokens.css` finds its font in the `fonts/` folder beside it. Imported into the Tailwind file, it keeps that address, which Tailwind does not rewrite, and the browser looks for the font beside the file Tailwind writes. If you import it all the same, write that file into the folder that holds `tokens.css`, or copy `fonts/` beside it.

Every token is then a utility, under the name it has in the system:

```html
<div class="bg-surface text-ink rounded-card p-card">
  <h2 class="title">Order a jar</h2>
  <p class="text-lead text-ink-soft max-w-measure">Two jars of 50 g, delivered chilled.</p>
  <button class="tray-btn" type="button">Pay $127</button>
</div>
```

| Tokens | Utilities |
| --- | --- |
| Every colour: `--page`, `--ink`, `--accent`, `--data-1` and the rest | `bg-page`, `text-ink`, `bg-accent`, `border-hairline`, `fill-data-1` |
| The corners: `--radius-card` to `--radius-pill` | `rounded-card`, `rounded-button`, `rounded-pill` |
| The shadow | `shadow-float` |
| The type styles | `text-display` to `text-label`: the size, the line height, the weight and the tracking together |
| The sizes of controls | `h-hit`, `h-control-md`, `size-control-lg`, `size-icon` |
| The spaces of a layout | `p-card`, `px-gutter`, `gap-grid`, `py-section` |
| `--container` and `--measure` | `max-w-page`, `max-w-measure` |
| The breakpoints | `phone:`, `tablet:`, `bento:` and `header:` |
| The dark themes | `dark:` |

- **The theme still works.** Each utility reads the system's own custom property: `bg-page` is `var(--page)`. So `data-theme` on `<html>`, or on any element, changes the utilities the way it changes the components.
- **The system's rules win.** Tailwind puts its utilities in a cascade layer; `tokens.css` and `components/bundle.css` are in none, so where both set a property, the system wins, whatever the order of the files. A `tray-` class wins over a utility, and so does the stylesheet's reset: `text-title` on a heading keeps the size of the text around it (`font: inherit`), `mt-4` on a paragraph does nothing (`margin: 0`), and `text-on-accent` on a button gives way to `color: inherit`, which in a dark theme puts pale text on the yellow. Use the system's class there (`title`, `tray-btn`), or mark the utility important with Tailwind's `!` (`text-title!`). A page that uses no component can leave `bundle.css` out.
- **Dark follows the theme, not the system setting.** `dark:` applies inside any of the dark themes. It also applies inside a light theme set within a dark one: CSS cannot tell which `data-theme` is the nearest. Prefer the colour utilities, which follow the nearest theme by themselves, and keep `dark:` for what no token covers, such as a picture.
- **Spacing needs nothing.** Tailwind's spacing scale (`p-1` is 4px, `p-4` is 16px) is already the system's own.
- **Tailwind's palette stays.** To use only the system's colours, put `@theme { --color-*: initial; }` before the import.

## Tailwind CSS 3

Add [tailwind/preset.cjs](tailwind/preset.cjs) as a preset, and link `tokens.css` on the page:

```js
// tailwind.config.js
module.exports = {
  presets: [require('./tailwind/preset.cjs')],
  content: ['./src/**/*.html'],
};
```

The names are the same as in version 4. Version 3 also gets `z-float`, `z-toast`, `duration-press` and `ease-tray`.

It does not get the breakpoints: Tailwind 3 adds new ones after its own, out of order. Write the widths in px, as its own screens are: `min-[544px]:` for 34rem, where the system's layouts change, `min-[896px]:` for the bento's 56rem (`sm:` is already 640px, the system's 40rem). A width in rem, such as `min-[34rem]:`, mixes units with those screens: Tailwind 3 warns, and writes no `min-` or `max-` variant at all.

## Figma

The variables come in the Design Tokens format that Figma imports, with one file per theme:

1. In Figma, open the variables of the file and create a collection named Colours.
2. Drop in the ten files of `figma/colours/`, from [Light](figma/colours/Light.tokens.json) to [Espresso](figma/colours/Espresso.tokens.json). Each file becomes a mode of the collection, so a frame switches theme the way a page does.
3. Create a second collection and drop in [Scale.tokens.json](figma/scale/Scale.tokens.json): the space, the corners, the sizes, the type sizes and weights, the durations and the layers.

A variable has the name the token has in code. The colour `ink-soft` is `--ink-soft`, and the scale variable `radius/card` is `--radius-card`. Each variable's description gives its CSS name and what it is for.

- **Sizes are in px.** Figma takes px only, so rem is counted at 16px and a fluid size takes its largest value.
- **The shadow and the easing are not included.** Figma has no variable for them: draw the shadow as an effect style from `--shadow-float`.
- **A paid Figma plan is needed.** Figma's help says importing variables needs a Professional plan or above.
- **To update a theme, import its file again.** Right-click its mode and choose Import mode: variables with the same name and type change in place.

The ten colour files and the scale are also in the `figma` folder of the download.
