---
category: Display
keywords: [card, tray, surface, panel, tile, bento]
---
# Card

A card is a tray: a grey surface with 40px corners that groups what belongs together. Fill alone sets it apart: no border, no shadow.

## Use
```tsx
<Card title="Autumn batch" description="Packed on 2 November." action={<Badge>412 jars</Badge>}
      footer={<Button size="sm">Reserve jars</Button>}>
  <p className="tray-soft">132 jars are left.</p>
</Card>

<div className="tray-bento">                         {/* a 12-column grid, 16px gaps */}
  <Card tone="accent" className="tray-span-5" title="Order before 14:00" />
  <Card tone="inverse" className="tray-span-7" title="Returning customers" />
</div>

<Card href="/notes" title="Field notes" />       {/* the whole card is a link */}
<Card tone="panel">…</Card>                       {/* a white panel, to sit inside a card */}
```

## Tones
`tray` (default) for every resting card; `accent` (yellow) for the one emphasis card in a group; `inverse` (ink) for one card that anchors a group; `leaf` (green) for the single card about where a product comes from; `panel` for a white panel inside a card.

A card tells its children what they sit on: inputs and quiet buttons inside a tray turn white by themselves; inside a panel they turn grey again. Never set those fills by hand.

## Layout
Put cards in `<div className="tray-bento">` and give them unequal widths with `tray-span-4` to `tray-span-8`, usually two to one. Below 56rem every card takes the full width.

## Do and don't
- Do keep at most one yellow and one ink card in view.
- Don't nest a card in a card; use `tone="panel"`.
- Don't make every card the same size.
