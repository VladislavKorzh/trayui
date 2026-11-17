# How to build an accessible dropdown menu in HTML

A menu button in plain HTML and JavaScript: the ARIA roles, the keys, where focus goes, how it closes, and the events, with Tray UI's menu as the example.

A dropdown menu is a button that opens a short list of actions: Duplicate, Archive, Delete order. The WAI-ARIA Authoring Practices Guide (APG) describes it as the [menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), and the list it opens follows the [menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/). Each behaviour below is what Tray UI's [Dropdown Menu](#c-dropdown-menu) does, next to a short version you can write yourself.

## A menu, or a disclosure

`role="menu"` promises the behaviour of a menu in a desktop application: arrow keys between the items, one press of Tab to leave, items that run a command. Use it for actions on something on the screen, and for settings that apply to it. Two common cases are not menus.

- **Site navigation.** A header button that opens a panel of links is a disclosure: a button with `aria-expanded`, and a panel of ordinary links that Tab moves through. The APG's [disclosure navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) leaves the menu role out, because typical site navigation does not need the keyboard interaction of the menu pattern. A `role="menuitem"` on an `<a>` also replaces its role: the element is exposed as a menu item, no longer as a link.
- **A value for a form.** Choosing a country or a size is a select, not a menu. The Dropdown Menu's own rule sends it to [Select](#c-select).

