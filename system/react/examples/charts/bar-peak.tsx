import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { month: 'Mar', collected: 6 },
  { month: 'Apr', collected: 14 },
  { month: 'May', collected: 22 },
  { month: 'Jun', collected: 19 },
  { month: 'Jul', collected: 9 },
  { month: 'Aug', collected: 7 },
  { month: 'Sep', collected: 15 },
  { month: 'Oct', collected: 10 },
];

const config = { collected: { label: 'Collected' } } satisfies ChartConfig;

const top = Math.max(...data.map((row) => row.collected));

export function BarPeak() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="The extreme is labelled; never a number on every bar"
        summary="Bar chart of caviar collected by month in 2026, with a value axis and the peak of 22 kilograms in May labelled. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 28 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Bar dataKey="collected" fill="var(--color-collected)" radius={[4, 4, 0, 0]}>
            <LabelList position="top" offset={10} formatter={(value) => (value === top ? `${value}\u00a0kg` : '')} />
          </Bar>
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
