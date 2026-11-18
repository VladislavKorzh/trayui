# Stat Card

A stat card shows one number that matters: what it counts, the figure, how it moved, and optionally the line of its last weeks. Also called a KPI card, a metric card or a stats tile.

## Markup
```html
<div class="tray-stats">
  <div class="tray-stat">
    <p class="tray-stat__label">Revenue this month</p>
    <p class="tray-stat__value">$18,240</p>
    <p class="tray-stat__foot">
      <span class="tray-trend" data-tone="good">
        <svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+14%
      </span>
      than in October
    </p>
    <div data-tray="spark" data-points="9,11,10,13,12,15,14,18"></div>
  </div>
</div>
```
| Part | Use |
| --- | --- |
| `tray-stats` | The row: cards share the width, at least 12rem each, and wrap. |
| `tray-stat` | One card, on the fill of its ground. Add `tray-island` for the single yellow one, `tray-inverse` for an ink one. |
| `tray-stat__value` | The figure in `title` size with tabular numerals. A `<small>` inside it is the unit. |
| `tray-trend` | The change. The icon gives the direction; `data-tone="good"` or `"bad"` says whether that direction is welcome. Leave the tone out when it is neither. |
| `data-tray="spark"` | Draws a line from `data-points`. It is decoration: the figure and the trend carry the meaning. |

A whole card may be a link: write it as `<a class="tray-stat" href="…">`.

## Accessibility
A stat card is plain text, read in order: the label, the figure, then the foot. The trend's arrow is `aria-hidden`, so the sign in its text ("+14%") carries the direction. `data-tone` only colours it: when it matters whether the change is welcome, say so in words. The spark line is `aria-hidden` decoration. A card written as `<a class="tray-stat">` is one link whose name is all of its text, and focus draws the 3px ink ring round the whole card.

## Do and don't
- Do say what the change is compared with: "than in October".
- Do keep four cards or fewer in a row.
- Don't colour a falling number red when falling is good. Refunds going down take `data-tone="good"`.
- Don't put a chart with axes in a stat card. Link the card to the report.

## Four in a row
`tray-stats--four` on the row keeps four cards four across where there is room and two by two below that, never three and one.
