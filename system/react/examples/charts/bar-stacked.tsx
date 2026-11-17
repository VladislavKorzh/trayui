import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

export function BarStacked() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Where the harvest went"
        caption="Parts of a whole over time, set apart by a gap"
        legend
        footer={<ChartFigures data={data} labelKey="month" labelHead="Month" unit=" kg" />}
        summary="Stacked bar chart of the harvest by channel, April to September 2026. Jars are the largest part in every month; the total peaks at 22 kilograms in May. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" total="Total" />} />
          <Bar dataKey="jars" stackId="a" fill="var(--color-jars)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <Bar dataKey="shop" stackId="a" fill="var(--color-shop)" radius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
