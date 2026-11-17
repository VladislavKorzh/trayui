import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
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

export function LineDots() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="A dot on each reading, ringed in the ground colour"
        summary="Line chart of caviar collected by month in 2026, with a dot on each month. It peaks at 22 kilograms in May. Demo data."
      >
        <LineChart data={data} margin={{ top: 8, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Line dataKey="collected" stroke="var(--color-collected)" dot={{ r: 5, fill: 'var(--color-collected)' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
