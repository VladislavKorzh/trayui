import * as React from 'react';
import { Calendar, Card } from 'trayui-react';

export function SingleAndRange() {
  return (
    <div className="tray-row" style={{ alignItems: 'flex-start' }}>
      <Card style={{ padding: 'var(--space-6)' }}>
        <Calendar today="2026-11-15" defaultValue="2026-11-19" min="2026-11-15" />
      </Card>
      <Calendar mode="range" today="2026-11-15" month="2026-12" defaultValue="2026-12-08/2026-12-13" />
    </div>
  );
}

export function TwoMonths() {
  return (
    <Calendar mode="range" months={2} today="2026-11-15" month="2026-11" defaultValue="2026-11-18/2026-12-02" min="2026-11-15" />
  );
}

export function Controlled() {
  const [day, setDay] = React.useState('2026-11-20');
  const date = new Date(day + 'T12:00:00');
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const named = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  return (
    <div className="tray-row" style={{ alignItems: 'flex-start', gap: 'var(--space-8)' }}>
      <Calendar today="2026-11-15" min="2026-11-16" max="2026-12-20" value={day} onChange={setDay} />
      <div className="tray-stack tray-stack--sm" style={{ maxWidth: 280 }}>
        <p className="subtitle">Delivery day</p>
        <p className="tray-soft">
          {named}: {weekend ? 'the courier comes before noon.' : 'the courier comes between 10:00 and 18:00.'}
        </p>
      </div>
    </div>
  );
}
