import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { day: 'Mon', jars: 120 },
  { day: 'Tue', jars: 96 },
  { day: 'Wed', jars: 96 },
  { day: 'Thu', jars: 60 },
  { day: 'Fri', jars: 140 },
  { day: 'Sat', jars: 88 },
  { day: 'Sun', jars: 72 },
];

const config = { jars: { label: 'In the cold room' } } satisfies ChartConfig;

export function AreaStep() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Jars in the cold room"
        caption="A count holds until the next delivery or order"
        summary="Step chart of jars in the cold room through one week. It falls from 120 on Monday to 60 on Thursday and is refilled to 140 on Friday. Demo data."
      >
        <AreaChart data={data} margin={{ top: 8, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="day" />
          <ChartTooltip content={<ChartTooltipContent unit=" jars" />} />
          <Area dataKey="jars" type="step" fill="var(--color-jars)" stroke="var(--color-jars)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
