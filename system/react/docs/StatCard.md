---
category: Metrics
keywords: [stat card, stat, kpi, metric, figure, number, trend, sparkline, dashboard tile, scorecard]
---
# Stat Card

A stat card shows one number that matters: what it counts, the figure, how it moved, and optionally the line of its last weeks.

## Use
```tsx
<div className="tray-stats">                                   {/* the row: cards share the width and wrap */}
  <StatCard label="Revenue this month" value="$18,240"
            trend={{ value: '+14%', direction: 'up', tone: 'good' }}
            foot="than in October" spark={[9, 11, 10, 13, 12, 15, 14, 18]} />
  <StatCard label="Refunds" value="3"
            trend={{ value: '−2', direction: 'down', tone: 'good' }} foot="than in October" />  {/* falling is good here */}
  <StatCard label="Time to pack" value="26" unit="min"
            trend={{ value: '+4 min', direction: 'up', tone: 'bad' }} foot="than in October" />
  <StatCard tone="island" label="Jars left in the autumn batch" value="132" foot="Of 412. At this pace they last 9 days." />
  <StatCard href="/reports/orders" label="Average order" value="$21.66" foot="No change since October" />
</div>
```

## Parts
- The label says what is counted; the value is the figure in `title` size with tabular numerals, and `unit` sets a unit small after it.
- The trend is the change. Its icon gives the direction; `tone: 'good'` or `'bad'` says whether that direction is welcome, in success green or danger red. Leave the tone out when it is neither. The icon and the sign keep the meaning when the colour is not seen.
- The foot says what the change is compared with, or holds one short sentence when there is no trend.
- `spark` draws a small line from the figures of the last weeks. It is decoration: the figure and the trend carry the meaning.
- With `href` the whole card is a link to its report, marked with an arrow at the end of the label.

## Tones
`tray` (default) sits on the fill of its ground: grey on the page, white on a card. `island` is the single yellow card of a row, `inverse` an ink one; a trend on either keeps the card's text colour.

## Layout
Put the cards in `<div className="tray-stats">`: each takes at least 12rem, they share the row and wrap.

## Do and don't
- Do say what the change is compared with: "than in October".
- Do keep four cards or fewer in a row, and at most one yellow one.
- Don't colour a falling number red when falling is good. Refunds going down take `tone: 'good'`.
- Don't put a chart with axes in a stat card. Link the card to the report.
