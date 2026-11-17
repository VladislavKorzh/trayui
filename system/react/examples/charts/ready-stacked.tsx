import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyStacked() {
  return (
    <Card>
      <Chart
        type="bar"
        stacked
        title="Where each quarter's harvest went"
        unit=" kg"
        labelHead="Quarter"
        labels={['Q1', 'Q2', 'Q3', 'Q4']}
        series={[
          { name: 'Jars', values: [3, 30, 17, 7] },
          { name: 'Restaurants', values: [2, 14, 8, 3] },
          { name: 'Farm shop', values: [1, 8, 4, 1] },
          { name: 'Reserve', values: [0, 3, 2, 1] },
        ]}
        summary="Stacked bar chart of where each quarter of the 2026 harvest went: jars, restaurants, the farm shop and the reserve. Jars are the largest part in every quarter. Demo data."
      />
    </Card>
  );
}
