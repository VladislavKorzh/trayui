import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyDonut() {
  return (
    <Card>
      <Chart
        type="donut"
        side
        title="Where the harvest goes"
        unit=" kg"
        totalLabel="Season so far"
        labels={['Jars', 'Restaurants', 'Farm shop', 'Reserve']}
        series={[{ name: 'Weight', values: [57, 27, 14, 6] }]}
        summary="Donut chart of where the 104 kilograms of the 2026 season went: jars 57, restaurants 27, the farm shop 14, the reserve 6. Demo data."
      />
    </Card>
  );
}
