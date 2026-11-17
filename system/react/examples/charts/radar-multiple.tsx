import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartFigures, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { measure: 'Moisture', bedA: 8, bedB: 6 },
  { measure: 'Greens', bedA: 6, bedB: 8 },
  { measure: 'Activity', bedA: 9, bedB: 6 },
  { measure: 'Clutches', bedA: 7, bedB: 5 },
  { measure: 'Shade', bedA: 5, bedB: 8 },
];

const config = {
  bedA: { label: 'Bed A' },
  bedB: { label: 'Bed B' },
} satisfies ChartConfig;

export function RadarMultiple() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Two beds compared"
        caption="Two series at most: a third makes a knot"
        round
        legend
        footer={<ChartFigures data={data} labelKey="measure" labelHead="Measure" />}
        summary="Radar chart comparing two beds on five measures scored out of ten. Bed A leads on activity and moisture, bed B on greens and shade. Demo data."
      >
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid />
          <PolarAngleAxis dataKey="measure" />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Radar dataKey="bedA" fill="var(--color-bedA)" stroke="var(--color-bedA)" />
          <Radar dataKey="bedB" fill="var(--color-bedB)" stroke="var(--color-bedB)" />
        </RadarChart>
      </ChartContainer>
    </Card>
  );
}
