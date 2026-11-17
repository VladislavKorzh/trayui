import { Icon, type IconName } from 'trayui-react';

const set: IconName[] = ['search', 'shopping-bag', 'truck', 'calendar', 'clock', 'bell', 'user', 'users', 'settings', 'credit-card', 'receipt-text', 'package', 'chart-column', 'trending-up', 'shield-check', 'key'];

export function TheSet() {
  return (
    <div className="tray-row" style={{ gap: 24 }}>
      {set.map((n) => (
        <span key={n} className="tray-stack tray-stack--sm" style={{ justifyItems: 'center', width: 72 }}>
          <Icon name={n} size="lg" />
          <span className="caption tray-muted">{n}</span>
        </span>
      ))}
    </div>
  );
}

export function Sizes() {
  return (
    <div className="tray-row" style={{ gap: 24 }}>
      <Icon name="sparkle" size="sm" label="Small" />
      <Icon name="sparkle" label="Medium" />
      <Icon name="sparkle" size="lg" label="Large" />
    </div>
  );
}

export function InText() {
  return (
    <div className="tray-stack">
      <p className="tray-row tray-row--sm"><Icon name="circle-check" className="tray-success" />Paid on 1 November</p>
      <p className="tray-row tray-row--sm"><Icon name="circle-alert" className="tray-danger" />The address needs a house number</p>
      <p className="tray-row tray-row--sm">Next step<Icon name="arrow-right" flip /></p>
    </div>
  );
}
