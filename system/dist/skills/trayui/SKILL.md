---
name: trayui
description: Build and fix web pages and app screens with Tray UI, the design system in plain HTML and CSS (tray- classes, data-tray behaviours, tokens.css, components/bundle.css, components/bundle.js; the trayui and trayui-react packages; npx trayui). Use when the user names Tray UI or trayui, when a project links tokens.css and components/bundle.css or depends on trayui or trayui-react, or when asked to build a sign-in page, dashboard, settings page, table, pricing page, shop, article or other screen in that system.
license: MIT
metadata:
  version: "0.4.0"
  site: "https://trayui.com"
---

# Build with Tray UI

Tray UI 0.4.0 is plain HTML with `tray-` classes, styled by two stylesheets and wired by one script: 108 components, 64 blocks (whole screens), 118 icons and 10 themes. There is no build step and no framework. A white page, grey trays with very round corners, ink type, and one yellow for the thing to do.

## Where the pages are

Every page of https://trayui.com is also Markdown, and this skill holds those of the docs, the components, the blocks and the charts under `references/`, by the same path: `https://trayui.com/components/button.md` is `references/components/button.md`, `https://trayui.com/docs/accessibility.md` is `references/docs/accessibility.md`. A link in one of them to another page of the site is a file here. Fetch from the site only for a page that is not here.

- `references/blocks.md`: the 64 blocks, group by group, a line on each. `references/blocks/<id>.md`: when to choose it, what it is made of, and the whole page of HTML.
- `references/components.md`: the 108 components. `references/components/<id>.md`: the markup to copy, the classes and variants, the behaviour, the Accessibility section.
- `references/docs/`: `brand-book.md` (the rules), `layouts.md` (page frames), `behaviour.md` (every `data-tray` and its events), `accessibility.md`, `grounds.md` (which fill sits on which), `colours.md`, `typography.md`, `space-and-shape.md` (the tokens), `icons.md` (the names), `theming.md`, `themes.md`, `installation.md`, `cli.md`, `react.md`. `references/docs.md` is the introduction; `references/charts/` covers charts in React.

## 1. Put the system in the page

Link the three files, in this order:

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>…</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/trayui@0.4.0/tokens.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/trayui@0.4.0/components/bundle.css">
  <script src="https://cdn.jsdelivr.net/npm/trayui@0.4.0/components/bundle.js" defer></script>
