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

/* The subject in ink, what it is compared with in hint grey: a config may name a colour of its own. */
const config = {
  thisYear: { label: '2026', color: 'var(--ink)' },
  lastYear: { label: '2025', color: 'var(--ink-hint)' },
} satisfies ChartConfig;

export function LineDashed() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="This season against the last"
        caption="The season before as a dashed grey line"
        legend
        footer={<ChartFigures data={data} labelKey="month" labelHead="Month" unit=" kg" />}
        summary="Line chart of caviar collected each month in 2026, with 2025 as a dashed line for comparison. 2026 is higher in May. Demo data."
      >
        <LineChart data={data} margin={{ top: 8, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" padding={{ left: 12, right: 12 }} />
          <YAxis width="auto" unit=" kg" tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" indicator="line" />} />
          <Line dataKey="lastYear" stroke="var(--color-lastYear)" strokeDasharray="4 4" dot={false} activeDot={{ r: 5 }} />
          <Line dataKey="thisYear" stroke="var(--color-thisYear)" dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
