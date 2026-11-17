import { Pie, PieChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { channel: 'jars', weight: 57, fill: 'var(--color-jars)' },
  { channel: 'restaurants', weight: 27, fill: 'var(--color-restaurants)' },
  { channel: 'shop', weight: 14, fill: 'var(--color-shop)' },
  { channel: 'reserve', weight: 6, fill: 'var(--color-reserve)' },
];

const config = {
  jars: { label: 'Jars' },
  restaurants: { label: 'Restaurants' },
  shop: { label: 'Farm shop' },
  reserve: { label: 'Reserve' },
} satisfies ChartConfig;

export function PieDefault() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Where the harvest goes"
        caption="Five parts at most, clockwise from the top"
        round
        legend
        summary="Pie chart of where the 104 kilograms of the 2026 season went: jars 57, restaurants 27, the farm shop 14, the reserve 6. Demo data."
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent unit=" kg" nameKey="channel" />} />
          <Pie data={data} dataKey="weight" nameKey="channel" outerRadius="100%" startAngle={90} endAngle={-270} />
        </PieChart>
      </ChartContainer>
    </Card>
  );
}
