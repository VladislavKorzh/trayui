import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyBar() {
  return (
    <Card>
      <Chart
        type="bar"
        title="Caviar collected by month"
        unit=" kg"
        max={30}
        labelHead="Month"
        labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
        series={[{ name: 'Collected', values: [0, 0, 6, 14, 22, 19, 9, 7, 15, 10, 2, 0] }]}
        summary="Bar chart of caviar collected by month in 2026. Nothing in January, February and December; the most, 22 kilograms, in May. Demo data."
      />
    </Card>
  );
}
