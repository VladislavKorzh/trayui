import * as React from 'react';
import { Button, Collapsible } from 'trayui-react';

export function OpenAndClosed() {
  return (
    <div className="tray-stack" style={{ maxWidth: '26rem' }}>
      <Collapsible summary="Show the figures" defaultOpen>
        <table className="tray-table tray-table--compact">
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col" data-num="">Collected</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">April</th>
              <td data-num="">14 kg</td>
            </tr>
            <tr>
              <th scope="row">May</th>
              <td data-num="">22 kg</td>
            </tr>
            <tr>
              <th scope="row">June</th>
              <td data-num="">19 kg</td>
            </tr>
          </tbody>
        </table>
      </Collapsible>
      <Collapsible summary="3 more recipients">
        <p className="tray-soft">Anna Melnyk, Bohdan Shevchuk, Oksana Franko</p>
      </Collapsible>
    </div>
  );
}

export function Controlled() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="tray-stack" style={{ maxWidth: '26rem' }}>
      <div className="tray-row tray-row--between">
        <p>PL-20431 was not delivered.</p>
        <Button variant="quiet" size="xs" disabled={open} onClick={() => setOpen(true)}>
          See why
        </Button>
      </div>
      <Collapsible summary="Delivery log" open={open} onOpenChange={setOpen}>
        <p className="tray-soft">14:05 called, no answer. 14:20 left a note at the door. 16:40 back at the farm shop.</p>
      </Collapsible>
    </div>
  );
}
