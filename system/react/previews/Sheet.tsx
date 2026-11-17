import { Badge, Button, Separator, Sheet } from 'trayui-react';

function Check({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <label className="tray-check">
      <input type="checkbox" defaultChecked={checked} />
      <span className="tray-check__box">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path className="tray-check__tick" d="M4 10.5l4 4 8-9" /><path className="tray-check__dash" d="M5 10h10" /></svg>
      </span>
      <span>{label}</span>
    </label>
  );
}

export function Filters() {
  return (
    <div className="tray-stage tray-stage--scrim" style={{ minBlockSize: '34rem' }}>
      <Sheet
        modal={false}
        defaultOpen
        title="Filters"
        footer={<><Button variant="ghost" size="md">Clear</Button><Button variant="dark" size="md" data-close>Show 8 orders</Button></>}
      >
        <fieldset>
          <legend className="tray-label">Status</legend>
          <div className="tray-stack" style={{ gap: 0 }}>
            <Check label="Paid" checked />
            <Check label="Pay on delivery" checked />
            <Check label="Payment failed" />
          </div>
        </fieldset>
        <div className="tray-field">
          <span className="tray-label" id="sh-placed">Placed</span>
          <div className="tray-seg tray-seg--sm tray-seg--fill" role="radiogroup" aria-labelledby="sh-placed">
            <label className="tray-seg__item"><input type="radio" name="sh-placed" /><span>Today</span></label>
            <label className="tray-seg__item"><input type="radio" name="sh-placed" defaultChecked /><span>Week</span></label>
            <label className="tray-seg__item"><input type="radio" name="sh-placed" /><span>Month</span></label>
          </div>
        </div>
        <label className="tray-switch tray-switch--row">
          <span className="tray-switch__text"><b>Gift boxes only</b></span>
          <input type="checkbox" role="switch" />
          <span className="tray-switch__track" />
        </label>
      </Sheet>
    </div>
  );
}

const order = (
  <>
    <div className="tray-row tray-row--between"><span>3 jars of 50 g</span><b>$177</b></div>
    <div className="tray-row tray-row--between"><span>Gift box</span><b>$12</b></div>
    <Separator />
    <div className="tray-row tray-row--between"><b>Total</b><b>$189</b></div>
    <div className="tray-row tray-row--sm"><Badge tone="success" icon="circle-check">Paid</Badge><Badge>Courier, Kyiv</Badge></div>
  </>
);

export function RowDetails() {
  return (
    <div className="tray-stack">
      <div>
        <Sheet
          trigger={<Button variant="quiet" size="sm">Open order PL-20431</Button>}
          title="Order PL-20431"
          description="Placed by Dana Kovalenko on 14 November."
          footer={<><Button variant="ghost" size="md" icon="receipt-text">Receipt</Button><Button variant="dark" size="md" data-close>Mark as packed</Button></>}
        >
          {order}
        </Sheet>
      </div>
      <div className="tray-stage tray-stage--scrim" style={{ minBlockSize: '30rem' }}>
        <Sheet
          modal={false}
          defaultOpen
          title="Order PL-20431"
          description="Placed by Dana Kovalenko on 14 November."
          footer={<><Button variant="ghost" size="md" icon="receipt-text">Receipt</Button><Button variant="dark" size="md" data-close>Mark as packed</Button></>}
        >
          {order}
        </Sheet>
      </div>
    </div>
  );
}
