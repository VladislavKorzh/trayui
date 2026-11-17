import { PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import { Card } from 'trayui-react';
import { ChartCenter, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from 'trayui-react/charts';

const data = [{ batch: 'Autumn', shop: 168, restaurants: 112 }];

const config = {
  shop: { label: 'Farm shop' },
  restaurants: { label: 'Restaurants' },
} satisfies ChartConfig;

export function RadialStacked() {
  return (
    <Card>
      <ChartContainer
        config={config}
        title="Who reserved the batch"
        caption="Two parts of one total, end to end"
        height={132}
        legend
        summary="Half-ring chart of the 280 jars reserved from the autumn batch: 168 by the farm shop and 112 by restaurants. Demo data."
      >
        <RadialBarChart data={data} cy="100%" innerRadius={104} outerRadius={124} startAngle={180} endAngle={0}>
          <ChartTooltip cursor={false} content={<ChartTooltipContent unit=" jars" hideLabel />} />
          {/* The scale runs to the total, so the two parts fill the half ring between them. */}
          <PolarAngleAxis type="number" domain={[0, 280]} tick={false} axisLine={false} />
          <PolarRadiusAxis type="category" dataKey="batch" tick={false} axisLine={false}>
            <ChartCenter value="280" label="jars reserved" dy={36} />
          </PolarRadiusAxis>
          <RadialBar dataKey="shop" stackId="a" fill="var(--color-shop)" cornerRadius={4} stroke="var(--tray-ground)" strokeWidth={2} />
          <RadialBar dataKey="restaurants" stackId="a" fill="var(--color-restaurants)" cornerRadius={4} stroke="var(--tray-ground)" strokeWidth={2} />
        </RadialBarChart>
      </ChartContainer>
    </Card>
  );
}
