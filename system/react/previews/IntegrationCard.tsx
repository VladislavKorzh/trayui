import * as React from 'react';
import { IntegrationCard } from 'trayui-react';

export function Grid() {
  return (
    <div className="tray-integrations">
      <IntegrationCard icon="truck" title="Courier tracking" description="Shows where each box is and tells the customer." defaultChecked status="On since 2 November" link={{ label: 'Settings', href: '#' }} />
      <IntegrationCard icon="receipt-text" title="Accounting export" description="Sends each paid order to your books at the end of the day." defaultChecked status="On since 14 October" link={{ label: 'Settings', href: '#' }} />
      <IntegrationCard icon="message-square" title="Chat alerts" description="Posts new orders to a channel your team already reads." action="Connect" status="Not connected" />
      <IntegrationCard icon="mail" title="Email receipts" description="Sends the customer a receipt from your own address." action="Fix" error="The address needs to be confirmed again" />
      <IntegrationCard icon="code" title="Webhooks" description="Calls your own server when an order changes." action="Upgrade" status="On the Market plan" link={{ label: 'Compare plans', href: '#' }} />
      <IntegrationCard icon="layout-grid" title="Spreadsheet sync" description="Keeps a sheet of orders up to date every hour." action="Connect" status="Not connected" />
    </div>
  );
}

export function ConnectThenSwitch() {
  const [connected, setConnected] = React.useState(false);
  const [on, setOn] = React.useState(true);
  return (
    <div className="tray-integrations" style={{ maxWidth: 600 }}>
      <IntegrationCard
        icon="message-square"
        title="Chat alerts"
        description="Posts new orders to a channel your team already reads."
        action={connected ? undefined : 'Connect'}
        onAction={() => setConnected(true)}
        checked={on}
        onCheckedChange={setOn}
        status={!connected ? 'Not connected' : on ? 'On since today' : 'Paused'}
        link={connected ? { label: 'Settings', href: '#' } : undefined}
      />
      <IntegrationCard
        icon="truck"
        title="Courier tracking"
        description="Shows where each box is and tells the customer."
        defaultChecked
        status="On since 2 November"
        link={{ label: 'Settings', href: '#' }}
      />
    </div>
  );
}
