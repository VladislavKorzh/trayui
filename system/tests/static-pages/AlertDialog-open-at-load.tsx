// A test page for static parity (tests/components/AlertDialog.py, STATIC_PAGES): an alert dialog open over the page as
// the page loads, where focus starts on the safe choice. No preview shows it, as it would hold the whole preview still.
import { AlertDialog, Button } from 'trayui-react';

export function OpenAtLoad() {
  return (
    <div>
      <p>Order PL-20418 has been packed.</p>
      <AlertDialog
        defaultOpen
        trigger={<Button variant="quiet" size="sm" icon="trash-2">Delete the order</Button>}
        title="Delete order PL-20418?"
        description="The order and its messages are removed for good. The customer is not told."
        cancelLabel="Keep the order"
        confirmLabel="Delete order"
      />
    </div>
  );
}
