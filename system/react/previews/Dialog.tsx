import * as React from 'react';
import { Button, Dialog, Field } from 'trayui-react';

const days = ['Tomorrow, 16 November', 'Tuesday, 17 November', 'Wednesday, 18 November'];

export function OverThePage() {
  return (
    <div className="tray-stack">
      <div>
        <Dialog
          size="sm"
          title="Leave a note"
          trigger={<Button variant="quiet" size="sm">Open it over the page</Button>}
          footer={<><Button variant="ghost" size="md" data-close>Cancel</Button><Button size="md" data-close>Save the note</Button></>}
        >
          <Field label="For the courier" controlId="dlg-note"><textarea className="tray-textarea" id="dlg-note" rows={3} /></Field>
        </Dialog>
      </div>
      <div className="tray-stage tray-stage--scrim">
        <Dialog
          modal={false}
          defaultOpen
          title="Change the delivery day"
          description="Order PL-20418 is not packed yet, so the day can still move."
          footer={<><Button variant="ghost" size="md" data-close>Cancel</Button><Button size="md" data-close>Save the day</Button></>}
        >
          <Field label="New day" controlId="dlg-day">
            <span className="tray-select"><select id="dlg-day">{days.map((d) => <option key={d}>{d}</option>)}</select></span>
          </Field>
        </Dialog>
      </div>
    </div>
  );
}

export function Small() {
  return (
    <div className="tray-stage tray-stage--scrim">
      <Dialog
        modal={false}
        defaultOpen
        size="sm"
        title="Leave a note"
        footer={<><Button variant="ghost" size="md" data-close>Cancel</Button><Button size="md" data-close>Save the note</Button></>}
      >
        <Field label="For the courier" controlId="dlg-note-sm">
          <textarea className="tray-textarea" id="dlg-note-sm" rows={3} defaultValue="Ring twice, the bell is quiet." />
        </Field>
      </Dialog>
    </div>
  );
}

export function Controlled() {
  const [open, setOpen] = React.useState(true);
  const [day, setDay] = React.useState(days[0]);
  const [draft, setDraft] = React.useState(days[1]);
  return (
    <div className="tray-stack">
      <div className="tray-row tray-row--between">
        <p>Order PL-20431 arrives <b>{day}</b>.</p>
        <Button variant="quiet" size="sm" disabled={open} onClick={() => setOpen(true)}>Change the day</Button>
      </div>
      <div className="tray-stage tray-stage--scrim">
        <Dialog
          modal={false}
          open={open}
          onOpenChange={setOpen}
          title="Change the delivery day"
          footer={<><Button variant="ghost" size="md" data-close>Cancel</Button><Button size="md" data-close onClick={() => setDay(draft)}>Save the day</Button></>}
        >
          <Field label="New day" controlId="dlg-day-c">
            <span className="tray-select">
              <select id="dlg-day-c" value={draft} onChange={(e) => setDraft(e.target.value)}>{days.map((d) => <option key={d}>{d}</option>)}</select>
            </span>
          </Field>
        </Dialog>
      </div>
    </div>
  );
}
