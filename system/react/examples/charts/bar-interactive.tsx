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
