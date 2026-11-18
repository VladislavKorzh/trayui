# Nested submenus that work from the keyboard

A submenu in plain HTML and JavaScript: its markup, the keys that open and close it, aria-expanded, where focus goes, and the pointer, with Tray UI's menus.

A submenu is an item of a menu that opens a second menu beside it: Move to, then Packed or On hold. The WAI-ARIA Authoring Practices Guide (APG) covers it in its [menu and menubar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/): "If activating a menuitem opens a submenu, the menuitem is known as a parent menuitem." The menu around it is the subject of [How to build an accessible dropdown menu in HTML](#a-accessible-dropdown-menu), which gives submenus a short section. What follows is the submenu itself: the markup, the keys, the script, and the mistakes that break nested menus for a keyboard.

## The parent item and its menu

The APG asks for four things.

- The parent item is a `menuitem` with `aria-haspopup="menu"` (or `"true"`).
- Its `aria-expanded` is "set to false when its child menu is not visible and set to true when the child menu is visible."
- The submenu is a `menu` with a name: `aria-labelledby` pointing at the parent item, or an `aria-label`.
- The submenu is "contained inside the same menu element as its parent menuitem" and is "the sibling element immediately following its parent menuitem."

```html
<div role="menu" id="actions-menu" aria-labelledby="actions-button" hidden>
  <button type="button" role="menuitem" tabindex="-1">Duplicate</button>
  <div class="submenu">
    <button type="button" role="menuitem" tabindex="-1" id="move-item"
            aria-haspopup="menu" aria-expanded="false">Move to</button>
    <div role="menu" aria-labelledby="move-item" hidden>
      <button type="button" role="menuitem" tabindex="-1" data-value="packed">Packed</button>
      <button type="button" role="menuitem" tabindex="-1" data-value="on-hold">On hold</button>
    </div>
  </div>
  <hr>
  <button type="button" role="menuitem" tabindex="-1" data-value="delete">Delete order</button>
</div>
```

The `div` around the pair has no role. It is there for the CSS that places the submenu and for the pointer events further down. In Chrome's accessibility tree it shows as a `generic` node with the item and its menu side by side inside it, and the submenu stays inside the outer menu, as the APG asks. While the submenu is `hidden` it is not rendered, so its items are not in the accessibility tree until it opens.

## The keys

| Key | Where | What happens |
| --- | --- | --- |
| ArrowRight | On the parent item | Opens the submenu and moves focus to its first item. |
| Enter or Space | On the parent item | The same. The parent item runs nothing itself. |
| ArrowDown, ArrowUp | In the submenu | The next or the previous item of the submenu, wrapping at the ends. |
| Home, End | In the submenu | Its first or its last item. |
| ArrowLeft | In the submenu | Closes it and returns focus to the parent item. |
| Escape | In the submenu | The same. The menu around it stays open. |
| ArrowDown, ArrowUp | In the outer menu | Step over the submenu's items, whether it is open or not. |
| Tab | In the submenu | Focus moves on to the next control, and both menus close. |

Most of this comes from the APG. Enter on a parent item "opens the submenu and places focus on its first item", and so does ArrowRight. ArrowLeft in a submenu "closes the submenu and returns focus to the parent menuitem". Escape closes "the menu that contains focus" and returns focus to where that menu was opened from, so it closes one level at a time: the first press closes the submenu, the second closes the outer menu and returns to its button. Space is optional in the APG; on a `<button>` it fires `click`, as Enter does, so one click handler serves both keys and the mouse.

## Two menus, one stream of keys

The submenu sits inside the outer menu in the DOM, so a key pressed in it bubbles up to the outer menu's listeners as well. Two things go wrong unless the submenu deals with that.

1. **The outer menu moves focus too.** Its arrow-key listener looks for the focused element among its own items, does not find it, and moves focus to one of them: ArrowDown lands on its first item. The submenu has to call `stopPropagation()` on every key it handles: its arrows, Home and End, the arrow back and Escape. Without it, one Escape closes both menus.
2. **The outer menu counts the submenu's items as its own.** A query for `[role^="menuitem"]` inside the outer menu finds Packed and On hold, and ArrowDown on Move to lands on Packed. The outer menu needs its own items only: those whose nearest `menu` ancestor is the outer menu.

Tray UI writes the second rule as one selector, `[role^="menuitem"]:not(.tray-submenu > .tray-pop *)`, which leaves out every item inside a submenu's panel.

The keys the submenu does not handle keep bubbling, and that is useful. Tab moves focus out of both menus, and the outer menu's `focusout` listener closes it. In a menubar, ArrowRight on an item of the submenu reaches the bar, which moves on to the next menu.

## Move focus before you hide

When the submenu closes with focus inside it, focus goes back to the parent item, and it has to go there before the submenu is hidden. Hide it first, and Chrome drops focus to the `body` at the next rendering step, with a `focusout` whose `relatedTarget` is `null`. The outer menu's arrow keys then stop working, because its listener is on the menu and focus is no longer in it.

Tray UI's submenu calls `rescue(sub, item)` before it takes away the panel's `data-open`. `rescue()` moves focus only when focus is inside the element that is going, so a submenu that closes after the pointer has left it leaves focus where it was. It is public as `TrayUI.rescue(el, to)`.

## A script for the submenu

This adds submenus to the script of the dropdown menu article, which runs the outer menu. That script needs two changes first: `items()` keeps the menu's own items only, and the click handler skips a parent item.

```js
const items = () => [...menu.querySelectorAll('[role^="menuitem"]')]
  .filter((i) => i.parentElement.closest('[role="menu"]') === menu);

menu.addEventListener('click', (e) => {
  const item = e.target.closest('[role^="menuitem"]');
  if (!item || item.hasAttribute('aria-haspopup')) return; // a parent item runs nothing
  // …the rest of the handler, as before
});
```

Then one function, run once for each submenu:

```js
function submenu(box) {
  const item = box.querySelector(':scope > [aria-haspopup]');
  const sub = box.querySelector(':scope > [role="menu"]');
  const subItems = () => [...sub.querySelectorAll('[role^="menuitem"]')];
  const rtl = () => getComputedStyle(box).direction === 'rtl';
  let timer;

  function show(focus) {
    clearTimeout(timer);
    sub.hidden = false;
    item.setAttribute('aria-expanded', 'true');
    if (focus) subItems()[0].focus();
  }

  function hide() {
    clearTimeout(timer);
    if (sub.contains(document.activeElement)) item.focus(); // before it is hidden
    sub.hidden = true;
    item.setAttribute('aria-expanded', 'false');
  }

  // Enter and Space click the item, so this opens it from the keyboard too
  item.addEventListener('click', () => show(true));

  item.addEventListener('keydown', (e) => {
    if (e.key !== (rtl() ? 'ArrowLeft' : 'ArrowRight')) return;
    e.preventDefault();
    e.stopPropagation();
    show(true);
  });

  sub.addEventListener('keydown', (e) => {
    const back = rtl() ? 'ArrowRight' : 'ArrowLeft';
    const list = subItems(), i = list.indexOf(document.activeElement);
    const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: list.length - 1 }[e.key];
    if (to !== undefined) list[(to + list.length) % list.length].focus();
    else if (e.key === back || e.key === 'Escape') hide();
    else return;
    e.preventDefault();
    e.stopPropagation(); // the menu around it must not act on these keys too
  });

  box.addEventListener('pointerenter', () => show(false));
  box.addEventListener('pointerleave', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { if (!sub.contains(document.activeElement)) hide(); }, 300);
  });
  box.addEventListener('focusout', (e) => {
    if (!box.contains(e.relatedTarget)) hide();
  });
}

menu.querySelectorAll('.submenu').forEach(submenu);
```

- **An action in the submenu** bubbles to the outer menu's click handler, which closes the outer menu and returns focus to its button. Focus leaving the wrapper closes the submenu on the way.
- **The direction is read at each key press**, so a page that changes `dir` after it has loaded still gets the right arrows.
- **Escape is stopped in the submenu**, so the outer menu's Escape listener only hears the second press.

## Right to left

Under `dir="rtl"` the submenu opens on the left of its item, and the arrows swap: ArrowLeft opens it and ArrowRight closes it. The [right-to-left article](#a-right-to-left-arrows) covers which other arrows flip. Place the submenu with logical properties and it moves with the direction, with no rule of its own for right to left.

```css
.submenu { position: relative; }
.submenu > [role="menu"] {
  position: absolute;
  inset-block-start: -6px;
  inset-inline-start: calc(100% + 8px);
}
```

These are the two lines of Tray UI's `tray-pop--side`. The `-6px` lifts the submenu by the 6px padding of a panel, so its first item lines up with the parent item, and the 8px is `--space-2`, the gap between the two. The chevron on the parent item carries `tray-icon--flip`, which mirrors it under `dir="rtl"`.

## The pointer

Tray UI's submenu opens when the pointer enters its item, at once, and focus does not move. A person who uses the keyboard and the mouse together keeps their place: focus stays on the item where the keyboard left it.

It closes 300 milliseconds after the pointer has left the item and the submenu both. Between them is the 8px gap, and a pointer on its way to On hold may also cut across the item below; the wait gives it time to arrive. `pointerleave` fires when the pointer leaves an element and all its descendants, and the item and the submenu are both inside the wrapper, so moving from one to the other fires nothing until the pointer is over the gap or the item below. Reaching the submenu fires `pointerenter` on the wrapper again, which clears it. The submenu also stays open while focus is inside it, whatever the pointer does, and closes when focus leaves the wrapper, as when ArrowDown in the outer menu moves past the parent item. A click on the parent item opens the submenu and moves focus to its first item, as Enter does.

Tray UI shows the submenu with an attribute that its script sets, `data-open`, and its CSS only reads it: `.tray-submenu > .tray-pop { display: none; }` and `.tray-submenu > .tray-pop[data-open] { display: block; }`. A rule on `:hover` would close the submenu the moment the pointer reached the gap, and a rule on `:focus-within` would show it each time ArrowDown passed over its item. Neither can change `aria-expanded`, which has to say what the eye sees.

## Submenus in a menubar and a context menu

In a menubar the APG gives ArrowRight one more job. On an item without a submenu, it closes the open menus, moves to the next item of the bar, and may open that item's menu. Tray UI's submenu does not stop ArrowRight on its own items, so the key reaches the bar. In the [Menubar](#c-menubar) example, ArrowRight on As a spreadsheet, in the Export submenu of File, closes both and opens Edit on its first item, Undo. ArrowLeft in the same submenu is stopped, and closes the submenu alone, as the APG has it for a submenu of an item in a menu.

A [Context Menu](#c-context-menu) takes the same markup. Escape in its submenu returns focus to the parent item, and a second Escape closes the context menu and returns focus to the region that was right-clicked.

## Keep to one level

Tray UI allows one level of submenu. A submenu puts its items one step away: a person sees Move to, not Packed, and has to open it to learn what is inside. A second level would put choices two steps away and give the pointer three panels to cross. The Dropdown Menu's own rule is about eight items in a menu; when the choices outgrow that, a [Select](#c-select) for a value or a [Dialog](#c-dialog) with a list is often clearer.

## Submenus in Tray UI

Wrap the parent item and a `tray-pop tray-pop--side` panel in `tray-submenu`, inside a [Dropdown Menu](#c-dropdown-menu), a Menubar or a Context Menu. The script does the rest.

```html
<div class="tray-submenu">
  <button type="button" class="tray-option" role="menuitem" aria-haspopup="menu">
    <span class="tray-option__text">Move to</span>
    <svg class="tray-icon tray-icon--flip tray-icon--sm" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg>
  </button>
  <div class="tray-pop tray-pop--side">
    <div class="tray-list">
      <button type="button" class="tray-option" role="menuitem" data-value="packed"><span class="tray-option__text">Packed</span></button>
      <button type="button" class="tray-option" role="menuitem" data-value="on-hold"><span class="tray-option__text">On hold</span></button>
    </div>
  </div>
</div>
```

The script gives the parent item an `id` if it has none, makes the panel a `menu` named by the item through `aria-labelledby`, sets `aria-expanded="false"` on the item and `tabindex="-1"` on every item of the panel. A parent item with `aria-disabled="true"` does not open. An action in the submenu fires `tray:select` with `detail.value` on the menu's anchor, as any other item does, and closes the whole menu. Submenus became menus of their own in version 0.2.0, which says: "they open on the right arrow, Enter or Space, and the left arrow closes them." [Installation](#d-installation) has the three files to link.
