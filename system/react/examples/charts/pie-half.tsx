import { Pie, PieChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartCenter, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { state: 'reserved', jars: 280, fill: 'var(--color-reserved)' },
  { state: 'free', jars: 132, fill: 'var(--color-free)' },
];

/* What is left is not a series of its own: it takes the colour of an empty track. */
const config = {
  reserved: { label: 'Reserved', color: 'var(--ink)' },
  free: { label: 'Still free', color: 'var(--track)' },
} satisfies ChartConfig;

export function PieHalf() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Autumn batch reserved"
        caption="Half a ring, for one share of a whole"
        height={132}
        summary="Half-ring chart: 280 of the 412 jars of the autumn batch are reserved, 68 percent. Demo data."
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent unit=" jars" nameKey="state" />} />
          <Pie data={data} dataKey="jars" nameKey="state" cy="100%" innerRadius={104} outerRadius={124} startAngle={180} endAngle={0}>
            <ChartCenter value="68%" label="280 of 412 jars" dy={36} />
          </Pie>
        </PieChart>
      </ChartContainer>
    </Card>
  );
}
