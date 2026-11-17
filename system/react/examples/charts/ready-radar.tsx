import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyRadar() {
  return (
    <Card>
      <Chart
        type="radar"
        title="Two beds compared"
        max={10}
        labelHead="Measure"
        labels={['Moisture', 'Greens', 'Activity', 'Clutches', 'Shade']}
        series={[
          { name: 'Bed A', values: [8, 6, 9, 7, 5] },
          { name: 'Bed B', values: [6, 8, 6, 5, 8] },
        ]}
        summary="Radar chart comparing two beds on five measures scored out of ten. Bed A leads on activity and moisture, bed B on greens and shade. Demo data."
      />
    </Card>
  );
}
