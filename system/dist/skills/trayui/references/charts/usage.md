# Using the charts

In React, charts are drawn by Recharts. The package adds the frame, the colours, the tooltip, the key and the table of figures of this system, so a chart you compose yourself looks like every other one.

## Install

The charts are a separate entry of the React package, so the rest of the package does not depend on a chart library. Add Recharts next to it:

```sh
npm install recharts@3.10.1
```

```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';
import 'trayui-react/styles.css';
```

Recharts 3.9 or later, and React 18 or later.

## A first chart

Every chart is a Recharts chart inside `ChartContainer`. The `config` names what the chart draws; the marks take their colour from `var(--color-<key>)`.

```tsx
const data = [
  { month: 'Mar', collected: 6 },
  { month: 'Apr', collected: 14 },
  { month: 'May', collected: 22 },
];

const config = { collected: { label: 'Collected' } } satisfies ChartConfig;

export function Harvest() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        summary="Bar chart of caviar collected by month. The most, 22 kg, came in May."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Bar dataKey="collected" fill="var(--color-collected)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

Each example in this section is one file like this: open its code, copy it, and replace the data.

## The parts

| Part | What it is |
| --- | --- |
| `ChartContainer` | The frame: `title`, `caption`, the plot at a set `height` (192px unless you say), the key (`legend`) and a `footer`. `round` makes the plot a centred square, for a pie, a radial or a radar chart. |
| `ChartTooltip` | The Recharts tooltip, set up for this system. Every prop is the Recharts one. |
| `ChartTooltipContent` | What the tooltip says: `unit`, `indicator`, `hideLabel`, `hideIndicator`, `labelFormatter`, `valueFormatter`, `total`, `nameKey`. |
| `ChartFigures` | The same figures as a table, behind a "Show the figures" disclosure. Pass it to `footer`. |
| `ChartCenter` | A figure and its name in the middle of a donut or a radial chart. |
| `ChartLegend`, `ChartLegendContent` | The Recharts legend with this system's key in it, for a key that must sit inside the plot. The usual key is the `legend` prop. |
| `Chart` | One component for the six usual forms. See [The Chart component](https://trayui.com/charts/chart-component.md). |

## Colour

- One key in the config is one series: it is drawn in ink, and in yellow on an ink card. A single series never takes a data colour.
- Two to four keys take `data-1` to `data-4` in the order of the config. A colour belongs to its series: remove one from the data, not from the config, and the others keep theirs. A fifth key is drawn in hint grey: fold the rest into "Other".
- A key may name a colour of its own with `color`: `var(--ink-hint)` for what a subject is compared with, `var(--track)` for what is left of a whole.
- Text is never set in a series colour. Values, labels and keys stay in ink; a swatch beside them carries the identity.
- Two of the four data colours are faint on a light ground, so a chart with several series has a key (`legend`), a tooltip and a table (`ChartFigures`).

## What the stylesheet does, and what you pass

The stylesheet restyles the marks Recharts draws, so most of the look needs no props. A rule in a stylesheet wins over the attribute Recharts writes: to depart from one, pass `style`, which wins over both.

| Mark | The stylesheet sets | You pass |
| --- | --- | --- |
| Axes | Tick text in hint grey, no tick lines, a strong baseline, no line on the value axis | `dataKey`; `width="auto"` and `unit` on a value axis |
| Grid | Hairlines | `vertical={false}` |
| Bars | Nothing | `maxBarSize={24}` on the chart, `radius={[4, 4, 0, 0]}` on the bar, `barGap={2}` for two series |
| Stacked bars | Nothing | `radius={4}`, `stroke="var(--tray-ground)"` and `strokeWidth={2}`: the gap between parts |
| Lines | 2px, round joins | `dot={false}`, `activeDot={{ r: 5 }}` |
| Areas | The line, and a 14% fill | The same colour for `fill` and `stroke` |
| Pies | A 2px gap between parts; the other parts fade under the pointer | `startAngle={90}` and `endAngle={-270}`: clockwise from the top; `innerRadius="82%"` for a ring |
| Radial bars | The track | `background`, `cornerRadius={99}` |
| Radars | A 2px outline, a 14% fill, a hairline web | `outerRadius="72%"`, to leave room for the names |
| Labels | Ink, 14px, weight 600 | A formatter that labels the extreme only |
| Cursor | A 1px ink line; behind bars, a column of the ground's fill | `cursor={false}` to leave it out |

## Labels

Label the extreme and leave the rest to the tooltip: never a number on every point. Write the label with a no-break space between the figure and its unit, so it stays on one line.

```tsx
const top = Math.max(...data.map((row) => row.collected));

<Bar dataKey="collected" fill="var(--color-collected)" radius={[4, 4, 0, 0]}>
  <LabelList position="top" offset={10} formatter={(value) => (value === top ? `${value} kg` : '')} />
</Bar>
```

## Accessibility

- Give every chart a `title` that states the subject and a `summary`: the sentence a screen reader hears. Say what the chart shows and its extreme.
- Recharts makes the plot focusable. The left and right arrows move through the points, and the tooltip follows.
- A chart with several series gives its figures as a table too: `footer={<ChartFigures data={data} labelKey="month" labelHead="Month" />}`.
- Recharts draws a chart in when it appears, and does not when the visitor asks for reduced motion.

## Choosing the form

- Change over time: line (a trend), area (a volume), bar (separate periods).
- Parts of a whole: stacked bars over time; a pie or a donut for one moment and at most five parts.
- A single share or score: radial, or just a figure in a card.
- Ranking: horizontal bars.
- Several measures of one thing: radar, two series at most.
- Two measures of different scale go in two charts, never on two value axes.

## In plain HTML

Recharts needs React. A page without it uses the system's own drawing, which has the same look and the six usual forms: see [Chart](https://trayui.com/components/chart.md) among the components.
