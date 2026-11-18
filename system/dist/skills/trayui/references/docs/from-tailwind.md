# Coming from Tailwind

How Tailwind habits map to Tray UI, a design system in plain HTML and CSS: what differs, how to move a screen across, and when to keep Tailwind.

## How the two differ

Tailwind gives you small classes, mostly one property each, and you compose the design in the markup: a card is `rounded-xl bg-white p-6 shadow-sm`. Tray UI gives you one class per component and a set of tokens: the card is `tray-card`, and its fill, corners and padding come from custom properties in `tokens.css`.

- **Build step.** Tailwind scans your files and writes the CSS they use. Tray UI is three files you link: no compiler, no config.
- **Design.** Tailwind has no look of its own: the design is yours. Tray UI is a finished design with rules: one yellow for the main action, flat grey trays, very round corners. You retune its tokens, not its structure.
- **States and behaviour.** In Tailwind you write `hover:` and `dark:` on each element and bring a library for menus and dialogs. In Tray UI each class carries its states, `data-theme` picks one of ten themes, and a `data-tray` attribute wires up a behaviour.

## Habits, translated

The left column is Tailwind 4. Where no class fits, a token does.

| In Tailwind | In Tray UI |
| --- | --- |
| A card: `rounded-xl bg-white p-6 shadow-sm` (`shadow` in version 3) | `tray-card`: a grey tray, 40px corners, no shadow. `tray-panel` is the white panel inside it. |
| `flex flex-wrap items-center gap-4` | `tray-row`; `tray-row--sm` for `gap-2`, `tray-row--between` for `justify-between`. |
| `flex flex-col gap-4` | `tray-stack`; `tray-stack--sm` for `gap-2`, `tray-stack--lg` for `gap-6`. |
| `grid grid-cols-12 gap-4` with `col-span-8` | `tray-bento` with `tray-span-4` to `tray-span-8`, full width below 56rem. |
| `mx-auto max-w-7xl px-4` | `tray-container`: centred, with `--page-pad` at the edges. |
| `text-4xl font-bold tracking-tight` | A type style named for its role: `display`, `headline`, `title`, `subtitle`, `lead`, `body`, `caption`. |
| `text-gray-500` | `tray-soft`, or the lighter `tray-muted`. In your own CSS, `var(--ink-soft)`. |
| A primary button: `rounded-md bg-indigo-600 px-4 py-2.5 font-semibold text-white` | `tray-btn`, once per view; `tray-btn--quiet` for the rest. |
| A label, an input and a hint, each with its utilities | `tray-field` around `tray-label`, `tray-input` and `tray-field__hint`. For an error, `aria-invalid="true"` and `tray-field__error`. |
| `hover:`, `active:` and `focus-visible:` | Nothing: each class has its hover, press and focus ring. |
| `dark:` variants | Nothing: `data-theme="dark"`, or another theme, on `<html>` or any element. |
| `sr-only` | `tray-vh` |
| Headless UI's `Menu`, or Alpine's `x-data` and `x-show` | `data-tray="menu"` on a `tray-anchor` around the button and its `tray-pop`: see [Dropdown Menu](https://trayui.com/components/dropdown-menu.md). |
| Headless UI's `Dialog` | `<dialog class="tray-dialog" data-tray="dialog">`, opened by a button with `data-tray="open"` and `data-target`: see [Dialog](https://trayui.com/components/dialog.md). |
| `p-6`, `gap-6`, `mt-6` | `--space-6`, also 24px: the space tokens share Tailwind's 4px steps. For layout, `--card-pad`, `--grid-gap` and `--section-gap`. |
| `@apply` in a class of your own | A plain rule that reads the tokens, as below. |

For a part the system does not have, write the rule yourself. `--tray-fill` is the fill a control takes on its ground, so this note is grey on the page and white in a card ([Grounds and nesting](https://trayui.com/docs/grounds.md)).

```css
.order-note {
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-input);
  background: var(--tray-fill);
  color: var(--ink-soft);
}
```

## One card, both ways

A heading, a sentence, a field with a hint and a button. In Tailwind 4:

```html
<form class="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
  <h2 class="text-2xl font-bold tracking-tight text-gray-900">Track an order</h2>
  <p class="text-gray-600">We show where it is and when it arrives.</p>
  <div>
    <label class="block text-sm font-medium text-gray-900" for="order">Order number</label>
    <input class="mt-2 block w-full rounded-md bg-white px-3 py-2 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
           id="order" name="order" aria-describedby="order-hint">
    <p class="mt-2 text-sm text-gray-500" id="order-hint">It is on the receipt, under the total.</p>
  </div>
  <button class="rounded-md bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          type="submit">Find the order</button>
</form>
```

In Tray UI:

```html
<form class="tray-card tray-stack">
  <h2 class="subtitle">Track an order</h2>
  <p class="tray-soft">We show where it is and when it arrives.</p>
  <div class="tray-field">
    <label class="tray-label" for="order">Order number</label>
    <input class="tray-input" id="order" name="order" aria-describedby="order-hint">
    <p class="tray-field__hint" id="order-hint">It is on the receipt, under the total.</p>
  </div>
  <button class="tray-btn" type="submit">Find the order</button>
</form>
```

- **The look lives in the classes.** The grey tray, the white field and the yellow button come from three classes; a token change reaches every card.
- **States come with them.** `aria-invalid="true"` on the input draws the red ring; a `tray-field__error` takes the place of the hint.
- **Dark costs nothing.** The Tailwind card needs a `dark:` variant on most of its classes; this one follows `data-theme`.
- **They do not look alike.** The first is your design, the second is the system's. That is the trade.

## Move a screen across

1. Start from the nearest [block](https://trayui.com/blocks.md), not from your old markup.
2. Pick the frame: the app shell (`tray-app`) for a product, `tray-screen` for the rest ([Page layouts](https://trayui.com/docs/layouts.md)).
3. Swap each card, field and button for its component, and delete the utilities it replaces.
4. Swap the layout utilities that remain for `tray-row`, `tray-stack` and `tray-bento`, or keep them.
5. Delete every `dark:` variant and look at the screen in two or three themes.
6. Replace the menu and dialog scripts with `data-tray`; call `TrayUI.init(root)` on markup added later.
7. Count the yellow: one primary button per view.

## Using both

You can keep Tailwind: utilities for layout glue, Tray UI for the components, and the tokens as Tailwind's theme, so both use the same colours and sizes.

```html
<main class="tray-container grid gap-grid py-section bento:grid-cols-[2fr_1fr]">
  <form class="tray-card tray-stack">…the card above…</form>
  <aside class="tray-card self-start">
    <p class="caption text-ink-soft">Orders leave the farm at 9:00.</p>
  </aside>
</main>
```

`gap-grid`, `py-section`, `text-ink-soft` and `bento:` come from the theme in the `tailwind/` folder. [Tailwind and Figma](https://trayui.com/docs/tailwind-figma.md) has the import lines and every name.

- **Put utilities around components, not on them.** Tailwind 4 puts its utilities in a cascade layer and `bundle.css` has none, so where both set the same property, the `tray-` class wins: `p-4` on a `tray-card` does nothing. In version 3, which has no layers, the later stylesheet wins. What the class leaves alone, such as a margin or `self-start`, is free.
- **Change a token, not a component.** For calmer corners, set `--radius-card`; [Theming](https://trayui.com/docs/theming.md) says how.

## When Tailwind is the better choice

- **A design of your own.** Tray UI is one design with rules. Its tokens change the colours, the corners and the type, not the flat, one-yellow structure. If your brand looks nothing like it, start from Tailwind.
- **One-off layouts.** A landing page drawn section by section, or a screen unlike any other. Utilities describe a layout that exists once; the layouts of Tray UI are a fixed set, made to be reused.
- **A large codebase already in Tailwind.** Rewriting screens that work costs more than it gains. Use the tokens as a theme and move a screen when you rebuild it.
- **Only the CSS you use.** Tailwind writes only the classes your files use; Tray UI ships its whole stylesheet. Tailwind also has editor tooling Tray UI lacks: completion, linting, class sorting.

## Where to go next

- [Installation](https://trayui.com/docs/installation.md): the three files and a first screen.
- [Components](https://trayui.com/components.md): each with a live example and its markup.
- [Blocks](https://trayui.com/blocks.md): whole screens to copy.
- [React](https://trayui.com/docs/react.md), if your Tailwind project is in React: the same components, typed.
