import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartFigures, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { month: 'Mar', thisYear: 6, lastYear: 5 },
  { month: 'Apr', thisYear: 14, lastYear: 12 },
  { month: 'May', thisYear: 22, lastYear: 17 },
  { month: 'Jun', thisYear: 19, lastYear: 18 },
  { month: 'Jul', thisYear: 9, lastYear: 11 },
  { month: 'Aug', thisYear: 7, lastYear: 6 },
  { month: 'Sep', thisYear: 15, lastYear: 16 },
  { month: 'Oct', thisYear: 10, lastYear: 8 },
];

const config = {
  thisYear: { label: '2026' },
  lastYear: { label: '2025' },
} satisfies ChartConfig;

export function LineMultiple() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="This season against the last"
        caption="Two series take the first two data colours"
        legend
        footer={<ChartFigures data={data} labelKey="month" labelHead="Month" unit=" kg" />}
        summary="Line chart comparing caviar collected each month in 2026 and 2025, March to October. Both peak in late spring; 2026 is higher in May. Demo data."
      >
        <LineChart data={data} margin={{ top: 8, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" padding={{ left: 12, right: 12 }} />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Line dataKey="thisYear" stroke="var(--color-thisYear)" dot={false} activeDot={{ r: 5 }} />
          <Line dataKey="lastYear" stroke="var(--color-lastYear)" dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
