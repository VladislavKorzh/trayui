# Tray UI

A design system in plain HTML and CSS: 108 components, 64 blocks, 118 icons and 10 themes. Three files, no framework, no build step.

Docs, live examples and a playground for each component: https://trayui.com

## Link it from a CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/trayui@0.2.0/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/trayui@0.2.0/components/bundle.css">
<script src="https://cdn.jsdelivr.net/npm/trayui@0.2.0/components/bundle.js" defer></script>
```

Then write HTML with `tray-` classes. A button is one class; a menu, a calendar or a chart is one attribute more:

```html
<button class="tray-btn" type="button">Order a jar</button>
```

## Or install it

```sh
npm install trayui
```

```js
import 'trayui/tokens.css';
import 'trayui/components/bundle.css';
import 'trayui/components/bundle.js';
```

## What is in it

- `tokens.css`: every token as a custom property, the type classes and the font.
- `components/bundle.css`: the `tray-` classes of every component.
- `components/bundle.js`: one classic script, `window.TrayUI`, that wires every element with a `data-tray` attribute and adds the icons. It loads nothing.
- `fonts/`: Onest, with its licence.
- `blocks/`: 64 whole screens, each one HTML file to copy.
- `tailwind/` and `figma/`: the tokens as a Tailwind theme and as Figma variables.

For React, there is [trayui-react](https://www.npmjs.com/package/trayui-react). For an AI agent, https://trayui.com/llms.txt lists every page as Markdown.

## Licence

MIT. The typeface, Onest, is under the SIL Open Font License 1.1 (`fonts/OFL.txt`); the icons are Lucide's, under the ISC licence (`components/LUCIDE-LICENSE.txt`). The name Tray UI and its logo are not covered by the licence.
