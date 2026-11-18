# Radial charts

A single share or score as a ring on a track, with its figure in the middle.

Each example is one React file. It needs `recharts` and `trayui-react` (the React package of Tray UI: see [React](https://trayui.com/docs/react.md)). The names and the figures are invented.

## Default

One share and its figure.

```tsx
import { PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartCenter, ChartContainer, type ChartConfig } from 'trayui-react/charts';

const data = [{ name: 'reserved', share: 68, fill: 'var(--color-reserved)' }];

const config = { reserved: { label: 'Reserved' } } satisfies ChartConfig;

export function RadialDefault() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Autumn batch reserved"
        caption="A single share, with its figure in the middle"
        round
        summary="Radial chart: 68 percent of the autumn batch is reserved, 280 of 412 jars. Demo data."
      >
        <RadialBarChart data={data} innerRadius="86%" outerRadius="100%" startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <PolarRadiusAxis type="category" dataKey="name" tick={false} axisLine={false}>
            <ChartCenter value="68%" label="280 of 412 jars" />
          </PolarRadiusAxis>
          <RadialBar dataKey="share" background cornerRadius={99} />
        </RadialBarChart>
      </ChartContainer>
    </Card>
  );
}
```

## On the yellow card

The ring stays ink.

```tsx
import { PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartCenter, ChartContainer, type ChartConfig } from 'trayui-react/charts';

const data = [{ name: 'reserved', share: 68, fill: 'var(--color-reserved)' }];

const config = { reserved: { label: 'Reserved' } } satisfies ChartConfig;

export function RadialAccent() {
  return (
    <Card tone="accent">
      <ChartContainer
        config={config}
        title="Autumn batch reserved"
        caption="On the yellow card the ring stays ink"
        round
        summary="Radial chart on a yellow card: 68 percent of the autumn batch is reserved, 280 of 412 jars. Demo data."
      >
        <RadialBarChart data={data} innerRadius="86%" outerRadius="100%" startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <PolarRadiusAxis type="category" dataKey="name" tick={false} axisLine={false}>
            <ChartCenter value="68%" label="280 of 412 jars" />
          </PolarRadiusAxis>
          <RadialBar dataKey="share" background cornerRadius={99} />
        </RadialBarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Rings

A ring for each of a few things.

```tsx
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { bed: 'bedA', full: 82, fill: 'var(--color-bedA)' },
  { bed: 'bedB', full: 64, fill: 'var(--color-bedB)' },
  { bed: 'bedC', full: 47, fill: 'var(--color-bedC)' },
];

const config = {
  bedA: { label: 'Bed A' },
  bedB: { label: 'Bed B' },
  bedC: { label: 'Bed C' },
} satisfies ChartConfig;

export function RadialRings() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="How full each bed is"
        caption="A ring for each, four at most"
        round
        legend
        summary="Radial chart of how full three beds are: bed A 82 percent, bed B 64 percent, bed C 47 percent. Demo data."
      >
        <RadialBarChart data={data} innerRadius="40%" outerRadius="100%" startAngle={90} endAngle={-270} barCategoryGap={4}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent unit="%" nameKey="bed" />} />
          <RadialBar dataKey="full" background cornerRadius={99} />
        </RadialBarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Gauge

Half a ring from empty to full.

```tsx
import { PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartCenter, ChartContainer, type ChartConfig } from 'trayui-react/charts';

const data = [{ name: 'reserved', share: 68, fill: 'var(--color-reserved)' }];

const config = { reserved: { label: 'Reserved' } } satisfies ChartConfig;

export function RadialHalf() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Autumn batch reserved"
        caption="A gauge: half a ring from empty to full"
        height={132}
        summary="Gauge chart: 68 percent of the autumn batch is reserved, 280 of 412 jars. Demo data."
      >
        <RadialBarChart data={data} cy="100%" innerRadius={104} outerRadius={124} startAngle={180} endAngle={0}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <PolarRadiusAxis type="category" dataKey="name" tick={false} axisLine={false}>
            <ChartCenter value="68%" label="280 of 412 jars" dy={36} />
          </PolarRadiusAxis>
          <RadialBar dataKey="share" background cornerRadius={99} />
        </RadialBarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Stacked

Two parts of one total.

```tsx
import { PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartCenter, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [{ batch: 'Autumn', shop: 168, restaurants: 112 }];

const config = {
  shop: { label: 'Farm shop' },
  restaurants: { label: 'Restaurants' },
} satisfies ChartConfig;

export function RadialStacked() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Who reserved the batch"
        caption="Two parts of one total, end to end"
        height={132}
        legend
        summary="Half-ring chart of the 280 jars reserved from the autumn batch: 168 by the farm shop and 112 by restaurants. Demo data."
      >
        <RadialBarChart data={data} cy="100%" innerRadius={104} outerRadius={124} startAngle={180} endAngle={0}>
          <ChartTooltip cursor={false} content={<ChartTooltipContent unit=" jars" hideLabel />} />
          {/* The scale runs to the total, so the two parts fill the half ring between them. */}
          <PolarAngleAxis type="number" domain={[0, 280]} tick={false} axisLine={false} />
          <PolarRadiusAxis type="category" dataKey="batch" tick={false} axisLine={false}>
            <ChartCenter value="280" label="jars reserved" dy={36} />
          </PolarRadiusAxis>
          <RadialBar dataKey="shop" stackId="a" fill="var(--color-shop)" cornerRadius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <RadialBar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" cornerRadius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </RadialBarChart>
      </ChartContainer>
    </Card>
  );
}
```
