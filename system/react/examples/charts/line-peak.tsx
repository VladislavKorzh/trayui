import { CartesianGrid, LabelList, Line, LineChart, XAxis } from 'recharts';
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

export function LinePeak() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="The extreme is labelled; the rest is in the tooltip"
        summary="Line chart of caviar collected by month in 2026, with the peak of 22 kilograms in May labelled. Demo data."
      >
        <LineChart data={data} margin={{ top: 28, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Line dataKey="collected" stroke="var(--color-collected)" dot={false} activeDot={{ r: 5 }}>
            <LabelList position="top" offset={10} formatter={(value) => (value === top ? `${value}\u00a0kg` : '')} />
          </Line>
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
