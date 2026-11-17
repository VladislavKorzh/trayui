import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
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

/* One bar is the subject; the others step back to the colour of an empty track. */
const shown = data.map((row) => ({ ...row, fill: row.month === 'Oct' ? 'var(--color-collected)' : 'var(--track)' }));

export function BarActive() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="October against the season"
        caption="One bar picked out; the rest are context"
        summary="Bar chart of caviar collected by month in 2026 with October, at 10 kilograms, picked out. Demo data."
      >
        <BarChart data={shown} maxBarSize={24} margin={{ top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent unit=" kg" hideIndicator />} />
          <Bar dataKey="collected" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
