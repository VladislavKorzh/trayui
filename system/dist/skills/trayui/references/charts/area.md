# Area charts

A volume over time: a 2px line over a quiet fill. One series is ink; several take the data colours and a key.

Each example is one React file. It needs `recharts` and `trayui-react` (the React package of Tray UI: see [React](https://trayui.com/docs/react.md)). The names and the figures are invented.

## Interactive

A period switch in the head of the card.

```tsx
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

const config = {
  shop: { label: 'Farm shop' },
  restaurants: { label: 'Restaurants' },
} satisfies ChartConfig;

const ranges = [
  { value: '90', label: '3 months' },
  { value: '30', label: '30 days' },
  { value: '7', label: '7 days' },
];

export function AreaInteractive() {
  const [range, setRange] = React.useState('90');
  const shown = data.slice(-Number(range));
  return (
    <Card
      title="Orders by day"
      description="Farm shop and restaurants, to 15 November 2026"
      action={<ToggleGroup size="sm" aria-label="Period" items={ranges} value={range} onChange={setRange} />}
    >
      <ChartContainer
        config={config}
        height={240}
        legend
        summary={`Area chart of orders by day for the last ${range} days, from the farm shop and from restaurants. The farm shop takes more on most days, and most on Sundays. Demo data.`}
      >
        <AreaChart data={shown} margin={{ top: 8, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickFormatter={day} minTickGap={32} />
          <YAxis width="auto" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => day(String(label))} total="Orders" />} />
          <Area dataKey="shop" type="monotone" fill="var(--color-shop)" stroke="var(--color-shop)" activeDot={{ r: 5 }} />
          <Area dataKey="restaurants" type="monotone" fill="var(--color-restaurants)" stroke="var(--color-restaurants)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
```

## Default

One series, straight segments.

```tsx
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
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

export function AreaDefault() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="March to October 2026"
        summary="Area chart of caviar collected by month in 2026. It peaks at 22 kilograms in May. Demo data."
      >
        <AreaChart data={data} margin={{ top: 8, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Area dataKey="collected" fill="var(--color-collected)" stroke="var(--color-collected)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
```

## Smooth

A curve through the points.

```tsx
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { time: '00', active: 82 },
  { time: '02', active: 88 },
  { time: '04', active: 74 },
  { time: '06', active: 41 },
  { time: '08', active: 18 },
  { time: '10', active: 9 },
  { time: '12', active: 6 },
  { time: '14', active: 5 },
  { time: '16', active: 8 },
  { time: '18', active: 24 },
  { time: '20', active: 55 },
  { time: '22', active: 73 },
];

const config = { active: { label: 'Active' } } satisfies ChartConfig;

export function AreaSmooth() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Snails active through the day"
        caption="Share of the bed that is moving"
        summary="Area chart of the share of snails active through the day. It peaks at 88 percent at two in the morning and falls to 5 percent at two in the afternoon. Demo data."
      >
        <AreaChart data={data} margin={{ top: 8, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="time" />
          <ChartTooltip content={<ChartTooltipContent unit="%" labelFormatter={(label) => `${label}:00`} />} />
          <Area dataKey="active" type="monotone" fill="var(--color-active)" stroke="var(--color-active)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
```

## Step

For a value that holds until it changes.

```tsx
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { day: 'Mon', jars: 120 },
  { day: 'Tue', jars: 96 },
  { day: 'Wed', jars: 96 },
  { day: 'Thu', jars: 60 },
  { day: 'Fri', jars: 140 },
  { day: 'Sat', jars: 88 },
  { day: 'Sun', jars: 72 },
];

const config = { jars: { label: 'In the cold room' } } satisfies ChartConfig;

export function AreaStep() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Jars in the cold room"
        caption="A count holds until the next delivery or order"
        summary="Step chart of jars in the cold room through one week. It falls from 120 on Monday to 60 on Thursday and is refilled to 140 on Friday. Demo data."
      >
        <AreaChart data={data} margin={{ top: 8, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="day" />
          <ChartTooltip content={<ChartTooltipContent unit=" jars" />} />
          <Area dataKey="jars" type="step" fill="var(--color-jars)" stroke="var(--color-jars)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
```

## Value axis

With amounts along the side.

```tsx
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

export function AreaAxes() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="With a value axis, for reading amounts"
        summary="Area chart of caviar collected by month in 2026, with a value axis in kilograms. It peaks at 22 kilograms in May. Demo data."
      >
        <AreaChart data={data} margin={{ top: 8, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" padding={{ left: 12, right: 12 }} />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Area dataKey="collected" fill="var(--color-collected)" stroke="var(--color-collected)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
```

## Peak labelled

The extreme named in the plot.

```tsx
import { Area, AreaChart, CartesianGrid, LabelList, XAxis } from 'recharts';
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

export function AreaPeak() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="The extreme is labelled; the rest is in the tooltip"
        summary="Area chart of caviar collected by month in 2026, with the peak of 22 kilograms in May labelled. Demo data."
      >
        <AreaChart data={data} margin={{ top: 28, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Area dataKey="collected" fill="var(--color-collected)" stroke="var(--color-collected)" activeDot={{ r: 5 }}>
            <LabelList position="top" offset={10} formatter={(value) => (value === top ? `${value}\u00a0kg` : '')} />
          </Area>
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
```

## Stacked

Parts of a whole over time.

```tsx
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

export function AreaStacked() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Where the harvest went"
        caption="April to September 2026, by channel"
        legend
        footer={<ChartFigures data={data} labelKey="month" labelHead="Month" unit=" kg" />}
        summary="Stacked area chart of the harvest by channel, April to September 2026. Jars are the largest part in every month; the total peaks at 22 kilograms in May. Demo data."
      >
        <AreaChart data={data} margin={{ top: 8, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" padding={{ left: 12, right: 12 }} />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" total="Total" />} />
          <Area dataKey="jars" stackId="a" fill="var(--color-jars)" stroke="var(--color-jars)" />
          <Area dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" stroke="var(--color-restaurants)" />
          <Area dataKey="shop" stackId="a" fill="var(--color-shop)" stroke="var(--color-shop)" />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
```

## Stacked to 100%

Shares instead of amounts.

```tsx
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

export function AreaPercent() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Share of each channel"
        caption="Every month stretched to the whole"
        legend
        footer={<ChartFigures data={data} labelKey="month" labelHead="Month" unit=" kg" />}
        summary="Area chart of the share of each channel in the harvest, April to September 2026. Jars hold a little over half in every month. Demo data."
      >
        <AreaChart data={data} stackOffset="expand" margin={{ top: 8, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" padding={{ left: 12, right: 12 }} />
          <YAxis width="auto" tickCount={3} tickFormatter={(value) => `${value * 100}%`} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Area dataKey="jars" stackId="a" fill="var(--color-jars)" stroke="var(--color-jars)" />
          <Area dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" stroke="var(--color-restaurants)" />
          <Area dataKey="shop" stackId="a" fill="var(--color-shop)" stroke="var(--color-shop)" />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
```

## On an ink card

A single series turns yellow.

```tsx
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { time: '00', active: 82 },
  { time: '02', active: 88 },
  { time: '04', active: 74 },
  { time: '06', active: 41 },
  { time: '08', active: 18 },
  { time: '10', active: 9 },
  { time: '12', active: 6 },
  { time: '14', active: 5 },
  { time: '16', active: 8 },
  { time: '18', active: 24 },
  { time: '20', active: 55 },
  { time: '22', active: 73 },
];

const config = { active: { label: 'Active' } } satisfies ChartConfig;

export function AreaInverse() {
  return (
    <Card tone="inverse">
      <ChartContainer
        config={config}
        title="Snails active through the day"
        caption="On the ink card a single series turns yellow"
        summary="Area chart of the share of snails active through the day, on an ink card. It peaks at 88 percent at two in the morning. Demo data."
      >
        <AreaChart data={data} margin={{ top: 8, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="time" />
          <ChartTooltip content={<ChartTooltipContent unit="%" labelFormatter={(label) => `${label}:00`} />} />
          <Area dataKey="active" type="monotone" fill="var(--color-active)" stroke="var(--color-active)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
```
