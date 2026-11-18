# Description List

A description list sets out the facts about one thing as pairs: the name of the fact in soft ink at the start edge, its value beside it, a hairline between rows. Also called a key-value list or a details list.

## Markup
```html
<dl class="tray-dl">
  <div><dt>Customer</dt><dd>Dana Kovalenko</dd></div>
  <div><dt>Status</dt><dd><span class="tray-badge">To pack</span></dd></div>
  <div><dt>Tracking number</dt><dd>
    <span id="track">PL20431UA</span>
    <button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-tray="copy" data-target="#track" aria-label="Copy the tracking number">…</button>
  </dd></div>
</dl>
```
Each pair sits in a `<div>` so the row can be a grid: the term column is 12rem, the value takes the rest. Below 34rem the value drops under its term.

| Class | Use |
| --- | --- |
| `tray-dl` | Ruled rows, 56px tall at least. |
| `tray-dl--stack` | The term over its value at every width, for a narrow column. |
| `tray-dl--plain` | No rules and tight rows, for three or four facts inside a card. |

A value may hold a Badge, a link, or a small ghost button that copies or edits it.

## Accessibility
The `<dl>` keeps each term with its value, and HTML allows the `<div>` around each pair, so the grid costs no meaning. A copy or edit button in a value is an icon button: give it an `aria-label` that names the fact, such as "Copy the tracking number". With `data-tray="copy"` the result, "Copied" or "Copy failed", is said through a hidden status beside the button. A Badge in a value is read as its word.

## Do and don't
- Do use real `<dl>`, `<dt>` and `<dd>`: screen readers announce the pairs.
- Do write "None" or "Not set" for an empty value.
- Don't use it for values a person edits in place: that is a form, or a Settings Section.
- Don't use it to compare several things. That is a Table.
