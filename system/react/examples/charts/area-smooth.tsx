import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { time: '00', active: 82 },
  { time: '02', active: 88 },
  { time: '04', active: 74 },
  { time: '06', active: 41 },
  { time: '08', active: 18 },
  { time: '10', active: 9 },
  { time: '12', active: 6 },
  { time: '14', active: 5 },
  { time: '16', active: 8 },
  { time: '18', active: 24 },
  { time: '20', active: 55 },
  { time: '22', active: 73 },
];

const config = { active: { label: 'Active' } } satisfies ChartConfig;

export function AreaSmooth() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Snails active through the day"
        caption="Share of the bed that is moving"
        summary="Area chart of the share of snails active through the day. It peaks at 88 percent at two in the morning and falls to 5 percent at two in the afternoon. Demo data."
      >
        <AreaChart data={data} margin={{ top: 8, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="time" />
          <ChartTooltip content={<ChartTooltipContent unit="%" labelFormatter={(label) => `${label}:00`} />} />
          <Area dataKey="active" type="monotone" fill="var(--color-active)" stroke="var(--color-active)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
