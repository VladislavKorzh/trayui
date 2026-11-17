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
