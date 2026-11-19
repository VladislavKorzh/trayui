# Tray UI

A design system in plain HTML and CSS: 108 components, 64 blocks, 10 page templates, 118 icons and 10 themes. Three files, no framework, no build step.

Docs and live examples of every component, with a playground for 52 of them: https://trayui.com

## Link it from a CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/trayui@0.4.0/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/trayui@0.4.0/components/bundle.css">
<script src="https://cdn.jsdelivr.net/npm/trayui@0.4.0/components/bundle.js" defer></script>
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
- `templates/`: 10 whole pages of a product (a landing page, pricing, a dashboard, orders, an inbox, settings, billing...), each one HTML file to copy.
- `tailwind/` and `figma/`: the tokens as a Tailwind theme and as Figma variables.
- `cli/`: the `trayui` command (below) and the markup checker it runs.
- `skills/trayui/`: a skill for AI agents (Claude Code, and any tool that reads `SKILL.md`): the rules, a page for every component and block, and the checker. It is in the npm package; the zip on the site leaves it out, as the skill has an archive of its own, https://trayui.com/skills/trayui.zip.

For React, there is [trayui-react](https://www.npmjs.com/package/trayui-react). For an AI agent, https://trayui.com/llms.txt is the index of the site in Markdown.

## Add it with the CLI

```sh
npx trayui init              # the three files and the font, in trayui/
npx trayui add login-01      # a block, beside your pages, its links pointed at trayui/
npx trayui add button --react   # in React: the component's source, yours to change
npx trayui diff              # what you changed, and what changed upstream
npx trayui check page.html   # check the markup against the system's rules
```

It needs Node 18 or later and nothing else. It works in a folder of plain HTML pages, in a Vite or Next.js app, with npm, pnpm, yarn or bun, and it never overwrites a file you changed unless you ask with `--overwrite`. The same items are a registry in shadcn's format, at https://trayui.com/r/registry.json: `npx shadcn add https://trayui.com/r/login-01.json`. https://trayui.com/docs/cli says more.

## For AI agents

Copy `skills/trayui` from the npm package into your project's `.claude/skills/` (or `.agents/skills/`), run `npx trayui skill`, or install it as https://trayui.com/docs/skill says. It tells an agent how to build with the system and has it check what it wrote with `node scripts/check.mjs page.html`.

## Licence

MIT. The typeface, Onest, is under the SIL Open Font License 1.1 (`fonts/OFL.txt`); the icons are Lucide's, under the ISC licence (`components/LUCIDE-LICENSE.txt`). The name Tray UI and its logo are not covered by the licence.
