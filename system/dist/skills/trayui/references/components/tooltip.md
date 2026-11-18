# Tooltip

A tooltip is one short line that names a control when the pointer or the keyboard is on it.

## Markup
```html
<span class="tray-anchor" data-tray="tooltip" data-tip="Copy the link" data-keys="Ctrl C">
  <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" aria-label="Copy the link">…</button>
</span>
```
The behaviour builds the bubble, ties it to the control with `aria-describedby`, shows it on hover and on focus, and hides it on leave, blur and Escape. `data-side="bottom"` puts it under the control; `data-keys` adds key caps for a shortcut. Change `data-tip` and the bubble follows ("Copy the link", then "Copied").

The bubble is solid `ink` with page-coloured text, 12px corners and the float shadow: the same look as a chart tooltip.

## Rules
- A tooltip never holds the only copy of anything. An icon button still needs its `aria-label`; the tooltip repeats it for sighted users.
- One line, a few words, no full stop: "Copy the link", "Collapse the sidebar".
- Nothing inside can be clicked: the bubble takes the pointer only so it can be read. If it needs a link or a button it is a Popover.

## Accessibility
The bubble is a `role="tooltip"` tied to the control with `aria-describedby`, so a screen reader reads it as the control's description, after its name. When the control's name already holds its words, as an icon button's does ("Orders" on a link named "Orders, 12 to pack"), they are drawn for the eye alone (CSS generated content with an empty text alternative), so they are not read twice and the description holds just the shortcut keys, if any; with no keys the bubble is hidden from screen readers altogether (`aria-hidden`). It shows on hover and on keyboard focus, and stays while the control has focus. The pointer can move from the control onto the bubble and rest there; the bubble goes a moment after the pointer leaves both (WCAG 1.4.13). `Escape` hides it wherever focus is, also when the pointer alone showed it, while focus stays where it was. In a dialog that Escape hides only the bubble; the next one closes the dialog. Under `prefers-reduced-motion: reduce` it only fades, in a tenth of a second.

## Do and don't
- Do give every icon-only button a tooltip.
- Do show the shortcut in it when there is one.
- Don't put a tooltip on a button that already has a visible label.
- Don't put a tooltip on something that cannot take focus.
