# Installation

Three files and a font. Link them from a CDN or copy them into your project, then write HTML. There is nothing to build.

{{#cdn}}## Link them from a CDN

The quickest start: put these lines in the `<head>` of a page, the script before `</body>` or with `defer`, and write HTML.

```html
<link rel="stylesheet" href="{{cdn}}/tokens.css">
<link rel="stylesheet" href="{{cdn}}/components/bundle.css">
<script src="{{cdn}}/components/bundle.js" defer></script>
```
{{#jsdelivr}}
jsDelivr serves every release{{#npm}} of the `trayui` package on npm{{/npm}}{{^npm}} of the repository{{/npm}}, and the address names the release, so a page keeps the version it was built with. For production, copy the files into your project or pin the release you tested.
{{/jsdelivr}}{{^jsdelivr}}
This site serves the files of the current release, with the font. The addresses do not name a version, so a page that links them gets each new release as it comes out. For production, download the files below and serve them yourself.
{{/jsdelivr}}{{/cdn}}

{{#npm}}## Or install them from npm

In a project with a bundler, install the package and import the three files once, at the entry of the app:

```sh
npm install trayui
```

```js
import 'trayui/tokens.css';
import 'trayui/components/bundle.css';
import 'trayui/components/bundle.js';
```

The package also holds the font, the blocks and the tokens for Tailwind and Figma. For React, see [React](#d-react).

{{/npm}}## Or add them with the CLI

```sh
npx trayui init
npx trayui add login-01
```

The first line writes the three files and the font into a `trayui/` folder; the second puts a block beside your pages, its links pointed at that folder. In a React app the same commands copy the source of components and blocks. [Add with a CLI](#d-cli) says more.

## Or get the files

Download [trayui-{{version}}.zip]({{zip}}) and unpack it beside your pages.{{#repo}} The same files are in the `system/dist` folder of [the repository]({{repo}}).{{/repo}}

```text
trayui/
  tokens.css                 every token as a custom property, the type classes, the font
  components/bundle.css      the tray- classes
  components/bundle.js       behaviours and the icons
  fonts/                     the typeface (Onest-Variable.ttf and .woff2), with its licence (OFL.txt)
  blocks/                    {{blocks}} screens to copy
  templates/                 {{templates}} whole pages of a product to copy
  tailwind/                  the tokens as a Tailwind theme (version 4) and a preset (version 3)
  figma/                     the tokens as Figma variables, a mode for each theme
```

The last two folders are for [Tailwind and Figma](#d-tailwind-figma); a page in plain HTML needs neither.

## Link them

In this order, in every page:

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="trayui/tokens.css">
  <link rel="stylesheet" href="trayui/components/bundle.css">
</head>
<body>
  …your page…
  <script src="trayui/components/bundle.js"></script>
</body>
</html>
```

The script is one classic file. It assigns `window.TrayUI`, adds the icon sprite to the page and wires up every element that carries a `data-tray` attribute. It loads nothing from the network. If you add markup after the page has loaded, call `TrayUI.init(root)` on it.

## Write a first screen

```html
<main class="tray-container tray-section">
  <div class="tray-card tray-stack">
    <h1 class="title">Order a jar</h1>
    <div class="tray-field">
      <label class="tray-label" for="address">Delivery address</label>
      <input class="tray-input" id="address" autocomplete="street-address">
    </div>
    <button class="tray-btn" type="submit">Order a jar</button>
  </div>
</main>
```

That is a grey tray on the white page, a white field in it, and the one yellow button. From here, copy a [block](#blocks) or a [template](#templates) (the files in `blocks/` and `templates/` open as they are) or look up a [component](#components).

## Sizes

| File | With gzip |
| --- | --- |
| `tokens.css` | {{tokens_kb}} KB |
| `components/bundle.css` | {{css_kb}} KB |
| `components/bundle.js` | {{js_kb}} KB |

## Browsers

The current versions of Chrome, Edge, Safari and Firefox. The stylesheet uses logical properties, `:has()`, dynamic viewport units and the native `<dialog>` and `<details>` elements; it has no fallbacks for browsers without them.

## The font

Onest is a variable font by the Onest Project Authors, under the SIL Open Font License 1.1; the licence text is in `fonts/OFL.txt`. To use another typeface, see [Theming](#d-theming).
{{#license}}

## Licence

Tray UI is released under the {{license}} licence.
{{/license}}
