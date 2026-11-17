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
