import { Area, AreaChart, CartesianGrid, LabelList, XAxis } from 'recharts';
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

export function AreaPeak() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Caviar collected by month"
        caption="The extreme is labelled; the rest is in the tooltip"
        summary="Area chart of caviar collected by month in 2026, with the peak of 22 kilograms in May labelled. Demo data."
      >
        <AreaChart data={data} margin={{ top: 28, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Area dataKey="collected" fill="var(--color-collected)" stroke="var(--color-collected)" activeDot={{ r: 5 }}>
            <LabelList position="top" offset={10} formatter={(value) => (value === top ? `${value}\u00a0kg` : '')} />
          </Area>
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
