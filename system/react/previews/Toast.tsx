import * as React from 'react';
import { Button, Toast, toast } from 'trayui-react';

export function Tones() {
  return (
    <div className="tray-stack">
      <div className="tray-row tray-row--sm">
        <Button variant="quiet" size="sm" onClick={() => toast({ title: 'Order archived', action: { label: 'Undo', onClick: () => toast({ title: 'Order restored' }) } })}>Archive an order</Button>
        <Button variant="quiet" size="sm" onClick={() => toast({ tone: 'success', title: 'Receipt sent', text: 'To dana@example.com' })}>Send a receipt</Button>
        <Button variant="quiet" size="sm" onClick={() => toast({ tone: 'danger', title: 'The export failed', text: 'Check the connection and try again.' })}>Fail an export</Button>
      </div>
      <div className="tray-stage" style={{ minBlockSize: 0, placeItems: 'stretch' }}>
        <div className="tray-stack tray-stack--sm" style={{ maxInlineSize: '24rem', marginInlineStart: 'auto' }}>
          <Toast title="Order archived" action={{ label: 'Undo' }} />
          <Toast tone="success" title="Receipt sent" text="To dana@example.com" />
          <Toast tone="danger" title="The export failed" text="Check the connection and try again." action={{ label: 'Retry' }} />
        </div>
      </div>
    </div>
  );
}

export function ManagedHere() {
  const initial = ['PL-20431', 'PL-20432'];
  const [archived, setArchived] = React.useState(initial);
  return (
    <div className="tray-stage" style={{ minBlockSize: 0, placeItems: 'stretch' }}>
      <div className="tray-stack tray-stack--sm" style={{ inlineSize: '24rem', maxInlineSize: '100%', marginInlineStart: 'auto' }}>
        {archived.map((id) => (
          <Toast
            key={id}
            title={`Order ${id} archived`}
            action={{ label: 'Undo', onClick: () => setArchived((all) => all.filter((x) => x !== id)) }}
            onDismiss={() => setArchived((all) => all.filter((x) => x !== id))}
          />
        ))}
        {archived.length === 0 ? <Button variant="quiet" size="sm" onClick={() => setArchived(initial)}>Show them again</Button> : null}
      </div>
    </div>
  );
}
