import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { bed: 'bedA', full: 82, fill: 'var(--color-bedA)' },
  { bed: 'bedB', full: 64, fill: 'var(--color-bedB)' },
  { bed: 'bedC', full: 47, fill: 'var(--color-bedC)' },
];

const config = {
  bedA: { label: 'Bed A' },
  bedB: { label: 'Bed B' },
  bedC: { label: 'Bed C' },
} satisfies ChartConfig;

export function RadialRings() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="How full each bed is"
        caption="A ring for each, four at most"
        round
        legend
        summary="Radial chart of how full three beds are: bed A 82 percent, bed B 64 percent, bed C 47 percent. Demo data."
      >
        <RadialBarChart data={data} innerRadius="40%" outerRadius="100%" startAngle={90} endAngle={-270} barCategoryGap={4}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent unit="%" nameKey="bed" />} />
          <RadialBar dataKey="full" background cornerRadius={99} />
        </RadialBarChart>
      </ChartContainer>
    </Card>
  );
}
