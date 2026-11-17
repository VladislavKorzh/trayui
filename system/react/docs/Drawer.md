---
category: Overlays
keywords: [drawer, bottom sheet, action sheet, mobile dialog, panel from bottom]
---
# Drawer

A drawer is a panel that rises from the bottom edge: the dialog of a phone.

## Use
```tsx
<Drawer
  title="Add to the order"
  trigger={<Button icon="shopping-bag">Add to the order</Button>}
  footer={<Button block end="$118" data-close onClick={add}>Add to the order</Button>}   {/* full width, at the bottom */}
>
  <div className="tray-stack" style={{ marginBlockStart: 'var(--space-5)' }}>   {/* spaces the content from the title */}
    …a jar size, a quantity…
  </div>
</Drawer>

<Drawer open={open} onOpenChange={setOpen} title="Note for the courier">…</Drawer>   {/* controlled */}
```

## Parts
A short grip at the top hints that it can be dismissed; the title follows in `title` type, then your content, then the `footer`. The content sits straight under the title: wrap it in a `tray-stack` with `marginBlockStart: 'var(--space-5)'`, as above.

## Behaviour
It is pinned to the bottom, at most 40rem wide and 85% of the screen tall, with 40px corners on its top edge, and it scrolls inside when its content is long. It is a modal dialog: focus stays inside, Escape and a click on the veil close it, and so does any button with `data-close`. Focus returns to the trigger.

## Drawer, Sheet or Dialog
- Drawer: a short task on a phone, where the thumb is. On a desktop the same task is usually a Dialog; switch at 40rem.
- Sheet: a panel from the side that keeps the page visible beside it, on wider screens.
- Dialog: a decision in the middle of the screen.

## Pictures
`modal={false}` with `defaultOpen` shows it in place: put it in `<div className="tray-stage tray-stage--scrim" style={{ minBlockSize: '28rem' }}>` for a preview or a documentation page.

## Do and don't
- Do keep the action at the bottom of the drawer, full width.
- Do let Escape, the veil and a Cancel button all close it.
- Don't put a long form in a drawer; give it a page.
- Don't stack drawers.
