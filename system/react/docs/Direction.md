---
category: Layout
keywords: [direction, rtl, right to left, ltr, bidi, arabic, hebrew, mirror, i18n, localisation]
---
# Direction

Direction sets the reading direction of a region: with `dir="rtl"` every component inside mirrors, because the styles use logical properties throughout.

## Use
```tsx
<Direction lang="ar">                                     {/* dir="rtl" is the default */}
  <Message author="أوكسانا" time="14:02" avatar="أ">الساعي استلم الصندوق.</Message>
</Direction>

<Direction dir="ltr" lang="en">…</Direction>              {/* back to left to right inside a right-to-left page */}
```
For a whole app, set `dir` and `lang` on `<html>` instead; use Direction for one region, such as a preview of a translated screen.

## What mirrors by itself
Text alignment, the order of rows, paddings, the side a switch knob travels to, the check at the end of a menu item, the chevron of a select, the range band of a calendar, the fill of a slider, and the side your own messages sit on.

## What you mark
An icon that points along the reading direction (back and forward arrows, chevrons in breadcrumbs and pagination) takes `flip`: `<Icon name="arrow-left" flip />`. A Button's `iconEnd` arrow and chevron flip by themselves. Icons that show a real object or a clock do not flip.

## What never mirrors
Numbers, charts' time axes, media controls, and the code in a CodeBlock.

## You provide
`dir` and `lang` together, and for mixed content `dir="auto"` on user-written text, so a Latin name inside an Arabic page reads correctly.

## Do and don't
- Do test one real screen in a right-to-left language before shipping there.
- Don't use physical properties (`margin-left`, `text-align: right`) in product styles built on this system.
- Don't flip the brand mark or a product drawing.
