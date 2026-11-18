# The Chart component

One component for the six usual forms: give it labels and series, and it composes the chart, its key and its table of figures.

Each example is one React file. It needs `recharts` and `trayui-react` (the React package of Tray UI: see [React](https://trayui.com/docs/react.md)). The names and the figures are invented.

## Bars

type="bar", with the peak labelled.

```tsx
import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyBar() {
  return (
    <Card>
      <Chart
        type="bar"
        title="Caviar collected by month"
        unit=" kg"
        max={30}
        labelHead="Month"
        labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
        series={[{ name: 'Collected', values: [0, 0, 6, 14, 22, 19, 9, 7, 15, 10, 2, 0] }]}
        summary="Bar chart of caviar collected by month in 2026. Nothing in January, February and December; the most, 22 kilograms, in May. Demo data."
      />
    </Card>
  );
}
```

## Area on ink

type="area" in an ink card.

```tsx
import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyArea() {
  return (
    <Card tone="inverse">
      <Chart
        type="area"
        title="Snails active through the day"
        unit="%"
        max={100}
        labelHead="Time"
        labels={['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22']}
        series={[{ name: 'Active', values: [82, 88, 74, 41, 18, 9, 6, 5, 8, 24, 55, 73] }]}
        summary="Area chart of the share of snails active through the day. It peaks at 88 percent at two in the morning and falls to 5 percent at two in the afternoon. Demo data."
      />
    </Card>
  );
}
```

## Two lines

type="line" with two series.

```tsx
import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyLine() {
  return (
    <Card>
      <Chart
        type="line"
        title="This season against the last"
        unit=" kg"
        max={30}
        labelHead="Month"
        labels={['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']}
        series={[
          { name: '2026', values: [6, 14, 22, 19, 9, 7, 15, 10, 2] },
          { name: '2025', values: [5, 12, 17, 18, 11, 6, 16, 8, 2] },
        ]}
        summary="Line chart comparing caviar collected each month in 2026 and 2025, March to November. Both peak in late spring; 2026 is higher in May. Demo data."
      />
    </Card>
  );
}
```

## Stacked bars

type="bar" stacked.

```tsx
import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyStacked() {
  return (
    <Card>
      <Chart
        type="bar"
        stacked
        title="Where each quarter's harvest went"
        unit=" kg"
        labelHead="Quarter"
        labels={['Q1', 'Q2', 'Q3', 'Q4']}
        series={[
          { name: 'Jars', values: [3, 30, 17, 7] },
          { name: 'Restaurants', values: [2, 14, 8, 3] },
          { name: 'Farm shop', values: [1, 8, 4, 1] },
          { name: 'Reserve', values: [0, 3, 2, 1] },
        ]}
        summary="Stacked bar chart of where each quarter of the 2026 harvest went: jars, restaurants, the farm shop and the reserve. Jars are the largest part in every quarter. Demo data."
      />
    </Card>
  );
}
```

## Donut and its key

type="donut" side: the key sits beside the ring when the card has room.

```tsx
import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyDonut() {
  return (
    <Card>
      <Chart
        type="donut"
        side
        title="Where the harvest goes"
        unit=" kg"
        totalLabel="Season so far"
        labels={['Jars', 'Restaurants', 'Farm shop', 'Reserve']}
        series={[{ name: 'Weight', values: [57, 27, 14, 6] }]}
        summary="Donut chart of where the 104 kilograms of the 2026 season went: jars 57, restaurants 27, the farm shop 14, the reserve 6. Demo data."
      />
    </Card>
  );
}
```

## Radial

type="radial".

```tsx
import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyRadial() {
  return (
    <Card>
      <Chart
        type="radial"
        title="Autumn batch reserved"
        unit="%"
        table={false}
        labels={['280 of 412 jars']}
        series={[{ name: 'Reserved', values: [68] }]}
        summary="Radial chart: 68 percent of the autumn batch is reserved, 280 of 412 jars. Demo data."
      />
    </Card>
  );
}
```

## Ranking

type="bar" horizontal.

```tsx
import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyRanking() {
  return (
    <Card>
      <Chart
        type="bar"
        horizontal
        title="Orders by city, November"
        labels={['Kyiv', 'Lviv', 'Odesa', 'Dnipro', 'Kharkiv']}
        series={[{ name: 'Orders', values: [86, 61, 44, 27, 19] }]}
        summary="Ranked bars of orders by city in November: Kyiv 86, Lviv 61, Odesa 44, Dnipro 27, Kharkiv 19. Demo data."
      />
    </Card>
  );
}
```

## Radar

type="radar" with two series.

```tsx
import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyRadar() {
  return (
    <Card>
      <Chart
        type="radar"
        title="Two beds compared"
        max={10}
        labelHead="Measure"
        labels={['Moisture', 'Greens', 'Activity', 'Clutches', 'Shade']}
        series={[
          { name: 'Bed A', values: [8, 6, 9, 7, 5] },
          { name: 'Bed B', values: [6, 8, 6, 5, 8] },
        ]}
        summary="Radar chart comparing two beds on five measures scored out of ten. Bed A leads on activity and moisture, bed B on greens and shade. Demo data."
      />
    </Card>
  );
}
```
