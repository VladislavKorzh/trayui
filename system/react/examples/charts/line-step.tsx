import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
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

export function LineStep() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Jars in the cold room"
        caption="Steps, for a count that holds until it changes"
        summary="Step chart of jars in the cold room through one week. It falls from 120 on Monday to 60 on Thursday and is refilled to 140 on Friday. Demo data."
      >
        <LineChart data={data} margin={{ top: 8, left: 16, right: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="day" />
          <ChartTooltip content={<ChartTooltipContent unit=" jars" />} />
          <Line dataKey="jars" type="step" stroke="var(--color-jars)" dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
