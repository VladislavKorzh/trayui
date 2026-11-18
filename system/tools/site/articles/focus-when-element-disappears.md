# Where focus goes when its element disappears

A focused button that is removed, hidden or disabled drops focus to the body. Where to send it instead, what WCAG asks, and a small rescue() helper.

A keyboard user presses "One more" until the quantity reaches its limit, and the button turns `disabled` under their finger. A toast's close button takes the toast away. A chip's remove button removes the chip, and itself with it. Each time, the element that had focus is gone, and unless a script moves focus first, it lands nowhere useful.

## What the browser does

The HTML Standard covers both cases. When the focused element is removed, the [removing steps](https://html.spec.whatwg.org/multipage/infrastructure.html#html-removing-steps) set the document's focused area to its viewport at once. When it stays in the page but can no longer take focus, the [focus fixup](https://html.spec.whatwg.org/multipage/webappapis.html#focus-fixup-rule) runs at the next update of the rendering: "if the focused area of doc is not a focusable area, then run the focusing steps for doc's viewport". The standard's own examples are an element that "has the hidden attribute added" and "an input element when the element gets disabled".

The viewport is no element, so `document.activeElement` returns `<body>`. Here is what Chromium 157 did with a focused `<button>` placed between two others:

| What happened to the focused button | `activeElement` at once | One frame later | The next Tab |
| --- | --- | --- | --- |
| `remove()` | `body` | `body` | the button after it |
| `hidden = true` | `body` | `body` | the button after it |
| `style.display = 'none'` | the button | `body` | the button after it |
| `disabled = true` | the button | `body` | the button after it |
| `inert` on its parent | the button | `body` | the button after it |
| `style.visibility = 'hidden'` | the button | `body` | the button after it |

Chromium fired `blur` and `focusout` on the button in all six cases, even on removal, where the standard says no blur event is fired.

The last column is kinder than it could be. Chromium keeps what the standard calls the [sequential focus navigation starting point](https://html.spec.whatwg.org/multipage/interaction.html#sequential-focus-navigation-starting-point) where the button was, so the next Tab moves on from there. Until that Tab, though, no control has focus. A sighted keyboard user sees no focus ring anywhere. Enter presses nothing. Keys now start at `<body>`, so a `keydown` listener on the component, such as the Escape handler of a menu, no longer hears them. The person who pressed Enter five times to reach the limit presses it a sixth time, and nothing happens.

## What WCAG asks

Success criterion 2.4.3 Focus Order (level A) asks that "focusable components receive focus in an order that preserves meaning and operability". Its [Understanding document](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) does not mention a removed button, but its examples of dialogs come close: when a modal dialog is dismissed, "focus returns to the button or the element following the button". Focus left on `<body>` keeps neither. Success criterion 2.4.7 Focus Visible (level AA) asks for a visible focus indicator, and with the body focused there is no control to draw one on.

The WAI-ARIA Authoring Practices (APG) make the same choice in a paged grid: "when the grid is showing the first page and the 'Next' button receives focus, users can infer that the 'Previous' button is disabled". The button that turns off hands focus to its partner.

## Where focus should go

Take the first of these that exists:

1. **The control that does the same job.** The other half of a pair: Previous hands focus to Next. The next item of the same kind: the next chip's remove button, or the one before it when the last chip went.
2. **What it belonged to.** The group around a stepper, the track of a carousel, the list that held the item. A container that cannot take focus gets `tabindex="-1"`, which the APG describes as "not included in the tab sequence but is focusable with element.focus()".
3. **The next control in the page, as Tab would go.** For a banner or a cookie panel that closes for good.
4. **Where the person came from.** A toast reached from a form sends focus back to the control it came from. A tour that ends sends it to the part of the page the last step pointed at. A submenu that closes sends it to its item.

The top of the page is never on the list, and neither is the first control of the page: both make the person walk back to where they were.

## Move focus before the element goes

The order matters. Once the element is removed or hidden, `document.activeElement` is already `<body>`, and a script can no longer tell that focus was inside it. So focus moves first, and the element goes second.

Focus also moves only when it is inside the element. A toast that times out while the person types in a field must leave the field alone, and a chip removed by a script has no business pulling focus from wherever it is.

## A rescue() helper

These two rules fit in one function. `el` is the element about to go; `to` is where focus should land, or a function that finds it.

```js
function rescue(el, to) {
  const active = document.activeElement;
  if (!el || !active || (el !== active && !el.contains(active))) return;
  const target = typeof to === 'function' ? to() : to;
  if (!target || !target.focus || !target.isConnected) return;
  if (!target.matches('a[href], button, input, select, textarea, summary, [tabindex]')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
}
```

- It returns at once unless focus is on `el` or inside it.
- When `to` is a function, it runs only after that check, so it sees the page as it is at that moment: which chip comes next, whether the list is now empty.
- A target that cannot take focus, such as a `<div>` that groups buttons, gets `tabindex="-1"`. It takes focus from the script and stays out of the Tab order.
- `preventScroll: true` keeps the page still. The target sits beside the element that went, so it is normally in view already.

## Removable chips

A row of filter chips, each with a remove button, and a button after them to add another:

```html
<div class="chips" role="group" aria-label="Filters">
  <span class="chip">Paid <button type="button" aria-label="Remove Paid">×</button></span>
  <span class="chip">Shipped <button type="button" aria-label="Remove Shipped">×</button></span>
  <span class="chip">Refunded <button type="button" aria-label="Remove Refunded">×</button></span>
</div>
<button type="button" id="add-filter">Add filter</button>
```

```js
const chips = document.querySelector('.chips');

chips.addEventListener('click', (e) => {
  const button = e.target.closest('button');
  if (!button) return;
  const chip = button.closest('.chip');
  rescue(chip, () => {
    const next = chip.nextElementSibling || chip.previousElementSibling;
    return next ? next.querySelector('button') : document.getElementById('add-filter');
  });
  chip.remove();
});
```

In Chromium, Enter on "Remove Shipped" removes that chip and puts focus on "Remove Refunded". Enter again moves it to "Remove Paid", the chip before, and Enter on the last chip moves it to "Add filter". Remove a chip with a click while focus is in another control, and focus stays in that control.

## The next control, as Tab would go

For a banner that closes for good, Tray UI looks for the first control after it in the page, then for `<main>`, then for the last control before it. A shorter version of its function:

```js
const CONTROLS = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
  'select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function beyond(el) {
  const all = [...document.querySelectorAll(CONTROLS)]
    .filter((n) => !el.contains(n) && n.getClientRects().length > 0);
  const after = (n) => el.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING;
  return all.find(after) || document.querySelector('main') || all.filter((n) => !after(n)).pop();
}

rescue(banner, () => beyond(banner));
banner.hidden = true;
```

`getClientRects().length > 0` leaves out controls that are not rendered, such as those inside a closed panel. When `<main>` is the answer, `rescue()` gives it `tabindex="-1"`, and the next Tab goes to the first control inside it.

## Disabled, or marked as disabled

`disabled` takes a button out of the Tab order, and focus with it. `aria-disabled="true"` says the button is unavailable and keeps it focusable; the script then ignores its presses. The APG weighs the two: when people "can reasonably infer the presence of a disabled element from nearby focusable elements", it is removed from the focus order with `disabled`; when it "does need to remain discoverable", `aria-disabled` keeps it there.

A stepper and a pair of Previous and Next buttons fall in the first group: the partner is right beside it. A lone command that comes back later, such as "Mark all as read" in a panel of notifications, falls in the second. Tray UI's [Notification Center](#c-notification-center) makes that button `aria-disabled` when nothing is unread, so it keeps focus when it is the button that was pressed, and it stays the first stop in the panel.

## Focus in Tray UI

Since version 0.2.0, the components that hide or turn off a control under focus hand focus on first. Tray UI's function is the `rescue()` above, and it is public as `TrayUI.rescue(el, to)`. A stepper calls it in two lines, before the button turns off:

```js
if (off) rescue(b, root);
b.disabled = off;
```

| Component | When | Focus goes to |
| --- | --- | --- |
| [Button Group](#c-button-group) stepper | a step button reaches `data-min` or `data-max` | the group |
| [Carousel](#c-carousel) | Previous or Next at an end | the other button, or the track |
| [Data Table](#c-data-table) | Previous on the first page, Next on the last | the other button, or the line that says which rows show |
| [Toast](#c-toast) | dismissed, or its action run | the next toast's first button, the one before, or where focus came from |
| [Banner](#c-banner), [Cookie Consent](#c-cookie-consent) | closed | the next control, as Tab would go, or `main` |
| [Filter Bar](#c-filter-bar) | a chip removed | the next chip's remove button, the one before, or the menu the filter came from |
| [File Upload](#c-file-upload) | a file removed | the next file's remove button, the one before, or the file field |
| [Tour](#c-tour) | skipped, finished or closed with Escape | the part of the page the step pointed at |
| [Dropdown Menu](#c-dropdown-menu) | a submenu closes | its item |
| [Video Player](#c-video-player) | the large play button goes as the film starts | the play button in the bar |

On the Button Group page, Enter on "One more" at the limit leaves focus on the group, and the next Tab goes to "One fewer", the button that still works. The toast's order is worked through in [Toast notifications that screen readers announce](#a-toast-notifications-screen-readers), and the carousel's in [A carousel that keeps focus at its end](#a-carousel-focus).

For your own scripts, call it before you hide:

```js
TrayUI.rescue(panel, () => document.getElementById('open-filters'));
panel.hidden = true;
```

Like the rest of version 0.2.0, this was checked in Chrome and its accessibility tree, not yet in a screen reader. The [Accessibility](#g-accessibility) guide has the rules every component follows.
