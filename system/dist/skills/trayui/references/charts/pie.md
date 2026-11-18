# Pie charts

Parts of a whole at one moment, five at most, clockwise from the top and set apart by a gap.

Each example is one React file. It needs `recharts` and `trayui-react` (the React package of Tray UI: see [React](https://trayui.com/docs/react.md)). The names and the figures are invented.

## Pie

Whole slices and a key.

```tsx
import { Pie, PieChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { channel: 'jars', weight: 57, fill: 'var(--color-jars)' },
  { channel: 'restaurants', weight: 27, fill: 'var(--color-restaurants)' },
  { channel: 'shop', weight: 14, fill: 'var(--color-shop)' },
  { channel: 'reserve', weight: 6, fill: 'var(--color-reserve)' },
];

const config = {
  jars: { label: 'Jars' },
  restaurants: { label: 'Restaurants' },
  shop: { label: 'Farm shop' },
  reserve: { label: 'Reserve' },
} satisfies ChartConfig;

export function PieDefault() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Where the harvest goes"
        caption="Five parts at most, clockwise from the top"
        round
        legend
        summary="Pie chart of where the 104 kilograms of the 2026 season went: jars 57, restaurants 27, the farm shop 14, the reserve 6. Demo data."
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent unit=" kg" nameKey="channel" />} />
          <Pie data={data} dataKey="weight" nameKey="channel" outerRadius="100%" startAngle={90} endAngle={-270} />
        </PieChart>
      </ChartContainer>
    </Card>
  );
}
```

## Donut

A thin ring with the total in the middle.

```tsx
import { Pie, PieChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartCenter, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { channel: 'jars', weight: 57, fill: 'var(--color-jars)' },
  { channel: 'restaurants', weight: 27, fill: 'var(--color-restaurants)' },
  { channel: 'shop', weight: 14, fill: 'var(--color-shop)' },
  { channel: 'reserve', weight: 6, fill: 'var(--color-reserve)' },
];

const config = {
  jars: { label: 'Jars' },
  restaurants: { label: 'Restaurants' },
  shop: { label: 'Farm shop' },
  reserve: { label: 'Reserve' },
} satisfies ChartConfig;

export function PieDonut() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Where the harvest goes"
        caption="A thin ring, with the total in the middle"
        round
        legend
        summary="Donut chart of where the 104 kilograms of the 2026 season went: jars 57, restaurants 27, the farm shop 14, the reserve 6. Demo data."
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent unit=" kg" nameKey="channel" />} />
          <Pie data={data} dataKey="weight" nameKey="channel" innerRadius="82%" outerRadius="100%" startAngle={90} endAngle={-270}>
            <ChartCenter value="104 kg" label="Season so far" />
          </Pie>
        </PieChart>
      </ChartContainer>
    </Card>
  );
}
```

## Labelled

A value beside each part.

```tsx
import { Pie, PieChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { channel: 'jars', weight: 57, fill: 'var(--color-jars)' },
  { channel: 'restaurants', weight: 27, fill: 'var(--color-restaurants)' },
  { channel: 'shop', weight: 14, fill: 'var(--color-shop)' },
  { channel: 'reserve', weight: 6, fill: 'var(--color-reserve)' },
];

const config = {
  jars: { label: 'Jars' },
  restaurants: { label: 'Restaurants' },
  shop: { label: 'Farm shop' },
  reserve: { label: 'Reserve' },
} satisfies ChartConfig;

export function PieLabels() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Where the harvest goes"
        caption="A value beside each part, in ink"
        round
        height={256}
        legend
        summary="Pie chart of where the 104 kilograms of the 2026 season went, with each part labelled: jars 57, restaurants 27, the farm shop 14, the reserve 6. Demo data."
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent unit=" kg" nameKey="channel" />} />
          <Pie data={data} dataKey="weight" nameKey="channel" outerRadius="72%" startAngle={90} endAngle={-270} label={({ value }) => `${value}\u00a0kg`} labelLine={false} />
        </PieChart>
      </ChartContainer>
    </Card>
  );
}
```

## Active part

The middle names the part under the pointer.

```tsx
import * as React from 'react';
import { Pie, PieChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartCenter, ChartContainer, type ChartConfig } from 'trayui-react/charts';

const data = [
  { channel: 'jars', weight: 57, fill: 'var(--color-jars)' },
  { channel: 'restaurants', weight: 27, fill: 'var(--color-restaurants)' },
  { channel: 'shop', weight: 14, fill: 'var(--color-shop)' },
  { channel: 'reserve', weight: 6, fill: 'var(--color-reserve)' },
];

const config = {
  jars: { label: 'Jars' },
  restaurants: { label: 'Restaurants' },
  shop: { label: 'Farm shop' },
  reserve: { label: 'Reserve' },
} satisfies ChartConfig;

export function PieActive() {
  const [active, setActive] = React.useState<number | null>(null);
  const part = active == null ? null : data[active];
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Where the harvest goes"
        caption="Point at a part: the middle names it"
        round
        legend
        summary="Donut chart of where the 104 kilograms of the 2026 season went: jars 57, restaurants 27, the farm shop 14, the reserve 6. Demo data."
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="weight"
            nameKey="channel"
            innerRadius="82%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            onMouseEnter={(_part, index) => setActive(index)}
            onMouseLeave={() => setActive(null)}
          >
            <ChartCenter value={`${part ? part.weight : 104} kg`} label={part ? config[part.channel as keyof typeof config].label : 'Season so far'} />
          </Pie>
        </PieChart>
      </ChartContainer>
    </Card>
  );
}
```

## Half ring

One share of a whole.

```tsx
import { Pie, PieChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartCenter, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { state: 'reserved', jars: 280, fill: 'var(--color-reserved)' },
  { state: 'free', jars: 132, fill: 'var(--color-free)' },
];

/* What is left is not a series of its own: it takes the colour of an empty track. */
const config = {
  reserved: { label: 'Reserved', color: 'var(--ink)' },
  free: { label: 'Still free', color: 'var(--track)' },
} satisfies ChartConfig;

export function PieHalf() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Autumn batch reserved"
        caption="Half a ring, for one share of a whole"
        height={132}
        summary="Half-ring chart: 280 of the 412 jars of the autumn batch are reserved, 68 percent. Demo data."
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent unit=" jars" nameKey="state" />} />
          <Pie data={data} dataKey="jars" nameKey="state" cy="100%" innerRadius={104} outerRadius={124} startAngle={180} endAngle={0}>
            <ChartCenter value="68%" label="280 of 412 jars" dy={36} />
          </Pie>
        </PieChart>
      </ChartContainer>
    </Card>
  );
}
```
