// A test page for static parity (tests/components/Dialog.py, STATIC_PAGES): a dialog open over the page as the page
// loads, which no preview shows, as it would hold the whole preview still. Not a usage example.
import { Button, Dialog, Field } from 'trayui-react';

export function OpenAtLoad() {
  return (
    <div>
      <p>Order PL-20431 arrives tomorrow.</p>
      <Dialog
        defaultOpen
        size="sm"
        title="Leave a note"
        trigger={<Button variant="quiet" size="sm">Leave a note</Button>}
        footer={<><Button variant="ghost" size="md" data-close>Cancel</Button><Button size="md" data-close>Save the note</Button></>}
      >
        <Field label="For the courier" controlId="dlg-load-note"><textarea className="tray-textarea" id="dlg-load-note" rows={3} /></Field>
      </Dialog>
    </div>
  );
}
