import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

export function BarMultiple() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="This season against the last"
        caption="Two series side by side, 2px apart"
        legend
        footer={<ChartFigures data={data} labelKey="month" labelHead="Month" unit=" kg" />}
        summary="Grouped bar chart comparing caviar collected each month in 2026 and 2025, March to October. Both peak in late spring; 2026 is higher in May. Demo data."
      >
        <BarChart data={data} maxBarSize={14} barGap={2} margin={{ top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" />} />
          <Bar dataKey="thisYear" fill="var(--color-thisYear)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="lastYear" fill="var(--color-lastYear)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
