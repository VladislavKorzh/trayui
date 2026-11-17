import { AlertDialog, Button } from 'trayui-react';

export function Delete() {
  return (
    <div className="tray-stage tray-stage--scrim">
      <AlertDialog
        modal={false}
        defaultOpen
        title="Delete order PL-20418?"
        description="The order and its messages are removed for good. The customer is not told."
        cancelLabel="Keep the order"
        confirmLabel="Delete order"
      />
    </div>
  );
}

export function NothingDestroyed() {
  return (
    <div className="tray-stack">
      <div>
        <AlertDialog
          trigger={<Button variant="quiet" size="sm" icon="send">Send the receipts</Button>}
          title="Send 214 receipts?"
          description="Every customer of the autumn batch gets an email now. It cannot be called back."
          cancelLabel="Not now"
          confirmLabel="Send 214 receipts"
          confirmVariant="dark"
        />
      </div>
      <div className="tray-stage tray-stage--scrim">
        <AlertDialog
          modal={false}
          defaultOpen
          title="Send 214 receipts?"
          description="Every customer of the autumn batch gets an email now. It cannot be called back."
          cancelLabel="Not now"
          confirmLabel="Send 214 receipts"
          confirmVariant="dark"
        />
      </div>
    </div>
  );
}
