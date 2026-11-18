# shadcn/ui-style components without React

What shadcn/ui is and what it asks of a project, and how Tray UI gives the same set of components as plain HTML with one script, or as a React package.

shadcn/ui gives a React project components whose source you own: a dialog, a sheet, a command palette, a sidebar, each one a file in your repository. A page without React cannot use them. This page describes what shadcn/ui is, from [its documentation](https://ui.shadcn.com/docs) on 18 November 2026, and how Tray UI offers components of the same kind as HTML and CSS.

## What shadcn/ui is

Its introduction opens with "This is not a component library. It is how you build your component library." Instead of installing a package of components, you add each component's code to your project. The CLI does it:

```sh
npx shadcn@latest init
npx shadcn@latest add dialog
```

The second command writes `components/ui/dialog.tsx`, which your code imports like any file of its own. The manual route is the same in steps: install the component's dependencies, then copy and paste its source. Usage follows a composition of parts:

```tsx
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger>Change the day</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Change the delivery day</DialogTitle>
      <DialogDescription>The order is not packed yet.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

Each copied file stands on two things you install:

- **A headless library** for behaviour and accessibility: focus, keys, ARIA. Since July 2026 new projects use [Base UI](https://base-ui.com) by default; Radix is still fully supported (`npx shadcn init -b radix`), and React Aria became a third choice the same month (`--base aria`).
- **Tailwind CSS** for the look. The component's classes are written in its file, and they read theme tokens, CSS variables such as `--background`, `--primary` and `--radius`, which `@theme inline` turns into utilities like `bg-background`.

The result is code you can change line by line. The docs compare it with a typical library, where changing a button means overriding its styles or wrapping it; here you edit the button's own file.

## What it asks of a project

- **React.** Every installation guide sets up a React project: Next.js, Vite, TanStack Start, React Router, Laravel with its React starter kit, Astro with its React integration. The components are written in TypeScript, and the CLI can write JavaScript instead.
- **A build.** Tailwind CSS has to be set up, with import aliases such as `@/components` and a `components.json` for the CLI. The manual installation adds `shadcn`, `class-variance-authority`, `cn`, `lucide-react` and `tw-animate-css`.
- **Updates you merge.** Fixes to behaviour arrive when you update the headless library. The layer you copied is yours: the CLI's `add --diff` shows a diff for a file, and you decide what to take.

None of this is a cost in a React and Tailwind app; it is how such an app is built. It is a cost on a page that a server writes as HTML, a static site, a documentation page or a prototype in one file.

## The idea Tray UI shares: copy the markup

Tray UI also hands you the code to paste. Every component page on this site shows its markup, and every block is a whole screen in one HTML file that opens as it is. You copy the markup into your page and it is yours to arrange.

The same dialog, in Tray UI:

```html
<button class="tray-btn tray-btn--quiet" type="button" data-tray="open" data-target="#day">Change the day</button>

<dialog class="tray-dialog" id="day" data-tray="dialog" aria-labelledby="day-title" aria-describedby="day-text">
  <div class="tray-dialog__head">
    <div>
      <h2 class="title" id="day-title">Change the delivery day</h2>
      <p class="tray-dialog__text" id="day-text">The order is not packed yet.</p>
    </div>
    <button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-close aria-label="Close">
      <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-x"/></svg>
    </button>
  </div>
  <div class="tray-dialog__body">…the fields…</div>
</dialog>
```

It is the browser's own `<dialog>`, opened with `showModal()`. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) describes what the browser then does: the rest of the page becomes inert, focus moves to the first control inside, and Escape closes it. In Chrome, focus then returns to the button that opened it. The script adds the `data-close` buttons and closing on a click outside the panel.

The two differ in what the copy holds. A shadcn/ui file holds the styles, as Tailwind classes, so you restyle a component by editing it. Tray UI's markup holds class names; the styles live in `bundle.css` and the behaviour in `bundle.js`, which you link and update by changing the version. To change the look, change the tokens. The [Theming](#d-theming) page puts the rule plainly: do not restyle a component by overriding its class, and if no token reaches what you want to change, the system is missing a token.

## The same catalogue

The Components list of the shadcn/ui docs has 66 entries, and every one of them has a Tray UI component of the same name: Sheet, Command, Field, Input Group, Item, Empty, Kbd, Native Select, Direction, Sidebar and the rest. Tray UI adds 42 more for the frame of a product and the pages around it, such as App Shell, Workspace Switcher, API Keys, Billing Summary, Notification Center, Plan Comparison and Video Player. Its 64 blocks are screens built from them: a dashboard, settings, sign-in pages, a checkout, fifteen sidebars.

The icons are Lucide's in both: shadcn/ui's manual setup installs `lucide-react`, and Tray UI's script carries 118 Lucide icons as a sprite, so `<use href="#tray-i-x"/>` draws the cross above with no request.

## Behaviour from one script

A component that needs a script carries `data-tray`. When the page has loaded, `bundle.js` finds each one and wires it: a menu gets its roles and keys, a combobox filters as you type, a data table sorts and pages. Most components need nothing: buttons, cards, fields, switches and tables are HTML and CSS, and the accordion is `<details>`.

Two calls cover the rest. Markup added after the page has loaded is wired with `TrayUI.init(root)`, and every behaviour reports what happened with a bubbling event, its value in `detail`:

```js
const list = document.querySelector('#orders');
list.insertAdjacentHTML('beforeend', rowHtml);   // markup from a server or a template
TrayUI.init(list);                               // wires any data-tray inside it

list.addEventListener('tray:select', (e) => {
  console.log('run', e.detail.value);            // a menu item's data-value
});
```

A page whose HTML comes from a server needs nothing more.

## Theming, token by token

shadcn/ui pairs each surface with a foreground: `primary` and `primary-foreground`, `card` and `card-foreground`. Dark mode overrides the same tokens under a `.dark` class, which a theme provider in React sets. Tray UI names tokens by role and sets them with `data-theme`, on `<html>` or on any element, with ten themes built in.

| shadcn/ui | Tray UI |
| --- | --- |
| `background`, `foreground` | `page`, `ink` |
| `card` | `surface`: a card is a grey tray |
| `popover` | `raised`: menus, popovers and dialogs |
| `primary`, `primary-foreground` | `accent`, `on-accent`: the one bright colour, for the main action |
| `muted-foreground` | `ink-soft`, or the lighter `ink-muted` |
| `accent`: hover and selected surfaces | `--tray-fill`, the fill a control takes on the ground it sits on |
| `border`, `input` | `hairline`; fields are filled, with no edge |
| `ring` | `ink`: the focus ring is 3px of ink |
| `destructive` | `danger` |
| `chart-1` to `chart-5` | `data-1` to `data-4` |
| `radius` | eight radii, from `--radius-card` down to `--radius-mark`, and `--radius-pill` |

Watch the word accent: in shadcn/ui it is a quiet hover fill, in Tray UI the loudest colour on the page.

## With React: trayui-react

For a React app that wants these components, `trayui-react` has the same 108, typed:

```tsx
import { Button, Dialog, Field, Input } from 'trayui-react';
import 'trayui-react/styles.css';

<Dialog
  title="Change the delivery day"
  description="The order is not packed yet."
  trigger={<Button variant="quiet">Change the day</Button>}
>
  <Field label="New day"><Input type="date" /></Field>
</Dialog>
```

It differs from shadcn/ui in kind. It is a package from npm, installed and updated as one, and its source does not live in your repository. Each component renders the markup and classes of its HTML original over the same stylesheet, and the same behaviours wire it, so a React page and a hand-written page look and act alike. Parts are props more than children: `title`, `trigger` and `footer` on a dialog, an `items` array on a dropdown menu. It needs React 18 or later and no provider. Its charts are drawn with Recharts, from `trayui-react/charts`, as shadcn/ui's Chart is.

## When each fits

shadcn/ui fits when:

- the app is React with Tailwind, or will be;
- you want each component's source in your repository, to change any line of it;
- the design is your own: it ships eight styles and a maker of presets, and nothing in a component is fixed;
- you want to choose the headless library, or publish your own components through a registry.

Tray UI fits when:

- the page has no React, or no build: HTML from a server, a static site, a prototype in one file;
- one finished design with rules suits you, retuned through tokens and ten themes;
- the same components must look the same in plain pages and in a React app;
- you need the frame of a product, from billing to a workspace switcher, as well as the controls.

## Start with Tray UI

[Installation](#d-installation) has the three lines to link. Each page under [Components](#components) has a live example and its markup to copy, and [Blocks](#blocks) has whole screens. [Styles and behaviour](#g-behaviour) lists every `data-tray` behaviour and its events, [Themes](#d-themes) shows the ten themes and makes your own, and [React](#d-react) covers `trayui-react`.
