---
category: Overlays
keywords: [tooltip, hint, tip, title, shortcut hint, icon label]
---
# Tooltip

A tooltip is one short line that names a control when the pointer or the keyboard is on it.

## Use
```tsx
<Tooltip tip="Copy the link">
  <Button variant="quiet" size="sm" icon="copy" aria-label="Copy the link" />   {/* still needs its aria-label */}
</Tooltip>

<Tooltip tip="Search" keys={['Ctrl', 'K']} side="bottom">                      {/* a shortcut, under the control */}
  <Button variant="quiet" size="sm" icon="search" aria-label="Search" />
</Tooltip>

<Tooltip tip={copied ? 'Copied' : 'Copy the link'}>…</Tooltip>                  {/* the words may change */}
<Tooltip tip="Copy the link" open>…</Tooltip>                                    {/* held open, for a picture */}
```

## Behaviour
The system's `tooltip` behaviour builds the bubble, ties it to the control with `aria-describedby`, shows it on hover and on focus, and hides it on leave, blur and Escape. `open` holds it open whatever the pointer does, for a preview or a walkthrough.

## Look
Solid `ink` with page-coloured text, 12px corners and the float shadow: the same look as a chart tooltip. It sits above the control, centred; `side="bottom"` puts it under. `keys` adds key caps after the words.

## Rules
- A tooltip never holds the only copy of anything. An icon button still needs its `aria-label`; the tooltip repeats it for sighted users.
- One line, a few words, no full stop: "Copy the link", "Collapse the sidebar".
- Nothing inside can be clicked. If it needs a link or a button it is a Popover.

## Do and don't
- Do give every icon-only button a tooltip.
- Do show the shortcut in it when there is one.
- Don't put a tooltip on a button that already has a visible label.
- Don't put a tooltip on something that cannot take focus.