Tray UI draws the same line. Its [Navigation Menu](#c-navigation-menu) opens its panels of links with a Popover, and says why: "The panel is a disclosure, not a menu: Tab moves through its links, Escape closes it." Its [Menubar](#c-menubar), the row of File, Edit and View in a working tool, carries the rule "Don't use a menubar for site navigation". The menubar and the [Context Menu](#c-context-menu) both reuse the items described here.

## The markup

- The trigger is a real `<button>`. `aria-haspopup="menu"` says it opens a menu, and `aria-expanded` says whether the menu is open: `"false"` until it opens, `"true"` while it is open. `aria-controls`, naming the menu's `id`, is optional in the APG.
- The list has `role="menu"` and a name. The APG asks for `aria-labelledby` pointing at the button, or an `aria-label`.
- Each action is `role="menuitem"`. A setting that is on or off is `role="menuitemcheckbox"` with `aria-checked`, and one choice among several is `role="menuitemradio"` with `aria-checked`.
- Every item has `tabindex="-1"`. The script moves focus to it, and Tab never stops on it.
- An `<hr>` between two groups is exposed as a separator.

Make the items buttons as well. A `<button>` fires `click` on Enter and on Space, so one click handler runs an item from the mouse and from the keyboard.

```html
<div class="menu">
  <button type="button" id="actions-button" aria-haspopup="menu"
          aria-expanded="false" aria-controls="actions-menu">Actions</button>
  <div role="menu" id="actions-menu" aria-labelledby="actions-button" hidden>
    <button type="button" role="menuitem" tabindex="-1" data-value="duplicate">Duplicate</button>
    <button type="button" role="menuitem" tabindex="-1" data-value="archive">Archive</button>
    <button type="button" role="menuitemcheckbox" tabindex="-1" aria-checked="false"
            data-value="notify">Notify the customer</button>
    <hr>
    <button type="button" role="menuitem" tabindex="-1" data-value="delete">Delete order</button>
  </div>
</div>
```

Tray UI's markup has the same shape: a `tray-anchor` with `data-tray="menu"` around the button and a `tray-pop` panel of `tray-option` buttons. Its script writes most of that ARIA: `role="menu"` on the panel, `aria-haspopup="menu"` and `aria-expanded` on the button, `tabindex="-1"` on every item. Radio items that belong together share a `data-group`, which the script reads to uncheck the others when one is chosen.

## The keyboard

These are the keys of Tray UI's menu.

| Key | Where | What happens |
| --- | --- | --- |
| Enter or Space | On the button | Opens the menu and moves focus to its first item. |
| ArrowDown | On the button | Opens the menu on its first item. |
| ArrowDown, ArrowUp | In the menu | The next or the previous item, wrapping at the ends. |
| Home, End | In the menu | The first or the last item. |
| Enter or Space | On an action | Runs it, closes the menu and returns focus to the button. |
| Enter or Space | On a check or radio item | Sets `aria-checked`; the menu stays open. |
| Escape | On the button or in the menu | Closes the menu and returns focus to the button. |
| Tab | In the menu | Focus moves on to the next control on the page, and the menu closes. |

The APG marks two keys as optional, and Tray UI has neither: ArrowUp on the button, which opens the menu on its last item, and type-ahead, where a typed letter moves to the next item that starts with it. The script below has ArrowUp. Type-ahead matters most in long menus; the Dropdown Menu keeps to about eight items, and the arrows reach each of them in a few presses.

The APG lets Space change a check or radio item without closing the menu. In Tray UI, Enter does the same, because both keys click the button and one handler sees the click.

Move real focus, with `focus()` on the item, not a class that only looks like focus. Enter and Space then click the focused button, `:focus-visible` styles it, and `focus()` scrolls it into view when the list scrolls. Tray UI draws a 3px ink ring inside the edge of the item under focus (`outline-offset: -3px`).

## Closing the menu

A menu closes in five ways, and each one decides where focus goes.

1. **An action runs.** The menu closes and focus returns to the button, so the next Tab starts where the person was.
2. **Escape.** The menu closes and focus returns to the button. Tray UI also stops the event there, so a dialog around the menu is not asked to close too.
3. **Tab.** Focus has already moved to the next control, and the menu closes behind it. Tray UI listens for `focusout` on the button and the panel, and closes the menu when `relatedTarget`, the element that receives focus, lies outside both. Version 0.2.0 added it: "Menus and lists close on Tab, as they close on Escape."
4. **A click outside.** A `pointerdown` listener on the document closes the menu when its target is outside the button and the panel. Focus goes where the click sends it.
5. **The button again.** A second click on the button closes the menu.

A click on plain text inside the panel moves focus to no element in particular, and `relatedTarget` is `null`. Tray UI leaves the menu open then; the `pointerdown` check already handles clicks outside it.

## A script from scratch

This runs the markup above. It covers the keys in the table for actions and check items, ArrowUp on the button, and every way of closing; radio items need one more branch, which unchecks the others in their group.

```js
const root = document.querySelector('.menu');
const button = root.querySelector('[aria-haspopup]');
const menu = root.querySelector('[role="menu"]');
const items = () => [...menu.querySelectorAll('[role^="menuitem"]')];

function open(last) {
  menu.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  const list = items();
  list[last ? list.length - 1 : 0].focus();
}

function close(back) {
  if (menu.hidden) return;
  menu.hidden = true;
  button.setAttribute('aria-expanded', 'false');
  if (back) button.focus();
}

// Enter and Space click a button, so this also opens the menu from the keyboard.
button.addEventListener('click', () => (menu.hidden ? open() : close()));

button.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  e.preventDefault();
  open(e.key === 'ArrowUp');
});

menu.addEventListener('keydown', (e) => {
  const list = items(), i = list.indexOf(document.activeElement);
  const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: list.length - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  list[(to + list.length) % list.length].focus();
});

root.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !menu.hidden) { e.preventDefault(); close(true); }
});

menu.addEventListener('click', (e) => {
  const item = e.target.closest('[role^="menuitem"]');
  if (!item) return;
  if (item.getAttribute('role') === 'menuitemcheckbox') {
    item.setAttribute('aria-checked', String(item.getAttribute('aria-checked') !== 'true'));
    return; // the menu stays open
  }
  close(true);
  console.log('run', item.dataset.value);
});

// Tab, or a click on another control, moves focus out of the menu: it closes.
root.addEventListener('focusout', (e) => {
  if (e.relatedTarget && !root.contains(e.relatedTarget)) close();
});
document.addEventListener('pointerdown', (e) => {
  if (!root.contains(e.target)) close();
});
```

- **Listen on the wrapper.** The `focusout` listener is on the wrapper, not on the menu. A click on the button while the menu is open moves focus from an item to the button, which is still inside the wrapper, and the click handler then closes the menu once. A menu that closed on that `focusout` would be opened again by the click.
- **Keep the hidden attribute working.** `hidden` hides the menu only while no rule of yours sets its `display`: any `display` in your CSS beats the browser's own `[hidden]` rule. Tray UI's base stylesheet has `[hidden] { display: none !important; }`; add the same line if your menu needs a `display` of its own.
- **One menu per page.** For more, run the same code once for each `.menu`, as Tray UI runs its code once for each `data-tray="menu"`.

## Positioning

Tray UI places the panel with CSS alone. The anchor is `position: relative`, and the panel is absolutely positioned 8px under it, at least as wide as the button and never wider than the screen. These are its rules for placement:

```css
.tray-anchor { position: relative; display: inline-block; }
.tray-pop {
  position: absolute;
  inset-block-start: calc(100% + var(--space-2));
  inset-inline-start: 0;
  z-index: var(--z-float);
  min-inline-size: max(100%, 12rem);
  max-inline-size: calc(100vw - 2rem);
}
.tray-pop--end { inset-inline-start: auto; inset-inline-end: 0; }
.tray-pop--top { inset-block-start: auto; inset-block-end: calc(100% + var(--space-2)); }
```

The logical properties (`inset-inline-start` in place of `left`) line the panel up with the right edge under `dir="rtl"`. `tray-pop--end` aligns it with the end edge, for a "more" button at the end of a row; `tray-pop--top` opens it above the button.

Nothing measures the viewport and nothing flips the panel: you choose the side where there is room. An ancestor of the menu with `overflow: hidden` or `overflow: auto` clips the panel, so keep menus out of such boxes, or give the box room for the open panel.

## Submenus

Tray UI allows one level of submenu. Wrap the item and a second panel in `tray-submenu`:

```html
<div class="tray-submenu">
  <button type="button" class="tray-option" role="menuitem" aria-haspopup="menu">
    <span class="tray-option__text">Move to</span>
  </button>
  <div class="tray-pop tray-pop--side">
    <div class="tray-list">
      <button type="button" class="tray-option" role="menuitem"><span class="tray-option__text">Packed</span></button>
      <button type="button" class="tray-option" role="menuitem"><span class="tray-option__text">On hold</span></button>
    </div>
  </div>
</div>
```

The script makes the second panel a `menu` of its own, named by its item through `aria-labelledby`, and gives the item `aria-expanded`. ArrowRight, Enter or Space on the item opens the submenu on its first item; ArrowLeft or Escape closes it and returns focus to the item. Under `dir="rtl"` the submenu opens to the left and the two arrows swap. ArrowUp and ArrowDown stay inside the submenu, and in the parent menu they step over its items. Escape in the submenu closes the submenu alone, not the menu around it.

The pointer resting on the item opens the submenu too. It closes 300 milliseconds after the pointer has left both the item and the panel, unless focus is inside it, so a pointer can cross the gap between them. The item that opens a submenu runs nothing itself; an action inside the submenu closes the whole menu.

## The events a script listens to

Tray UI's menu reports what happened with events on the `data-tray="menu"` element:

- `tray:select`, with `detail.value`, when an action runs. The menu closes.
- `tray:change`, with `detail.value` and `detail.checked`, when a check or radio item changes. The menu stays open. Before 0.2.0 these items fired `tray:select`.
- `tray:open` and `tray:close`, on the button, when the menu opens and closes.

The events bubble, so one listener on a parent can serve several menus. `detail.value` is the item's `data-value`, or its text when it has none, and that text includes a shortcut hint inside the item: "Duplicate" with "Ctrl D" beside it gives `"DuplicateCtrl D"`. Give each item a `data-value`.

```js
const menu = document.querySelector('#order-menu');

menu.addEventListener('tray:select', (e) => {
  console.log('run', e.detail.value);             // "duplicate"
});

menu.addEventListener('tray:change', (e) => {
  console.log(e.detail.value, e.detail.checked);  // "notify" true
});
```

## The dropdown menu in Tray UI

Write the button and the panel, with `data-tray="menu"` on the anchor around them:

```html
<span class="tray-anchor" data-tray="menu" id="order-menu">
  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" id="order-actions">Actions</button>
  <div class="tray-pop" aria-labelledby="order-actions">
    <div class="tray-list">
      <button type="button" class="tray-option" role="menuitem" data-value="duplicate">
        <span class="tray-option__text">Duplicate</span>
        <span class="tray-option__meta">Ctrl D</span>
      </button>
      <button type="button" class="tray-option" role="menuitemcheckbox" aria-checked="false" data-value="notify">
        <span class="tray-option__text">Notify the customer</span>
        <svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg>
      </button>
      <hr class="tray-list__rule">
      <button type="button" class="tray-option tray-option--danger" role="menuitem" data-value="delete">
        <span class="tray-option__text">Delete order</span>
      </button>
    </div>
  </div>
</span>
```

The three files do the rest: `tokens.css`, `components/bundle.css` and `components/bundle.js`. The script adds the roles, `aria-haspopup`, `aria-expanded` and the `tabindex` values, and handles the keys, the closing, the submenu and the events above; `aria-checked` draws the tick. It names the panel by itself only when the panel has a head (`tray-pop__head`), as a user menu does, so the `aria-labelledby` above is yours to write. An icon-only button needs an `aria-label`, such as "More actions". For markup added after the page has loaded, call `TrayUI.init(root)`.

The [Dropdown Menu](#c-dropdown-menu) page has a live example, the submenu and the rules for writing items, and [Installation](#d-installation) has the lines that link the three files.
