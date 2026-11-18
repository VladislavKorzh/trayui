# 44px touch targets without bigger buttons

Give a small button a 44 pixel hit area with a positioned `::before`, see what WCAG 2.5.8 and 2.5.5 ask, and measure the area with `elementFromPoint`.

## What WCAG asks

Two success criteria of WCAG 2.2 set a size for anything a pointer must hit.

| Criterion | Level | Size | Exceptions |
| --- | --- | --- | --- |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | AA | 24 by 24 CSS pixels | Spacing, Equivalent, Inline, User agent control, Essential |
| [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) | AAA | 44 by 44 CSS pixels | Equivalent, Inline, User agent control, Essential |

The Spacing exception lets a target be smaller than 24 pixels when a circle 24 pixels across, centred on its bounding box, touches no other target and no other such circle. The level AAA criterion has no such exception: there the target itself is 44 by 44.

Both measure the target, which WCAG defines as the "region of the display that will accept a pointer action". That is the area that takes the click, which need not be the area that is drawn. The Understanding document for 2.5.8 says so directly: "It can be beneficial to provide an option to increase the active target area without increasing the visible target size." It also says that where two targets overlap, the overlap does not count towards the size of either, unless both do the same thing.

So a remove button drawn at 28 pixels can still be a 44 pixel target, as long as the 16 pixels around it answer the pointer and belong to nothing else.

## Three ways to a 44px target

1. **Make the box 44 pixels.** A row of a menu, a tab or a day of a calendar has room for it: `min-block-size: 44px` and, for a square, the same width.
2. **Make the row the target.** A checkbox inside its `<label>` is activated by a click anywhere on the label. Stretch the input over the label, as with an invisible radio, and the whole row is the input.
3. **Reach past the edge.** When the drawing must stay small, such as the cross of a chip, a reaction under a message or an icon button in a dense toolbar, add an invisible pseudo-element that is larger than the button.

The first two need nothing more than layout. The third needs a pseudo-element, and some care.

## A pseudo-element that reaches past the edge

A positioned `::before` with negative insets sticks out of its button on every side. Here a 24 pixel button gets 10 pixels more on each side:

```html
<span class="chip">gift<button class="chip-x" type="button" aria-label="Remove gift">✕</button></span>
```

```css
.chip-x {
  position: relative;
  inline-size: 24px;
  block-size: 24px;
  padding: 0;
  border: 0;
  background: none;
}
.chip-x::before {
  content: "";
  position: absolute;
  inset: min(0px, (100% - 44px) / 2);
}
```

- **It belongs to the button.** A pseudo-element is part of the box of its element, so a pointer over it is a pointer over the button. `click` fires on the button, `:hover` matches it, and `document.elementFromPoint()` returns the button, because a pseudo-element is never returned on its own.
- **The insets come from the size.** Percentages in `inset` refer to the containing block, here the button's padding box: the width for left and right, the height for top and bottom. `(100% - 44px) / 2` is -10px for a 24 pixel button. `min(0px, …)` stops the rule from shrinking a side that is already wider than 44 pixels: a button 120 by 32 pixels gains 6 pixels above and below, and nothing at the sides.
- **The button is the containing block.** Without `position: relative` on the button, the pseudo-element would be placed against the nearest positioned ancestor and cover it.
- **The drawing stays as it was.** The pseudo-element has no fill, so the eye sees a 24 pixel button, and the focus ring, drawn round the button's own box, keeps that size too.

If the button already uses `::before` for an icon or a badge, use `::after`.

Where the visible size is fixed, the arithmetic can be written out: `inset: calc((28px - 44px) / 2)` is -8px, for a 28 pixel button.

## Where it goes wrong

The extra area is real layout, and three things can take it away.

1. **An ancestor that clips.** `overflow: hidden`, `auto` or `clip` on any ancestor clips the area that answers the pointer, as well as what is drawn. A small button in the corner of a card that hides its overflow loses the part of its area that lies outside the card.
2. **A neighbour.** Where two areas overlap, the one painted later wins. Two 28 pixel buttons 4 pixels apart, each reaching 8 pixels out, overlap by 12 pixels, and in Chrome the second button takes all of it, including the last 4 pixels of the first button's own face. A positioned pseudo-element also paints over neighbours that are not positioned: put a plain link 4 pixels after such a button, and its first 4 pixels belong to the button.
3. **Wrapping.** A row of small targets with a small gap may be fine on one line and overlap once it wraps, when the areas reach up and down into the line above.

Keep the gap between two small targets at least as wide as the two overhangs together, or let the area reach out only where there is room. A pseudo-element can reach out unevenly: `inset: -6px 0` adds height and no width.

