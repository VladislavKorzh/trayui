# Segmented control with a sliding pill in CSS

A segmented control on radio inputs, with a pill that slides to the choice in CSS or a little script, and stays still for reduced motion and forced colours.

## What a segmented control is

A segmented control is a short row of options with one of them chosen: a jar size, list or grid, the last 7 or 30 days. Each option is visible at once, and the chosen one is filled. In many designs the fill is a pill that slides from the old choice to the new one.

It sets a value, so underneath it is a radio group. Tray UI calls it a [Toggle Group](#c-toggle-group) and keeps it to "two to five short options that are all worth seeing at once"; more options, or long labels, belong in a [Select](#c-select) or a [Radio Group](#c-radio-group). It does not switch panels of content or pages, which is the job of [Tabs](#c-tabs).

## Radios underneath

Write each segment as a `<label>` around a real radio. The radios share a `name`, so the browser keeps one of them checked, and the group takes a name of its own:

```html
<div class="seg" role="radiogroup" aria-label="Period">
  <label><input type="radio" name="period" value="day">Day</label>
  <label><input type="radio" name="period" value="week" checked>Week</label>
  <label><input type="radio" name="period" value="month">Month</label>
</div>
```

The radios bring the behaviour with them:

- **One Tab stop.** Tab reaches the group at the checked radio, and the arrow keys move the choice to the next or the previous one, wrapping at the ends. This is the keyboard the WAI-ARIA Authoring Practices give a [radio group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), and a native group already has it.
- **A value in the form.** The checked radio's `name` and `value` are submitted with the form. A group with none checked sends nothing at all, so check one from the start.
- **State that CSS can read.** `:checked` and `:has()` style the chosen segment, and `change` fires when the person picks one.

Hide the radio from the eye only: it has to stay in the Tab order and in the accessibility tree. Stretch it over its label and make it transparent:

```css
.seg label { position: relative; }
.seg input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: inherit; }
.seg label:has(input:checked) { color: #fff; }
.seg label:has(input:focus-visible) { outline: 3px solid #141414; outline-offset: 3px; }
```

An input with `opacity: 0` still takes focus and is still in the accessibility tree, and since it covers the label, every pixel of the segment is the radio. `display: none` or `visibility: hidden` would take it out of the Tab order and out of the tree. The focus ring goes on the label, the box the eye sees, through `:has(input:focus-visible)`.

## The pill in CSS alone

When every segment is the same width, the pill needs no script. Lay the segments out as equal grid columns, draw the pill as the group's `::before`, one column wide, and move it by the index of the checked radio:

```css
.seg {
  --n: 3; /* the number of segments */
  position: relative;
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 4px;
  padding: 4px;
  border-radius: 14px;
  background: #ececec;
}
.seg label { display: grid; place-items: center; min-block-size: 44px; padding: 0 18px; border-radius: 10px; cursor: pointer; }
.seg::before {
  content: "";
  position: absolute;
  inset-block: 4px;
  inset-inline-start: 4px;
  inline-size: calc((100% - 8px - (var(--n) - 1) * 4px) / var(--n));
  border-radius: 10px;
  background: #141414;
  translate: calc(var(--i, 0) * (100% + 4px)) 0;
}
.seg:has(label:nth-child(2) input:checked) { --i: 1; }
.seg:has(label:nth-child(3) input:checked) { --i: 2; }
.seg:dir(rtl)::before { translate: calc(var(--i, 0) * (-100% - 4px)) 0; }

@media (prefers-reduced-motion: no-preference) {
  .seg::before { transition: translate .2s cubic-bezier(.2, .8, .2, 1); }
  .seg label { transition: color .2s; }
}
```

- **The step is the pill's own width.** A percentage in `translate` refers to the element's own box, so `100% + 4px` is one segment and one gap. The width subtracts the group's padding and the gaps from the full width and divides by the count.
- **One rule per position.** `:has()` turns the checked radio into the custom property `--i`. A group of five needs four rules; the first position is the default, 0.
- **Painting order.** The `::before` comes first in the group, and the labels are positioned after it, so they paint over the pill and their words stay on top.
- **Right to left.** `inset-inline-start` puts the pill at the right edge under `dir="rtl"`, and the last rule turns the step the other way.

The label's colour eases with the pill, so the words turn light as the pill arrives under them. Because the pill reads the state of the radios directly, it follows a choice made from script too: `input.checked = true` fires no event, and `:has()` matches anyway.

## The pill placed by script

Segments of different widths, such as "7 days", "30 days" and "This year", need a measurement. A small script puts a pill element in the group, measures the checked label, and writes its place into custom properties; CSS does the moving.

```js
function addPill(group) {
  const pill = document.createElement('span');
  pill.className = 'seg__pill';
  pill.setAttribute('aria-hidden', 'true');
  group.prepend(pill);
  let placed = false;

  function place(slide) {
    const label = group.querySelector('input:checked')?.closest('label');
    if (!label) return;
    const g = group.getBoundingClientRect(), l = label.getBoundingClientRect();
    if (!slide || !placed) group.setAttribute('data-still', '');
    pill.style.setProperty('--x', `${l.left - g.left - group.clientLeft}px`);
    pill.style.setProperty('--y', `${l.top - g.top - group.clientTop}px`);
    pill.style.setProperty('--w', `${l.width}px`);
    pill.style.setProperty('--h', `${l.height}px`);
    group.setAttribute('data-pill', '');
    pill.getBoundingClientRect(); // apply the new place now, with no transition
    group.removeAttribute('data-still');
    placed = true;
  }

  group.addEventListener('change', () => place(true));
  new ResizeObserver(() => place(false)).observe(group);
}

document.querySelectorAll('.seg').forEach(addPill);
```

```css
.seg { position: relative; display: inline-flex; gap: 4px; padding: 4px; }
.seg label:has(input:checked) { background: #141414; color: #fff; }
.seg__pill { display: none; }
@media (forced-colors: none) {
  .seg[data-pill] .seg__pill {
    display: block; position: absolute; top: 0; left: 0;
    inline-size: var(--w); block-size: var(--h); translate: var(--x) var(--y);
    border-radius: 10px; background: #141414;
  }
  .seg[data-pill] label:has(input:checked) { background: none; }
}
@media (prefers-reduced-motion: no-preference) {
  .seg:not([data-still]) .seg__pill { transition: translate .2s, inline-size .2s; }
}
```

- **It works before the script does.** Until the pill is placed, the checked label has a fill of its own. `data-pill` hands the fill over to the pill, so a page without script, or with a script that fails, still shows the choice.
- **The first place is not a slide.** A pill that started at 0 would fly in from the corner on page load. `data-still` turns the transition off, reading the pill's box makes the browser apply the new place at once, and the transition comes back for the next change. The same happens when the group changes size, because a slide is wrong when a font loads or a column narrows.
- **Measured in either direction.** `getBoundingClientRect()` gives the label's real box, so this version needs no rule for right to left.
- **A choice from script needs an event.** Setting `checked` fires no `change`; after setting it, dispatch one yourself with `group.dispatchEvent(new Event('change'))`.

## Reduced motion

Write the transition inside `@media (prefers-reduced-motion: no-preference)`, as both examples do. A person who asked for less motion then sees the fill change place at once, and nothing travels. Stillness is the default and motion is the addition, so a browser that does not report the setting gets the still version too.

In Tray UI the pill is one of the things that never travel under `reduce`. The [Accessibility](#g-accessibility) guide lists it: "toasts, the sliding pills, the drawn tick, the unfolding answers, a bumping count and a popping word change at once".

## Forced colours

Forced colours modes, such as Windows high contrast, replace the page's colours with a few the person chose. MDN lists the properties whose author values are dropped there: `color`, `background-color`, `border-color`, `outline-color` and the rest, and `box-shadow` becomes `none`. The pill is a background: in Chrome's emulation it takes the colour of the page, the light text of the chosen label turns as dark as the rest, and nothing on screen says which segment is chosen.

So in that mode, take the pill away and draw the choice in the system's own colours for a selected item:

```css
@media (forced-colors: active) {
  .seg { border: 1px solid ButtonText; }
  .seg::before { display: none; }
  .seg label:has(input:checked) {
    forced-color-adjust: none;
    background: SelectedItem;
    color: SelectedItemText;
  }
}
```

The group gets an edge where its fill was, the CSS pill goes, and the scripted pill was shown only under `forced-colors: none` in the first place. `forced-color-adjust: none` keeps the browser from overriding the last two values, and the system colour keywords keep them the person's own. Chrome's emulation of forced colours, in DevTools under Rendering, is a quick way to check.

## Segmented controls in Tray UI

Tray UI's markup has the same shape, with the words in a `<span>` after the radio:

```html
<div class="tray-seg" role="radiogroup" aria-label="Jar size">
  <label class="tray-seg__item"><input type="radio" name="jar" checked><span>30 g</span></label>
  <label class="tray-seg__item"><input type="radio" name="jar"><span>50 g</span></label>
  <label class="tray-seg__item"><input type="radio" name="jar"><span>100 g</span></label>
</div>
```

The stylesheet does what the sections above describe. The radio is transparent and covers its segment, the chosen `<span>` is solid ink, and focus draws the 3px ink ring round it. Segments are 52px tall, at least 4.75rem wide, with 14px corners inside a 20px tray; `tray-seg--sm` makes them 44px, `tray-seg--fill` stretches them into equal columns, and `tray-seg--icon` makes them square, with an `aria-label` on each input. Use `type="checkbox"` inputs and `role="group"` when several segments may be on at once.

The pill comes from `components/bundle.js`, and there is nothing to add to the markup. The script runs one function, `glide()`, for every `.tray-seg` that holds radios, and for every strip of [Tabs](#c-tabs):

- It puts a `span.tray-glide`, hidden from assistive technology, first in the strip, and on each `change` writes the chosen item's box into four custom properties. The measurement adds the strip's `scrollLeft`, so it also holds for a strip of tabs that scrolls.
- The first placement, and a change of size while nothing is sliding, set `data-glide-still` for two animation frames, so the pill is placed without a slide. A change of size during a slide lets the slide end at the new place.
- A `ResizeObserver` and a `MutationObserver` on the strip keep the pill in place when the strip changes size or its items are written again.
- The pill slides over `--duration-move`, 0.2 seconds, on the `--ease` curve. Until the script has placed the pill, the chosen segment keeps its own ink fill. The CSS shows the pill only under `forced-colors: none`; with forced colours the chosen segment is drawn in `SelectedItem` and `SelectedItemText`.

A segmented control of checkboxes gets no pill: each segment that is on has its own fill. After setting a radio from script, dispatch `new Event('change')` on its `.tray-seg`, as [Styles and behaviour](#g-behaviour) says; a strip of tabs follows `aria-selected` by itself.

The [Toggle Group](#c-toggle-group) page has the live examples, and [Installation](#d-installation) has the three files to link.
