import * as React from 'react';
import { Pie, PieChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartCenter, ChartContainer, type ChartConfig } from 'trayui-react/charts';

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

export function PieActive() {
  const [active, setActive] = React.useState<number | null>(null);
  const part = active == null ? null : data[active];
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Where the harvest goes"
        caption="Point at a part: the middle names it"
        round
        legend
        summary="Donut chart of where the 104 kilograms of the 2026 season went: jars 57, restaurants 27, the farm shop 14, the reserve 6. Demo data."
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="weight"
            nameKey="channel"
            innerRadius="82%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            onMouseEnter={(_part, index) => setActive(index)}
            onMouseLeave={() => setActive(null)}
          >
            <ChartCenter value={`${part ? part.weight : 104} kg`} label={part ? config[part.channel as keyof typeof config].label : 'Season so far'} />
          </Pie>
        </PieChart>
      </ChartContainer>
    </Card>
  );
}