## Check it with elementFromPoint

`document.elementFromPoint(x, y)` returns the element a pointer at that point would hit, in viewport coordinates. Walk out from each edge of a target one pixel at a time and count the pixels that still land on it:

```js
// How many pixels past each edge of el a pointer still lands on it
function reach(el, max = 40) {
  const r = el.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const lands = (px, py) => el.contains(document.elementFromPoint(px, py));
  const count = (from, step, at) => {
    let d = 0;
    while (d < max && at(from + step * (d + 1))) d++;
    return d;
  };
  return {
    top: count(r.top, -1, (py) => lands(x, py)),
    right: count(r.right - 1, 1, (px) => lands(px, y)),
    bottom: count(r.bottom - 1, 1, (py) => lands(x, py)),
    left: count(r.left, -1, (px) => lands(px, y)),
  };
}

reach(document.querySelector('.chip-x'));
// { top: 10, right: 10, bottom: 10, left: 10 }: 24 + 2 × 10 = 44 each way
```

Paste it in the console, scroll the target into view (the function only sees what is in the viewport), and call it on each small target. A side that reads less than you expect has been clipped or taken by a neighbour; run it on the neighbour too. On the two buttons 4 pixels apart from the last section, the first reads `right: 0`.

The function measures one line through the middle of each side. For a round or rotated target, or when the overlap is only at a corner, test more points.

## Touch targets in Tray UI

Tray UI sets its floor at the level AAA size. Its token `--size-hit` is 44px, described as "the smallest target for nearly everything: tabs, menu items, calendar days, icon buttons in a row", and the [Accessibility](#g-accessibility) guide gives 44px to buttons, fields, tabs, menu items, days and pages, then names the few that are smaller. Measured in Chrome with the function above, on the components' own examples, each of the three ways is in use.

| Target | Drawn | Hit area | How |
| --- | --- | --- | --- |
| Tab, menu item, calendar day, page number, sidebar row, footer link | 44px tall | 44px tall | The box is 44px |
| Checkbox, radio, switch | the row, at least 44px tall | the row | The input covers its label |
| Checkbox in a table of notification settings | a 26px box | 44 by 44 | The label round it is 44 by 44 |
| Extra small button or toggle | 40px | 44px | `::before`, 2px out |
| Remove button of a chip | 28 by 28 | 44 by 44 | `::before`, 8px out |
| Reaction under a message | 32px tall | 44px tall | `::before`, 6px up and down |
| Show and copy buttons of an API key | 40px | 44px | `::before`, 2px out |

The pseudo-elements take their 44 pixels from `--size-hit`:

```css
.tray-btn--xs, .tray-toggle--xs { position: relative; }
.tray-btn--xs::before, .tray-toggle--xs::before { content: ""; position: absolute; inset: calc((var(--size-xs) - var(--size-hit)) / 2); }

.tray-chip__x { position: relative; }
.tray-chip__x::before { content: ""; position: absolute; inset: calc((28px - var(--size-hit)) / 2); }

.tray-reaction { position: relative; }
.tray-reaction::before { content: ""; position: absolute; inset: calc((32px - var(--size-hit)) / 2) 0; }

.tray-secret button { position: relative; }
.tray-secret button::before { content: ""; position: absolute; inset: calc((var(--size-xs) - var(--size-hit)) / 2); }
```

A reaction reaches up and down only, since reactions sit 4 pixels apart in a row. Rows of reactions that wrap stood 4 pixels apart as well, so each row's area reached 2 pixels into the other's buttons; since the next release they stand 12 pixels apart, the 6 pixels each one reaches, and the areas meet without overlapping. A chip's remove button sits 6 pixels inside the end of its chip, so its 8 pixels reach 2 pixels past the chip, and chips stand 6 pixels apart in a [Tag Input](#c-tag-input) and 8 in a [Filter Bar](#c-filter-bar). The areas of the extra small sizes, chip buttons, reactions, footer links and the checkboxes of a matrix grew to 44 pixels in version 0.2.0, under "Easier to see and to hit".

A few targets stay under 44 pixels in one direction. The nested links of a [Sidebar](#c-sidebar), the rows of a file tree and the labels of its folding sections are 36-pixel rows as wide as the sidebar. A [Slider](#c-slider) is 28 pixels tall across its full width; 2.5.8 counts a control that picks a value by its position as one target, so its size is the whole track. The handle of [Resizable](#c-resizable) is 16 pixels wide and the full height of its panes; its page says that dragging is its only pointer route and suggests buttons that set fixed sizes where the size matters.

The [Button](#c-button) page shows the extra small size, and [Installation](#d-installation) has the files to link.
