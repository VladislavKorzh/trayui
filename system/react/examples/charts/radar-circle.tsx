import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [
  { measure: 'Moisture', score: 8 },
  { measure: 'Greens', score: 6 },
  { measure: 'Activity', score: 9 },
  { measure: 'Clutches', score: 7 },
  { measure: 'Shade', score: 5 },
];

const config = { score: { label: 'Bed A' } } satisfies ChartConfig;

export function RadarCircle() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Bed A, scored out of ten"
        caption="A round grid, without its spokes"
        round
        summary="Radar chart of bed A on five measures scored out of ten, on a round grid: activity 9, moisture 8, clutches 7, greens 6, shade 5. Demo data."
      >
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid gridType="circle" radialLines={false} />
          <PolarAngleAxis dataKey="measure" />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Radar dataKey="score" fill="var(--color-score)" stroke="var(--color-score)" />
        </RadarChart>
      </ChartContainer>
    </Card>
  );
}
