import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { month: 'Mar', change: 1 },
  { month: 'Apr', change: 2 },
  { month: 'May', change: 5 },
  { month: 'Jun', change: 1 },
  { month: 'Jul', change: -2 },
  { month: 'Aug', change: 1 },
  { month: 'Sep', change: -1 },
  { month: 'Oct', change: 2 },
];

const config = { change: { label: 'Change' } } satisfies ChartConfig;

const signed = (value: number | string) => `${Number(value) > 0 ? '+' : ''}${value} kg`;

export function BarNegative() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Change on last year"
        caption="Bars grow from zero, up or down"
        summary="Bar chart of the change in caviar collected each month against 2025. Six months are up, most of all May with 5 kilograms more; July and September are down. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" axisLine={false} />
          <YAxis width="auto" tickCount={4} />
          <ReferenceLine y={0} />
          <ChartTooltip content={<ChartTooltipContent valueFormatter={signed} />} />
          <Bar dataKey="change" fill="var(--color-change)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
