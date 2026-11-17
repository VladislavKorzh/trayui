import { PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartCenter, ChartContainer, type ChartConfig } from 'trayui-react/charts';

const data = [{ name: 'reserved', share: 68, fill: 'var(--color-reserved)' }];

const config = { reserved: { label: 'Reserved' } } satisfies ChartConfig;

export function RadialAccent() {
  return (
    <Card tone="accent">
      <ChartContainer
        config={config}
        title="Autumn batch reserved"
        caption="On the yellow card the ring stays ink"
        round
        summary="Radial chart on a yellow card: 68 percent of the autumn batch is reserved, 280 of 412 jars. Demo data."
      >
        <RadialBarChart data={data} innerRadius="86%" outerRadius="100%" startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <PolarRadiusAxis type="category" dataKey="name" tick={false} axisLine={false}>
            <ChartCenter value="68%" label="280 of 412 jars" />
          </PolarRadiusAxis>
          <RadialBar dataKey="share" background cornerRadius={99} />
        </RadialBarChart>
      </ChartContainer>
    </Card>
  );
}
