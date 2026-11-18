# Tooltips

What the tooltip can say. Each is shown open; point at another bar to move it.

Each example is one React file. It needs `recharts` and `trayui-react` (the React package of Tray UI: see [React](https://trayui.com/docs/react.md)). The names and the figures are invented.

## Default

The category, then each series with its swatch.

```tsx
import { Bar, BarChart, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { day: 'Mon', shop: 14, restaurants: 9 },
  { day: 'Tue', shop: 17, restaurants: 12 },
  { day: 'Wed', shop: 21, restaurants: 10 },
  { day: 'Thu', shop: 16, restaurants: 14 },
  { day: 'Fri', shop: 24, restaurants: 18 },
  { day: 'Sat', shop: 29, restaurants: 11 },
];

const config = {
  shop: { label: 'Farm shop' },
  restaurants: { label: 'Restaurants' },
} satisfies ChartConfig;

export function TooltipDefault() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="The tooltip"
        caption="The category, then each series with its swatch"
        summary="Stacked bar chart of orders by day in one week, from the farm shop and from restaurants. Saturday has the most, 40. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <XAxis dataKey="day" />
          <ChartTooltip defaultIndex={1} content={<ChartTooltipContent />} />
          <Bar dataKey="shop" stackId="a" fill="var(--color-shop)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Line mark

A line instead of a swatch.

```tsx
import { Bar, BarChart, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { day: 'Mon', shop: 14, restaurants: 9 },
  { day: 'Tue', shop: 17, restaurants: 12 },
  { day: 'Wed', shop: 21, restaurants: 10 },
  { day: 'Thu', shop: 16, restaurants: 14 },
  { day: 'Fri', shop: 24, restaurants: 18 },
  { day: 'Sat', shop: 29, restaurants: 11 },
];

const config = {
  shop: { label: 'Farm shop' },
  restaurants: { label: 'Restaurants' },
} satisfies ChartConfig;

export function TooltipLine() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="A line for a mark"
        caption="For series drawn as lines"
        summary="Stacked bar chart of orders by day in one week, from the farm shop and from restaurants. Saturday has the most, 40. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <XAxis dataKey="day" />
          <ChartTooltip defaultIndex={1} content={<ChartTooltipContent indicator="line" />} />
          <Bar dataKey="shop" stackId="a" fill="var(--color-shop)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## No mark

Names and values alone.

```tsx
import { Bar, BarChart, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { day: 'Mon', shop: 14, restaurants: 9 },
  { day: 'Tue', shop: 17, restaurants: 12 },
  { day: 'Wed', shop: 21, restaurants: 10 },
  { day: 'Thu', shop: 16, restaurants: 14 },
  { day: 'Fri', shop: 24, restaurants: 18 },
  { day: 'Sat', shop: 29, restaurants: 11 },
];

const config = {
  shop: { label: 'Farm shop' },
  restaurants: { label: 'Restaurants' },
} satisfies ChartConfig;

export function TooltipNone() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="No mark"
        caption="When the names alone tell the series apart"
        summary="Stacked bar chart of orders by day in one week, from the farm shop and from restaurants. Saturday has the most, 40. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <XAxis dataKey="day" />
          <ChartTooltip defaultIndex={1} content={<ChartTooltipContent hideIndicator />} />
          <Bar dataKey="shop" stackId="a" fill="var(--color-shop)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## No first line

Without the category.

```tsx
import { Bar, BarChart, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { day: 'Mon', shop: 14, restaurants: 9 },
  { day: 'Tue', shop: 17, restaurants: 12 },
  { day: 'Wed', shop: 21, restaurants: 10 },
  { day: 'Thu', shop: 16, restaurants: 14 },
  { day: 'Fri', shop: 24, restaurants: 18 },
  { day: 'Sat', shop: 29, restaurants: 11 },
];

const config = {
  shop: { label: 'Farm shop' },
  restaurants: { label: 'Restaurants' },
} satisfies ChartConfig;

export function TooltipNoLabel() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="No first line"
        caption="When the place on the axis says it already"
        summary="Stacked bar chart of orders by day in one week, from the farm shop and from restaurants. Saturday has the most, 40. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <XAxis dataKey="day" />
          <ChartTooltip defaultIndex={1} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="shop" stackId="a" fill="var(--color-shop)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Own first line

The category written by a formatter.

```tsx
import { Bar, BarChart, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { day: 'Mon', shop: 14, restaurants: 9 },
  { day: 'Tue', shop: 17, restaurants: 12 },
  { day: 'Wed', shop: 21, restaurants: 10 },
  { day: 'Thu', shop: 16, restaurants: 14 },
  { day: 'Fri', shop: 24, restaurants: 18 },
  { day: 'Sat', shop: 29, restaurants: 11 },
];

const config = {
  shop: { label: 'Farm shop' },
  restaurants: { label: 'Restaurants' },
} satisfies ChartConfig;

export function TooltipLabel() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="A first line of your own"
        caption="The category written out in full"
        summary="Stacked bar chart of orders by day in one week, from the farm shop and from restaurants. Saturday has the most, 40. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <XAxis dataKey="day" />
          <ChartTooltip defaultIndex={1} content={<ChartTooltipContent labelFormatter={(label) => `${label}, 9 to 14 November`} />} />
          <Bar dataKey="shop" stackId="a" fill="var(--color-shop)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Unit

A unit after every value.

```tsx
import { Bar, BarChart, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { day: 'Mon', shop: 14, restaurants: 9 },
  { day: 'Tue', shop: 17, restaurants: 12 },
  { day: 'Wed', shop: 21, restaurants: 10 },
  { day: 'Thu', shop: 16, restaurants: 14 },
  { day: 'Fri', shop: 24, restaurants: 18 },
  { day: 'Sat', shop: 29, restaurants: 11 },
];

const config = {
  shop: { label: 'Farm shop' },
  restaurants: { label: 'Restaurants' },
} satisfies ChartConfig;

export function TooltipUnit() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="With a unit"
        caption="A unit after every value"
        summary="Stacked bar chart of orders by day in one week, from the farm shop and from restaurants. Saturday has the most, 40. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <XAxis dataKey="day" />
          <ChartTooltip defaultIndex={1} content={<ChartTooltipContent unit=" orders" />} />
          <Bar dataKey="shop" stackId="a" fill="var(--color-shop)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Formatter

Each value written by hand.

```tsx
import { Bar, BarChart, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { day: 'Mon', shop: 14, restaurants: 9 },
  { day: 'Tue', shop: 17, restaurants: 12 },
  { day: 'Wed', shop: 21, restaurants: 10 },
  { day: 'Thu', shop: 16, restaurants: 14 },
  { day: 'Fri', shop: 24, restaurants: 18 },
  { day: 'Sat', shop: 29, restaurants: 11 },
];

const config = {
  shop: { label: 'Farm shop' },
  restaurants: { label: 'Restaurants' },
} satisfies ChartConfig;

export function TooltipFormat() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Values written by hand"
        caption="A formatter says each value its own way"
        summary="Stacked bar chart of orders by day in one week, from the farm shop and from restaurants. Saturday has the most, 40. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <XAxis dataKey="day" />
          <ChartTooltip defaultIndex={1} content={<ChartTooltipContent valueFormatter={(value) => `${value} orders, ${Number(value) * 2} jars`} />} />
          <Bar dataKey="shop" stackId="a" fill="var(--color-shop)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Total

A last row sums the series.

```tsx
import { Bar, BarChart, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { day: 'Mon', shop: 14, restaurants: 9 },
  { day: 'Tue', shop: 17, restaurants: 12 },
  { day: 'Wed', shop: 21, restaurants: 10 },
  { day: 'Thu', shop: 16, restaurants: 14 },
  { day: 'Fri', shop: 24, restaurants: 18 },
  { day: 'Sat', shop: 29, restaurants: 11 },
];

const config = {
  shop: { label: 'Farm shop' },
  restaurants: { label: 'Restaurants' },
} satisfies ChartConfig;

export function TooltipTotal() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="With a total"
        caption="A last row sums the series"
        summary="Stacked bar chart of orders by day in one week, from the farm shop and from restaurants. Saturday has the most, 40. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <XAxis dataKey="day" />
          <ChartTooltip defaultIndex={1} content={<ChartTooltipContent total="All orders" />} />
          <Bar dataKey="shop" stackId="a" fill="var(--color-shop)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```

## No highlight

Without the column highlight.

```tsx
import { Bar, BarChart, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { day: 'Mon', shop: 14, restaurants: 9 },
  { day: 'Tue', shop: 17, restaurants: 12 },
  { day: 'Wed', shop: 21, restaurants: 10 },
  { day: 'Thu', shop: 16, restaurants: 14 },
  { day: 'Fri', shop: 24, restaurants: 18 },
  { day: 'Sat', shop: 29, restaurants: 11 },
];

const config = {
  shop: { label: 'Farm shop' },
  restaurants: { label: 'Restaurants' },
} satisfies ChartConfig;

export function TooltipCursor() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="No highlight"
        caption="Without the column highlight behind the bars"
        summary="Stacked bar chart of orders by day in one week, from the farm shop and from restaurants. Saturday has the most, 40. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <XAxis dataKey="day" />
          <ChartTooltip defaultIndex={1} cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="shop" stackId="a" fill="var(--color-shop)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
```
