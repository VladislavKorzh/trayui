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
