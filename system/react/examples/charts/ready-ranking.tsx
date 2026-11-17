import { Card } from 'trayui-react';
import { Chart } from 'trayui-react/charts';

export function ReadyRanking() {
  return (
    <Card>
      <Chart
        type="bar"
        horizontal
        title="Orders by city, November"
        labels={['Kyiv', 'Lviv', 'Odesa', 'Dnipro', 'Kharkiv']}
        series={[{ name: 'Orders', values: [86, 61, 44, 27, 19] }]}
        summary="Ranked bars of orders by city in November: Kyiv 86, Lviv 61, Odesa 44, Dnipro 27, Kharkiv 19. Demo data."
      />
    </Card>
  );
}
