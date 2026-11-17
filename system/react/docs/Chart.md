---
category: Data
keywords: [chart, graph, plot, bar chart, line chart, area chart, donut, pie, radial, radar, data visualisation, dataviz, analytics]
---
# Chart

A chart turns figures into thin marks on a quiet frame: a value axis in `tick` type, hairline gridlines, a strong baseline, a tooltip, and the same figures as a table. It is drawn with Recharts.

## Use
`Chart` and the chart parts come from an entry of their own, and need `recharts` installed next to the package:

```tsx
import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

<Card>
  <Chart
    type="bar"
    title="Caviar collected by month"
    unit=" kg"
    labels={['Mar', 'Apr', 'May']}
    series={[{ name: 'Collected', values: [6, 14, 22] }]}
    summary="Bar chart of caviar collected by month. The most, 22 kg, came in May."
  />
</Card>

<Chart type="line" labels={months} series={[{ name: '2026', values: a }, { name: '2025', values: b }]} />  {/* two series: a legend */}
<Chart type="bar" stacked labels={quarters} series={parts} />                                            {/* parts of a whole over time */}
<Chart type="bar" horizontal labels={cities} series={[{ name: 'Orders', values: counts }]} table={false} /> {/* a ranking */}
<Chart type="donut" side unit=" kg" totalLabel="Season so far" labels={uses} series={[{ name: 'Weight', values: kg }]} table={false} />
<Chart type="radial" unit="%" labels={['280 of 412 jars']} series={[{ name: 'Reserved', values: [68] }]} table={false} />
```

## Choosing the form
- Change over time: `line` for a trend, `area` for a volume, `bar` for separate periods.
- Parts of a whole: `stacked` bars over time; `donut` for one moment and at most five parts.
- A single share or score: `radial`, or just a figure in a card.
- Ranking: `horizontal` bars.
- Several measures of one thing: `radar`, two series at most.

## Colour
One series is drawn in ink, or in yellow on an ink card (`<Card tone="inverse">`): a single series never takes a data colour. Two to four series take the data colours in order, and a fifth is "Other" in hint grey. A colour belongs to its series, so filtering one out must not repaint the others. Text is never set in a series colour; a swatch beside it carries the identity. Every chart with several series gets a legend, a tooltip and a table view.

## Behaviour
Recharts draws the chart, and draws it again whenever a prop changes. Pointing at the plot shows a crosshair or a highlighted column and a tooltip with every series at that point. The plot is focusable: the left and right arrows move through the points and the tooltip follows. On a donut the other parts fade under the pointer. "Show the figures" opens the same data as a table; `table={false}` leaves it out.

## A chart of your own
For anything `Chart` does not draw, compose a Recharts chart inside `ChartContainer`, which gives it the same frame, colours, tooltip and key. The marks take their colour from `var(--color-<key>)`, one for each key of `config`.

```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { ChartContainer, ChartFigures, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const config = { jars: { label: 'Jars' }, shop: { label: 'Farm shop' } } satisfies ChartConfig;

<ChartContainer config={config} title="Where the harvest went" legend footer={<ChartFigures data={data} labelKey="month" labelHead="Month" unit=" kg" />} summary="Stacked bar chart of the harvest by channel.">
  <BarChart data={data} maxBarSize={24}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" />
    <ChartTooltip content={<ChartTooltipContent unit=" kg" total="Total" />} />
    <Bar dataKey="jars" stackId="a" fill="var(--color-jars)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
    <Bar dataKey="shop" stackId="a" fill="var(--color-shop)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
  </BarChart>
</ChartContainer>
```

- `ChartContainer`: `config`, `title`, `caption`, `summary`, `height`, `round` (a centred square, for a pie, a radial or a radar chart), `legend`, `footer`.
- `ChartTooltipContent`: `unit`, `indicator` ('swatch', 'line', 'dashed'), `hideLabel`, `hideIndicator`, `labelFormatter`, `valueFormatter`, `total`, `nameKey`.
- `ChartCenter`: a figure and its name in the middle of a donut or a radial chart. `ChartFigures`: the figures as a table.
- The stylesheet restyles what Recharts draws (ticks, grid, lines, areas, the cursor). You pass the geometry: `maxBarSize={24}`, `radius={[4, 4, 0, 0]}`, `dot={false}`, `startAngle={90}` and `endAngle={-270}` on a pie.

## Do and don't
- Do give every chart a title that states the subject, and a `summary` that says what it shows.
- Do label the extreme directly and leave the rest to the tooltip; never a number on every point.
- Don't use a donut for more than five parts, a rainbow, a gradient, or 3D.
- Don't put a second value axis on a chart: two measures of different scale go in two charts.
- Don't use data colours anywhere outside a chart.
