import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
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

export function LineAxes() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="With a value axis, for reading amounts"
        summary="Line chart of caviar collected by month in 2026, with a value axis in kilograms. It peaks at 22 kilograms in May. Demo data."
      >
        <LineChart data={data} margin={{ top: 8, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" padding={{ left: 12, right: 12 }} />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Line dataKey="collected" stroke="var(--color-collected)" dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
