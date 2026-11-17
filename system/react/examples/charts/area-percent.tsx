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

export function AreaPercent() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Share of each channel"
        caption="Every month stretched to the whole"
        legend
        footer={<ChartFigures data={data} labelKey="month" labelHead="Month" unit=" kg" />}
        summary="Area chart of the share of each channel in the harvest, April to September 2026. Jars hold a little over half in every month. Demo data."
      >
        <AreaChart data={data} stackOffset="expand" margin={{ top: 8, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" padding={{ left: 12, right: 12 }} />
          <YAxis width="auto" tickCount={3} tickFormatter={(value) => `${value * 100}%`} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Area dataKey="jars" stackId="a" fill="var(--color-jars)" stroke="var(--color-jars)" />
          <Area dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" stroke="var(--color-restaurants)" />
          <Area dataKey="shop" stackId="a" fill="var(--color-shop)" stroke="var(--color-shop)" />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
