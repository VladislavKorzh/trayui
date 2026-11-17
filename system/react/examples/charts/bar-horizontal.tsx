import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, type ChartConfig } from 'trayui-react/charts';

const data = [
  { city: 'Kyiv', orders: 86 },
  { city: 'Lviv', orders: 61 },
  { city: 'Odesa', orders: 44 },
  { city: 'Dnipro', orders: 27 },
  { city: 'Kharkiv', orders: 19 },
];

const config = { orders: { label: 'Orders' } } satisfies ChartConfig;

export function BarHorizontal() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Orders by city, November"
        caption="A ranking: sorted, with every value written"
        height={200}
        summary="Ranked bars of orders by city in November: Kyiv 86, Lviv 61, Odesa 44, Dnipro 27, Kharkiv 19. Demo data."
      >
        <BarChart data={data} layout="vertical" barSize={16} margin={{ right: 40 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="city" width="auto" tick={{ className: 'tray-chart__name' }} />
          <ChartTooltip cursor={false} />
          <Bar dataKey="orders" fill="var(--color-orders)" radius={4}>
            <LabelList position="right" offset={12} />
          </Bar>
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
