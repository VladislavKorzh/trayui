# Bar charts

Separate periods, rankings and parts of a whole: bars 24px wide at most, with 4px corners at the end that carries the value.

Each example is one React file. It needs `recharts` and `trayui-react` (the React package of Tray UI: see [React](https://trayui.com/docs/react.md)). The names and the figures are invented.

## Interactive

A channel switch in the head of the card.

```tsx
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, ToggleGroup } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

/* Ninety days of invented orders, the same on every visit. */
const data = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 7, 18 + i));
  return {
    date: date.toISOString().slice(0, 10),
    shop: Math.round(18 + Math.sin(i / 6) * 6 + Math.sin(i / 2.3) * 3 + (i % 7 === 5 ? 9 : 0)),
    restaurants: Math.round(11 + Math.cos(i / 5) * 4 + (i % 7 === 4 ? 6 : 0)),
  };
});

const day = (value: string) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const measures = [
  { value: 'shop', label: 'Farm shop' },
  { value: 'restaurants', label: 'Restaurants' },
];

export function BarInteractive() {
  const [measure, setMeasure] = React.useState('shop');
  const key = measure as 'shop' | 'restaurants';
  const config = { [key]: { label: measures.find((m) => m.value === key)?.label } } satisfies ChartConfig;
  const total = data.reduce((sum, row) => sum + row[key], 0);
  return (
    <Card
      title="Orders by day"
      description={`${total.toLocaleString('en-GB')} orders in three months, to 15 November 2026`}
      action={<ToggleGroup size="sm" aria-label="Channel" items={measures} value={measure} onChange={setMeasure} />}
    >
      <ChartContainer
        config={config}
        height={240}
        summary={`Bar chart of orders by day for three months from ${key === 'shop' ? 'the farm shop' : 'restaurants'}, ${total} in all. Demo data.`}
      >
        <BarChart data={data} margin={{ top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickFormatter={day} minTickGap={32} />
          <YAxis width="auto" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" orders" labelFormatter={(label) => day(String(label))} />} />
          <Bar dataKey={key} fill={`var(--color-${key})`} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Default

One series.

```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { month: 'Mar', collected: 6 },
  { month: 'Apr', collected: 14 },
  { month: 'May', collected: 22 },
  { month: 'Jun', collected: 19 },
  { month: 'Jul', collected: 9 },
  { month: 'Aug', collected: 7 },
  { month: 'Sep', collected: 15 },
  { month: 'Oct', collected: 10 },
];

const config = { collected: { label: 'Collected' } } satisfies ChartConfig;

export function BarDefault() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="March to October 2026"
        summary="Bar chart of caviar collected by month in 2026. The most, 22 kilograms, came in May. Demo data."
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

## Peak labelled

A value axis, and the extreme named.

```tsx
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { month: 'Mar', collected: 6 },
  { month: 'Apr', collected: 14 },
  { month: 'May', collected: 22 },
  { month: 'Jun', collected: 19 },
  { month: 'Jul', collected: 9 },
  { month: 'Aug', collected: 7 },
  { month: 'Sep', collected: 15 },
  { month: 'Oct', collected: 10 },
];

const config = { collected: { label: 'Collected' } } satisfies ChartConfig;

const top = Math.max(...data.map((row) => row.collected));

export function BarPeak() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="The extreme is labelled; never a number on every bar"
        summary="Bar chart of caviar collected by month in 2026, with a value axis and the peak of 22 kilograms in May labelled. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 28 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Bar dataKey="collected" fill="var(--color-collected)" radius={[4, 4, 0, 0]}>
            <LabelList position="top" offset={10} formatter={(value) => (value === top ? `${value}\u00a0kg` : '')} />
          </Bar>
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Ranking

Horizontal bars, sorted, every value written.

```tsx
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, type ChartConfig } from 'trayui-react/charts';

const data = [
  { city: 'Kyiv', orders: 86 },
  { city: 'Lviv', orders: 61 },
  { city: 'Odesa', orders: 44 },
  { city: 'Dnipro', orders: 27 },
  { city: 'Kharkiv', orders: 19 },
];

const config = { orders: { label: 'Orders' } } satisfies ChartConfig;

