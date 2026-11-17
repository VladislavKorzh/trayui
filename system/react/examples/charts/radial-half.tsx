import { PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartCenter, ChartContainer, type ChartConfig } from 'trayui-react/charts';

const data = [{ name: 'reserved', share: 68, fill: 'var(--color-reserved)' }];

const config = { reserved: { label: 'Reserved' } } satisfies ChartConfig;

export function RadialHalf() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Autumn batch reserved"
        caption="A gauge: half a ring from empty to full"
        height={132}
        summary="Gauge chart: 68 percent of the autumn batch is reserved, 280 of 412 jars. Demo data."
      >
        <RadialBarChart data={data} cy="100%" innerRadius={104} outerRadius={124} startAngle={180} endAngle={0}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <PolarRadiusAxis type="category" dataKey="name" tick={false} axisLine={false}>
            <ChartCenter value="68%" label="280 of 412 jars" dy={36} />
          </PolarRadiusAxis>
          <RadialBar dataKey="share" background cornerRadius={99} />
        </RadialBarChart>
      </ChartContainer>
    </Card>
  );
}
