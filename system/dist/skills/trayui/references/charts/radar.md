# Radar charts

Several measures of one thing, on a hairline web. Two series at most.

Each example is one React file. It needs `recharts` and `trayui-react` (the React package of Tray UI: see [React](https://trayui.com/docs/react.md)). The names and the figures are invented.

## Default

One series, in ink.

```tsx
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { measure: 'Moisture', score: 8 },
  { measure: 'Greens', score: 6 },
  { measure: 'Activity', score: 9 },
  { measure: 'Clutches', score: 7 },
  { measure: 'Shade', score: 5 },
];

const config = { score: { label: 'Bed A' } } satisfies ChartConfig;

export function RadarDefault() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Bed A, scored out of ten"
        caption="Several measures of one thing"
        round
        summary="Radar chart of bed A on five measures scored out of ten: activity 9, moisture 8, clutches 7, greens 6, shade 5. Demo data."
      >
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid />
          <PolarAngleAxis dataKey="measure" />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Radar dataKey="score" fill="var(--color-score)" stroke="var(--color-score)" />
        </RadarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Dots

A dot on each score.

```tsx
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { measure: 'Moisture', score: 8 },
  { measure: 'Greens', score: 6 },
  { measure: 'Activity', score: 9 },
  { measure: 'Clutches', score: 7 },
  { measure: 'Shade', score: 5 },
];

const config = { score: { label: 'Bed A' } } satisfies ChartConfig;

export function RadarDots() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Bed A, scored out of ten"
        caption="A dot on each score"
        round
        summary="Radar chart of bed A on five measures scored out of ten, with a dot on each score: activity 9, moisture 8, clutches 7, greens 6, shade 5. Demo data."
      >
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid />
          <PolarAngleAxis dataKey="measure" />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Radar dataKey="score" fill="var(--color-score)" stroke="var(--color-score)" dot={{ r: 5, fill: 'var(--color-score)', fillOpacity: 1 }} />
        </RadarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Two series

Two shapes and a key.

```tsx
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartFigures, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { measure: 'Moisture', bedA: 8, bedB: 6 },
  { measure: 'Greens', bedA: 6, bedB: 8 },
  { measure: 'Activity', bedA: 9, bedB: 6 },
  { measure: 'Clutches', bedA: 7, bedB: 5 },
  { measure: 'Shade', bedA: 5, bedB: 8 },
];

const config = {
  bedA: { label: 'Bed A' },
  bedB: { label: 'Bed B' },
} satisfies ChartConfig;

export function RadarMultiple() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Two beds compared"
        caption="Two series at most: a third makes a knot"
        round
        legend
        footer={<ChartFigures data={data} labelKey="measure" labelHead="Measure" />}
        summary="Radar chart comparing two beds on five measures scored out of ten. Bed A leads on activity and moisture, bed B on greens and shade. Demo data."
      >
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid />
          <PolarAngleAxis dataKey="measure" />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Radar dataKey="bedA" fill="var(--color-bedA)" stroke="var(--color-bedA)" />
          <Radar dataKey="bedB" fill="var(--color-bedB)" stroke="var(--color-bedB)" />
        </RadarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Outlines

No fill, where shapes cover each other.

```tsx
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartFigures, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { measure: 'Moisture', bedA: 8, bedB: 6 },
  { measure: 'Greens', bedA: 6, bedB: 8 },
  { measure: 'Activity', bedA: 9, bedB: 6 },
  { measure: 'Clutches', bedA: 7, bedB: 5 },
  { measure: 'Shade', bedA: 5, bedB: 8 },
];

const config = {
  bedA: { label: 'Bed A' },
  bedB: { label: 'Bed B' },
} satisfies ChartConfig;

export function RadarLines() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Two beds compared"
        caption="Outlines only, where two shapes cover each other"
        round
        legend
        footer={<ChartFigures data={data} labelKey="measure" labelHead="Measure" />}
        summary="Radar chart comparing two beds on five measures scored out of ten, drawn as outlines. Bed A leads on activity and moisture, bed B on greens and shade. Demo data."
      >
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid />
          <PolarAngleAxis dataKey="measure" />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Radar dataKey="bedA" fill="none" stroke="var(--color-bedA)" />
          <Radar dataKey="bedB" fill="none" stroke="var(--color-bedB)" />
        </RadarChart>
      </ChartContainer>
    </Card>
  );
}
```

## Round grid

Rings instead of a web.

```tsx
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { measure: 'Moisture', score: 8 },
  { measure: 'Greens', score: 6 },
  { measure: 'Activity', score: 9 },
  { measure: 'Clutches', score: 7 },
  { measure: 'Shade', score: 5 },
];

const config = { score: { label: 'Bed A' } } satisfies ChartConfig;

export function RadarCircle() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Bed A, scored out of ten"
        caption="A round grid, without its spokes"
        round
        summary="Radar chart of bed A on five measures scored out of ten, on a round grid: activity 9, moisture 8, clutches 7, greens 6, shade 5. Demo data."
      >
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid gridType="circle" radialLines={false} />
          <PolarAngleAxis dataKey="measure" />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Radar dataKey="score" fill="var(--color-score)" stroke="var(--color-score)" />
        </RadarChart>
      </ChartContainer>
    </Card>
  );
}
```