export function BarHorizontal() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Orders by city, November"
        caption="A ranking: sorted, with every value written"
        height={200}
        summary="Ranked bars of orders by city in November: Kyiv 86, Lviv 61, Odesa 44, Dnipro 27, Kharkiv 19. Demo data."
      >
        <BarChart data={data} layout="vertical" barSize={16} margin={{ right: 40 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="city" width="auto" tick={{ className: 'tray-chart__name' }} />
          <ChartTooltip cursor={false} />
          <Bar dataKey="orders" fill="var(--color-orders)" radius={4}>
            <LabelList position="right" offset={12} />
          </Bar>
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Two series

Side by side, 2px apart.

```tsx
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartFigures, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { month: 'Mar', thisYear: 6, lastYear: 5 },
  { month: 'Apr', thisYear: 14, lastYear: 12 },
  { month: 'May', thisYear: 22, lastYear: 17 },
  { month: 'Jun', thisYear: 19, lastYear: 18 },
  { month: 'Jul', thisYear: 9, lastYear: 11 },
  { month: 'Aug', thisYear: 7, lastYear: 6 },
  { month: 'Sep', thisYear: 15, lastYear: 16 },
  { month: 'Oct', thisYear: 10, lastYear: 8 },
];

const config = {
  thisYear: { label: '2026' },
  lastYear: { label: '2025' },
} satisfies ChartConfig;

export function BarMultiple() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="This season against the last"
        caption="Two series side by side, 2px apart"
        legend
        footer={<ChartFigures data={data} labelKey="month" labelHead="Month" unit=" kg" />}
        summary="Grouped bar chart comparing caviar collected each month in 2026 and 2025, March to October. Both peak in late spring; 2026 is higher in May. Demo data."
      >
        <BarChart data={data} maxBarSize={14} barGap={2} margin={{ top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Bar dataKey="thisYear" fill="var(--color-thisYear)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="lastYear" fill="var(--color-lastYear)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Stacked

Parts of a whole, set apart by a gap.

```tsx
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartFigures, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { month: 'Apr', jars: 8, restaurants: 4, shop: 2 },
  { month: 'May', jars: 12, restaurants: 6, shop: 4 },
  { month: 'Jun', jars: 10, restaurants: 6, shop: 3 },
  { month: 'Jul', jars: 5, restaurants: 2, shop: 2 },
  { month: 'Aug', jars: 4, restaurants: 2, shop: 1 },
  { month: 'Sep', jars: 8, restaurants: 5, shop: 2 },
];

const config = {
  jars: { label: 'Jars' },
  restaurants: { label: 'Restaurants' },
  shop: { label: 'Farm shop' },
} satisfies ChartConfig;

export function BarStacked() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Where the harvest went"
        caption="Parts of a whole over time, set apart by a gap"
        legend
        footer={<ChartFigures data={data} labelKey="month" labelHead="Month" unit=" kg" />}
        summary="Stacked bar chart of the harvest by channel, April to September 2026. Jars are the largest part in every month; the total peaks at 22 kilograms in May. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" total="Total" />} />
          <Bar dataKey="jars" stackId="a" fill="var(--color-jars)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="shop" stackId="a" fill="var(--color-shop)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Negative values

Bars grow from zero in both directions.

```tsx
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { month: 'Mar', change: 1 },
  { month: 'Apr', change: 2 },
  { month: 'May', change: 5 },
  { month: 'Jun', change: 1 },
  { month: 'Jul', change: -2 },
  { month: 'Aug', change: 1 },
  { month: 'Sep', change: -1 },
  { month: 'Oct', change: 2 },
];

const config = { change: { label: 'Change' } } satisfies ChartConfig;

const signed = (value: number | string) => `${Number(value) > 0 ? '+' : ''}${value} kg`;

export function BarNegative() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Change on last year"
        caption="Bars grow from zero, up or down"
        summary="Bar chart of the change in caviar collected each month against 2025. Six months are up, most of all May with 5 kilograms more; July and September are down. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" axisLine={false} />
          <YAxis width="auto" tickCount={4} />
          <ReferenceLine y={0} />
          <ChartTooltip content={<ChartTooltipContent valueFormatter={signed} />} />
          <Bar dataKey="change" fill="var(--color-change)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## One bar picked out

The subject in ink, the rest as context.

```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { month: 'Mar', collected: 6 },
  { month: 'Apr', collected: 14 },
  { month: 'May', collected: 22 },
  { month: 'Jun', collected: 19 },
  { month: 'Jul', collected: 9 },
  { month: 'Aug', collected: 7 },
  { month: 'Sep', collected: 15 },
  { month: 'Oct', collected: 10 },
];

const config = { collected: { label: 'Collected' } } satisfies ChartConfig;

/* One bar is the subject; the others step back to the colour of an empty track. */
const shown = data.map((row) => ({ ...row, fill: row.month === 'Oct' ? 'var(--color-collected)' : 'var(--track)' }));

export function BarActive() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="October against the season"
        caption="One bar picked out; the rest are context"
        summary="Bar chart of caviar collected by month in 2026 with October, at 10 kilograms, picked out. Demo data."
      >
        <BarChart data={shown} maxBarSize={24} margin={{ top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" hideIndicator />} />
          <Bar dataKey="collected" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## With a plan line

A dashed reference line.

```tsx
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { month: 'Mar', collected: 6 },
  { month: 'Apr', collected: 14 },
  { month: 'May', collected: 22 },
  { month: 'Jun', collected: 19 },
  { month: 'Jul', collected: 9 },
  { month: 'Aug', collected: 7 },
  { month: 'Sep', collected: 15 },
  { month: 'Oct', collected: 10 },
];

const config = { collected: { label: 'Collected' } } satisfies ChartConfig;

export function BarTarget() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Harvest against the plan"
        caption="A dashed rule marks the monthly plan"
        summary="Bar chart of caviar collected by month in 2026 against a plan of 15 kilograms a month. May, June and September reach it. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8, right: 44 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Bar dataKey="collected" fill="var(--color-collected)" radius={[4, 4, 0, 0]} />
          <ReferenceLine y={15} strokeDasharray="4 4" label={{ value: 'Plan', position: 'right', offset: 8 }} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```
