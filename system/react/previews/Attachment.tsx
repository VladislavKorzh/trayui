import { Attachment, Message } from 'trayui-react';

export function States() {
  return (
    <div className="tray-attachments" style={{ maxWidth: 660 }}>
      <Attachment name="receipt-20418.pdf" meta="PDF, 84 KB" href="#" action="download" />
      <Attachment name="gate-photo.jpg" icon="image" progress={42} />
      <Attachment name="batch-autumn.xlsx" error="Too large. The limit is 10 MB." />
      <Attachment variant="image" name="bed-a-night.jpg" meta="JPEG, 1.2 MB" href="#" />
    </div>
  );
}

export function InAThread() {
  return (
    <div className="tray-thread">
      <Message author="Oksana" time="14:20" avatar="OF">
        Here is the receipt for order PL-20418.
        <div className="tray-attachments">
          <Attachment name="receipt-20418.pdf" meta="PDF, 84 KB" href="#" action="download" />
        </div>
      </Message>
      <Message variant="own">
        Thank you. The photo of the gate, so he finds it.
        <div className="tray-attachments">
          <Attachment name="gate-photo.jpg" icon="image" progress={78} />
        </div>
      </Message>
    </div>
  );
}

export function InAComposer() {
  return (
    <div className="tray-attachments" style={{ maxWidth: 660 }}>
      <Attachment name="delivery-note.pdf" meta="PDF, 12 KB" action="remove" />
      <Attachment name="pickup-points-map.png" icon="image" meta="PNG, 2.4 MB" action="remove" />
    </div>
  );
}
