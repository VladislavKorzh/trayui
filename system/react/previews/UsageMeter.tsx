import { Button, Card, UsageMeter } from 'trayui-react';

export function OnACard() {
  return (
    <Card
      title="Usage"
      description="Shop plan. Resets on 1 December."
      action={<Button variant="quiet" size="xs" href="#">Change plan</Button>}
      style={{ maxWidth: 600, padding: 'var(--space-8)' }}
    >
      <UsageMeter
        items={[
          { label: 'Orders this month', used: 842, limit: 1000 },
          { label: 'Team seats', used: 5, limit: 5, note: 'Every seat is taken. Add seats to invite more people.' },
          { label: 'Label storage', used: 1.2, limit: 5, unit: 'GB' },
          { label: 'API requests' },
        ]}
      />
    </Card>
  );
}

export function SidebarFoot() {
  return (
    <div className="tray-stack" style={{ width: '15rem' }}>
      <p className="tray-demo-note">In the foot of the sidebar</p>
      <Card style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-panel)' }}>
        <UsageMeter
          size="sm"
          items={[{ label: 'Orders', ariaLabel: 'Orders this month', used: 842, limit: 1000 }]}
          action={<Button variant="link" href="#" style={{ minBlockSize: 0, fontSize: '.9375rem' }}>Upgrade the plan</Button>}
        />
      </Card>
    </div>
  );
}

export function NearTheLimit() {
  return (
    <Card title="Usage" description="Stall plan. Resets on 1 December." style={{ maxWidth: 600, padding: 'var(--space-8)' }}>
      <UsageMeter
        items={[
          { label: 'Orders this month', used: 47, limit: 50, note: '3 orders left. Upgrade to Shop for 1,000 a month.' },
          { label: 'People', used: 1, limit: 1, note: 'Only you can sign in on this plan.' },
        ]}
      />
    </Card>
  );
}
