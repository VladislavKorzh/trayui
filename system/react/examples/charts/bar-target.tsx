import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
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

export function BarTarget() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Harvest against the plan"
        caption="A dashed rule marks the monthly plan"
        summary="Bar chart of caviar collected by month in 2026 against a plan of 15 kilograms a month. May, June and September reach it. Demo data."
      >
        <BarChart data={data} maxBarSize={24} margin={{ top: 8, right: 44 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Bar dataKey="collected" fill="var(--color-collected)" radius={[4, 4, 0, 0]} />
          <ReferenceLine y={15} strokeDasharray="4 4" label={{ value: 'Plan', position: 'right', offset: 8 }} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