</head>
```

If the project already has its own copies (a `trayui/` folder, `npm install trayui`), link those instead. `data-theme` is one of `light`, `dark`, `linen`, `mint`, `sky`, `rose`, `lilac`, `midnight`, `forest` or `espresso`.

Or let the command line put it in, when the project may have files added (Node 18 or later):

- `npx trayui init` copies the three files and the font into `trayui/`; `npx trayui add login-01` puts a block beside the pages, its links pointed at `trayui/`.
- In a React app (Vite, Next.js), `npx trayui init` and `npx trayui add tabs login-01` copy the components' and the blocks' source into `src/components/trayui/`, for the project to own. Or use the package: `npm install trayui-react` and `import 'trayui-react/styles.css'`; `references/docs/react.md` says how.
- `npx trayui diff` shows what was changed since; a file someone edited is never overwritten without `--overwrite`. `references/docs/cli.md` has the rest.

## 2. Start from the nearest block, never from an empty page

Pick the nearest of the 64 blocks in `references/blocks.md` (sign-in, sign-up, dashboard, settings, tables, pricing, checkout, shop, articles, blog, wiki, sidebars, empty states), read `references/blocks/<id>.md`, and change it. Its `<head>` links `../tokens.css`, because the file sits in `blocks/` one folder below the three files: point those lines at the project's copies, or at the CDN lines above.

## 3. Read a component's page before writing it

Before you write a component, read `references/components/<id>.md`. Copy the markup and its ARIA as written, and change the words. Use the browser's element: `<button type="button">` that does, `<a href>` that goes, `<dialog>`, `<details>`, real checkboxes and radios.

## 4. The conventions

- Classes: `tray-block`, `tray-block__part`, `tray-block--variant`. Use only classes that exist. Never invent one, never add Tailwind or other utility classes, never write a `<style>` of your own.
- Type styles are plain classes from tokens.css: `display` (once a page), `headline`, `title`, `subtitle`, `figure`, `lead`, `body`, `caption`, `label`.
- Layout: `tray-container`, `tray-section`, `tray-stack` (`--sm`, `--lg`), `tray-row`, `tray-bento`; outside a product, `tray-screen` with `tray-screen__body` (`--narrow`, `--center`); a product, `tray-app` with its sidebar and top bar (`references/docs/layouts.md`).
- Where a layout needs a value no class gives, use a token: `style="margin-block-start: var(--space-6)"`. Never a literal colour or size (`references/docs/space-and-shape.md`, `colours.md`).
- State lives in attributes, never in classes: `aria-selected`, `aria-current`, `aria-pressed`, `aria-expanded`, `aria-invalid`, `aria-busy`, `open`, `hidden`, `disabled`.
- Behaviour: `data-tray="name"` on the element the component's page names (`tabs`, `menu`, `open`, `dialog`, `select`, `combobox`, `reveal`, `tooltip`, `copy`…; all in `references/docs/behaviour.md`). Markup added after the page loaded needs `TrayUI.init(root)`. A toast is `TrayUI.toast({ title, text })`. Behaviours report with bubbling events: `tray:change`, `tray:select`, `tray:open`, `tray:close`.
- Icons: `<svg class="tray-icon" aria-hidden="true"><use href="#tray-i-name"/></svg>` with the names in `references/docs/icons.md` (Lucide's); the script adds the sprite.
- Depth is fill: page white, a card (`tray-card`) grey, a field inside it white again by itself. Never set those fills by hand.

## 5. The rules agents break most

1. One yellow per view. `tray-btn` alone is the yellow primary; every other button is `tray-btn--quiet`, `--ghost`, `--dark`, `--link` or `--danger`. At most one large yellow surface (`tray-card--accent`, `tray-island`) per screen. A dialog is a view of its own and may have its own yellow button.
2. Selected is solid ink, never yellow.
3. Words: sentence case; a button starts with a verb and names the outcome ("Sign in", "Save changes"), never "OK", "Submit" or "Yes"; an error says what to do; no emoji, no exclamation marks, no italics.
4. Headings in order, one `<h1>`.
5. The invented brands of the blocks (Counter, Perly Farm), and their names, prices and quotes, are examples: replace them with the user's.

## 6. Accessibility the markup must carry

- Every field has a visible `<label class="tray-label" for>`, or sits inside its label.
- An icon-only button always has an `aria-label` that says what it does. Wrap it in a Tooltip that repeats the label (`<span class="tray-anchor" data-tray="tooltip" data-tip="Remove the spoons">`) where it stands alone and its icon could mean several things: a row action such as Remove, the icons of a collapsed sidebar. Where its place says what it does, the blocks give it the `aria-label` alone, no Tooltip: a button inside a field (the eye that shows a password, a clear or copy button in an input group), the close button of a dialog, the menu button of a phone header, the minus and plus of a stepper, previous and next, the x of a chip, and a button that opens its own menu or popover.
- Sign-in fields: `autocomplete="username"` (or `email`) and `current-password`; sign-up: `new-password`.
- Every `aria-controls`, `aria-labelledby`, `aria-describedby`, `for` and `data-target` points at an id that exists, and no id is used twice.
- Never remove a focus ring. Never set text in a data colour, or on yellow in anything but `on-accent`.
- The full rules are in `references/docs/accessibility.md` and `references/docs/brand-book.md`.

## 7. Check before handing over

Run the checker that comes with this skill on every page you wrote (Node 18 or later; give the path to this skill's folder):

```bash
node <this skill's folder>/scripts/check.mjs page.html
```

In a project with npm, `npx trayui check page.html` runs the same checker. It reports classes, behaviours and icons that do not exist, more than one yellow button in a view, buttons and fields without names, missing autocomplete, broken references and repeated ids, tabs wired wrong, skipped headings, literal colours and sizes, a `<style>` of its own, and the three files missing or out of order. Fix every error and every warning you can. Then say what it cannot check: look at the page at 1280, 768 and 390px wide, in `light` and `dark`, and tab through it.
