# Line charts

A trend: 2px lines, no dots unless each reading matters. Never a second value axis.

Each example is one React file. It needs `recharts` and `trayui-react` (the React package of Tray UI: see [React](https://trayui.com/docs/react.md)). The names and the figures are invented.

## Default

One series, straight segments.

```tsx
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
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

export function LineDefault() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="March to October 2026"
        summary="Line chart of caviar collected by month in 2026. It peaks at 22 kilograms in May. Demo data."
      >
        <LineChart data={data} margin={{ top: 8, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Line dataKey="collected" stroke="var(--color-collected)" dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
```

## Smooth

A curve through the points.

```tsx
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
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

export function LineSmooth() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Snails active through the day"
        caption="A smooth curve, for a measure that changes without steps"
        summary="Line chart of the share of snails active through the day. It peaks at 88 percent at two in the morning and falls to 5 percent at two in the afternoon. Demo data."
      >
        <LineChart data={data} margin={{ top: 8, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="time" />
          <ChartTooltip content={<ChartTooltipContent unit="%" labelFormatter={(label) => `${label}:00`} />} />
          <Line dataKey="active" type="monotone" stroke="var(--color-active)" dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
```

## Step

For a count that holds until it changes.

```tsx
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
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

export function LineStep() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Jars in the cold room"
        caption="Steps, for a count that holds until it changes"
        summary="Step chart of jars in the cold room through one week. It falls from 120 on Monday to 60 on Thursday and is refilled to 140 on Friday. Demo data."
      >
        <LineChart data={data} margin={{ top: 8, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="day" />
          <ChartTooltip content={<ChartTooltipContent unit=" jars" />} />
          <Line dataKey="jars" type="step" stroke="var(--color-jars)" dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
```

## Two series

The first two data colours and a key.

```tsx
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
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

export function LineMultiple() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="This season against the last"
        caption="Two series take the first two data colours"
        legend
        footer={<ChartFigures data={data} labelKey="month" labelHead="Month" unit=" kg" />}
        summary="Line chart comparing caviar collected each month in 2026 and 2025, March to October. Both peak in late spring; 2026 is higher in May. Demo data."
      >
        <LineChart data={data} margin={{ top: 8, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" padding={{ left: 12, right: 12 }} />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Line dataKey="thisYear" stroke="var(--color-thisYear)" dot={false} activeDot={{ r: 5 }} />
          <Line dataKey="lastYear" stroke="var(--color-lastYear)" dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
```

## Dots

A dot on each reading.

```tsx
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
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

export function LineDots() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="A dot on each reading, ringed in the ground colour"
        summary="Line chart of caviar collected by month in 2026, with a dot on each month. It peaks at 22 kilograms in May. Demo data."
      >
        <LineChart data={data} margin={{ top: 8, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Line dataKey="collected" stroke="var(--color-collected)" dot={{ r: 5, fill: 'var(--color-collected)' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
```

## Peak labelled

The extreme named in the plot.

```tsx
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from 'recharts';
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

export function LinePeak() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="The extreme is labelled; the rest is in the tooltip"
        summary="Line chart of caviar collected by month in 2026, with the peak of 22 kilograms in May labelled. Demo data."
      >
        <LineChart data={data} margin={{ top: 28, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Line dataKey="collected" stroke="var(--color-collected)" dot={false} activeDot={{ r: 5 }}>
            <LabelList position="top" offset={10} formatter={(value) => (value === top ? `${value}\u00a0kg` : '')} />
          </Line>
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
```

## Dashed comparison

The subject in ink, last season dashed in grey.

```tsx
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
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

/* The subject in ink, what it is compared with in hint grey: a config may name a colour of its own. */
const config = {
  thisYear: { label: '2026', color: 'var(--ink)' },
  lastYear: { label: '2025', color: 'var(--ink-hint)' },
} satisfies ChartConfig;

export function LineDashed() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="This season against the last"
        caption="The season before as a dashed grey line"
        legend
        footer={<ChartFigures data={data} labelKey="month" labelHead="Month" unit=" kg" />}
        summary="Line chart of caviar collected each month in 2026, with 2025 as a dashed line for comparison. 2026 is higher in May. Demo data."
      >
        <LineChart data={data} margin={{ top: 8, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" padding={{ left: 12, right: 12 }} />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" indicator="line" />} />
          <Line dataKey="lastYear" stroke="var(--color-lastYear)" strokeDasharray="4 4" dot={false} activeDot={{ r: 5 }} />
          <Line dataKey="thisYear" stroke="var(--color-thisYear)" dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
```

## Value axis

With amounts along the side.

```tsx
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
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

export function LineAxes() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="With a value axis, for reading amounts"
        summary="Line chart of caviar collected by month in 2026, with a value axis in kilograms. It peaks at 22 kilograms in May. Demo data."
      >
        <LineChart data={data} margin={{ top: 8, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" padding={{ left: 12, right: 12 }} />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Line dataKey="collected" stroke="var(--color-collected)" dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
```
