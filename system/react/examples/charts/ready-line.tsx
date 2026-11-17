import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyLine() {
  return (
    <Card>
      <Chart
        type="line"
        title="This season against the last"
        unit=" kg"
        max={30}
        labelHead="Month"
        labels={['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']}
        series={[
          { name: '2026', values: [6, 14, 22, 19, 9, 7, 15, 10, 2] },
          { name: '2025', values: [5, 12, 17, 18, 11, 6, 16, 8, 2] },
        ]}
        summary="Line chart comparing caviar collected each month in 2026 and 2025, March to November. Both peak in late spring; 2026 is higher in May. Demo data."
      />
    </Card>
  );
}
