import { Alert, Button, Card } from 'trayui-react';

export function Tones() {
  return (
    <div className="tray-stack">
      <Alert title="The farm shop is closed on Mondays">Pickup orders placed today are ready from Tuesday at ten.</Alert>
      <Alert
        tone="danger"
        title="The card was declined"
        actions={
          <>
            <Button variant="dark" size="xs">Try another card</Button>
            <Button variant="ghost" size="xs">Pay on delivery</Button>
          </>
        }
      >
        Nothing was charged. Try another card, or pay on delivery.
      </Alert>
      <Alert tone="success" title="Order PL-20418 is paid">The receipt is on its way to dana@example.com.</Alert>
      <Alert tone="accent" icon="clock" title="132 jars of the autumn batch are left" end={<Button variant="dark" size="sm">Order a jar</Button>}>
        The next batch is packed in March.
      </Alert>
    </div>
  );
}

export function OnACard() {
  return (
    <Card title="Delivery" description="Kyiv, Khreshchatyk 22, apartment 5." style={{ maxWidth: 560 }}>
      <Alert icon="truck" title="The courier calls ten minutes before arriving">Keep the phone close between 10:00 and 14:00.</Alert>
    </Card>
  );
}
