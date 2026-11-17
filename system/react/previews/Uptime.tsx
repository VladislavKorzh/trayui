import { Item, Uptime } from 'trayui-react';

export function StatusPage() {
  return (
    <div className="tray-stack" style={{ gap: 'var(--space-8)' }}>
      <Uptime name="Order API" share="99.94% up" incidents={{ 12: 'degraded', 47: 'down', 48: 'degraded' }} />
      <Uptime name="Courier tracking" state="slow" stateText="Slow since 09:40" share="99.71% up" incidents={{ 0: 'degraded', 31: 'degraded' }} legend />
      <ul className="tray-items tray-items--ruled">
        <Item size="sm" title="Order API was down for 18 minutes" text="29 September, 03:10 to 03:28. A database update ran long." />
        <Item size="sm" title="Courier tracking was slow for 2 hours" text="15 October. The courier's own service answered late." />
      </ul>
    </div>
  );
}

export function DownAndShort() {
  return (
    <div className="tray-stack" style={{ gap: 'var(--space-8)', maxWidth: 560 }}>
      <Uptime name="Label printing" state="down" stateText="Down since 14:05" days={30} share="99.12% up" incidents={{ 0: 'down', 9: 'degraded' }} />
      <Uptime name="Storefront" days={30} from="30 days ago" share="100% up" legend />
    </div>
  );
}
