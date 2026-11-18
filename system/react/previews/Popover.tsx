import * as React from 'react';
import { Button, Icon, Input, Popover } from 'trayui-react';

export function Share() {
  return (
    <div className="tray-row" style={{ alignItems: 'flex-start', minBlockSize: 280 }}>
      <Popover
        defaultOpen
        trigger={<Button variant="quiet" size="sm" icon="share">Share</Button>}
        title="Share this note"
        description="Anyone with the link can read it."
      >
        <div className="tray-input-group tray-input-group--sm">
          <Input defaultValue="perly.example/notes/may-peak" aria-label="Link" readOnly />
          <button className="tray-input-group__btn" type="button" aria-label="Copy the link"><Icon name="copy" /></button>
        </div>
        <label className="tray-switch">
          <input type="checkbox" role="switch" defaultChecked />
          <span className="tray-switch__track" />
          <span>Show the figures table</span>
        </label>
      </Popover>
      <Popover
        style={{ marginInlineStart: 'auto' }}
        align="end"
        trigger={<Button variant="ghost" size="sm" icon="circle-help" aria-label="What is a batch?" />}
        title="Batch"
        description="Everything packed from one collection. The autumn batch was 412 jars."
      />
    </div>
  );
}

export function Explain() {
  return (
    <div style={{ minBlockSize: 200, maxWidth: 640 }}>
      <div className="tray-row tray-row--between">
        <p className="subtitle">Autumn batch</p>
        <Popover
          defaultOpen
          align="end"
          trigger={<Button variant="ghost" size="sm" icon="circle-help" aria-label="What is a batch?" />}
          title="Batch"
          description="Everything packed from one collection. The autumn batch was 412 jars."
        />
      </div>
    </div>
  );
}

export function Controlled() {
  const [open, setOpen] = React.useState(true);
  const [slot, setSlot] = React.useState('Morning, 9 to 12');
  const slots = ['Morning, 9 to 12', 'Afternoon, 12 to 16', 'Evening, 16 to 20'];
  return (
    <div style={{ minBlockSize: 360 }}>
      <div className="tray-row">
        <Popover
          open={open}
          onOpenChange={setOpen}
          trigger={<Button variant="quiet" size="sm" icon="clock">{slot}</Button>}
          title="Delivery window"
          description="The courier calls ten minutes before arriving."
        >
          <div className="tray-stack tray-stack--sm">
            {slots.map((s) => (
              <Button key={s} variant={s === slot ? 'dark' : 'quiet'} size="sm" block data-close onClick={() => setSlot(s)}>{s}</Button>
            ))}
          </div>
        </Popover>
        <p className="tray-soft">The panel is {open ? 'open' : 'closed'}.</p>
      </div>
    </div>
  );
}
