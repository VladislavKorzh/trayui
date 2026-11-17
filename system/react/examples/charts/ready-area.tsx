import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyArea() {
  return (
    <Card tone="inverse">
      <Chart
        type="area"
        title="Snails active through the day"
        unit="%"
        max={100}
        labelHead="Time"
        labels={['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22']}
        series={[{ name: 'Active', values: [82, 88, 74, 41, 18, 9, 6, 5, 8, 24, 55, 73] }]}
        summary="Area chart of the share of snails active through the day. It peaks at 88 percent at two in the morning and falls to 5 percent at two in the afternoon. Demo data."
      />
    </Card>
  );
}
