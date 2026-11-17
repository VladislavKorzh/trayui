import { Button, Separator } from 'trayui-react';

export function Horizontal() {
  return (
    <div className="tray-stack" style={{ maxWidth: 520 }}>
      <p>Two jars of 50 g</p>
      <Separator />
      <p>Courier, chilled box</p>
    </div>
  );
}

export function WithLabel() {
  return (
    <div className="tray-stack" style={{ maxWidth: 420 }}>
      <Button variant="quiet" size="md" icon="key" block>Continue with a passkey</Button>
      <Separator label="or" />
      <Button size="md" block>Sign in with email</Button>
    </div>
  );
}

export function Vertical() {
  return (
    <div className="tray-row">
      <span>12 orders</span>
      <Separator orientation="vertical" />
      <span>$2,470 today</span>
      <Separator orientation="vertical" />
      <span>Courier at 14:00</span>
    </div>
  );
}
