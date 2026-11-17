import { Card, StatCard } from 'trayui-react';

export function Row() {
  return (
    <div className="tray-stats">
      <StatCard label="Revenue this month" value="$18,240" trend={{ value: '+14%', direction: 'up', tone: 'good' }} foot="than in October" spark={[9, 11, 10, 13, 12, 15, 14, 18]} />
      <StatCard label="Orders" value="842" trend={{ value: '+9%', direction: 'up', tone: 'good' }} foot="than in October" spark={[20, 22, 21, 26, 24, 27, 30, 29]} />
      <StatCard label="Refunds" value="3" trend={{ value: '−2', direction: 'down', tone: 'good' }} foot="than in October" spark={[6, 5, 7, 5, 4, 5, 3, 3]} />
      <StatCard label="Time to pack" value="26" unit="min" trend={{ value: '+4 min', direction: 'up', tone: 'bad' }} foot="than in October" spark={[20, 21, 20, 22, 23, 22, 25, 26]} />
    </div>
  );
}

export function TonesAndLink() {
  return (
    <div className="tray-stats">
      <StatCard tone="island" label="Jars left in the autumn batch" value="132" foot="Of 412. At this pace they last 9 days." />
      <StatCard tone="inverse" label="Returning customers" value="61%" trend={{ value: '+3 points', direction: 'up' }} foot="than in October" />
      <StatCard href="#" label="Average order" value="$21.66" foot="No change since October" />
    </div>
  );
}

export function OnACard() {
  return (
    <Card title="Autumn season" description="On a card, the stat cards turn white by themselves." style={{ maxWidth: 640 }}>
      <div className="tray-stats">
        <StatCard label="Jars sold" value="1,204" trend={{ value: '+6%', direction: 'up', tone: 'good' }} foot="than last season" />
        <StatCard label="Late deliveries" value="4" trend={{ value: '−3', direction: 'down', tone: 'good' }} foot="than last season" />
      </div>
    </Card>
  );
}
