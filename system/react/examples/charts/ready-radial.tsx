import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyRadial() {
  return (
    <Card>
      <Chart
        type="radial"
        title="Autumn batch reserved"
        unit="%"
        table={false}
        labels={['280 of 412 jars']}
        series={[{ name: 'Reserved', values: [68] }]}
        summary="Radial chart: 68 percent of the autumn batch is reserved, 280 of 412 jars. Demo data."
      />
    </Card>
  );
}
