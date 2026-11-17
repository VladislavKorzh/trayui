---
category: Overlays
keywords: [popover, popup, flyout, dropdown panel, floating panel, share panel]
---
# Popover

A popover is a small panel that opens beside the button that asked for it, for a few controls or a short explanation.

## Use
```tsx
<Popover
  trigger={<Button variant="quiet" size="sm" icon="share">Share</Button>}   {/* a Button or a link, not wrapped */}
  title="Share this note"
  description="Anyone with the link can read it."
>
  <Input defaultValue="perly.example/notes/may-peak" aria-label="Link" readOnly />
  <Button size="sm" data-close>Done</Button>                                  {/* data-close: closes it */}
</Popover>

<Popover align="end" trigger={<Button variant="ghost" size="sm" icon="circle-help" aria-label="What is a batch?" />}
         title="Batch" description="Everything packed from one collection." />   {/* an explanation */}

<Popover open={open} onOpenChange={setOpen} trigger={…}>…</Popover>             {/* controlled */}
```

## Look and placement
The panel is `raised` with the float shadow. `variant="card"` (the default) is a 22rem panel with 28px corners and room for text; `"roomy"` keeps the natural width; `"list"` is the tight panel menus use. It opens under the trigger from its start edge; `align="end"` lines it up with the end edge, `side="top"` opens it upward. The title and description sit at the top, the controls under them with 16px gaps.

## Behaviour
The system's `popover` behaviour runs it. It opens on a click on the trigger, moves focus to the first control inside, and closes on Escape, on a click outside, or on a `data-close` button; focus returns to the trigger. `onOpenChange` reports every change. `open` opens or closes it from outside; `defaultOpen` shows it open at first, which is how a preview pictures it.

## Popover, Tooltip or Dialog
A Tooltip is one line that names a control and cannot be interacted with. A popover holds controls or a paragraph and does not block the page. A Dialog blocks the page until answered.

## Do and don't
- Do keep it to one small job: share, pick a colour, explain a term.
- Do give it a title when it has more than two controls.
- Don't open one on hover; for hover, see HoverCard.
- Don't put a form with validation in a popover.
