import { Card, Progress } from 'trayui-react';

export function Bars() {
  return (
    <div className="tray-bento">
      <Progress className="tray-span-4" label="Uploading label.pdf" value={42} />
      <Progress className="tray-span-4" label="Autumn batch" aria-label="Autumn batch reserved" value={280} max={412} valueText="132 of 412 jars left" meter />
      <Progress className="tray-span-4" label="Checking the address" />
    </div>
  );
}

export function StepsAndAccent() {
  return (
    <div className="tray-bento" style={{ alignItems: 'center' }}>
      <Progress className="tray-span-6" steps={4} value={2} label="Delivery" aria-label="Checkout" />
      <Card tone="inverse" className="tray-span-6" style={{ padding: 'var(--space-6)' }}>
        <Progress tone="accent" label="Season so far" valueText="104 kg" value={80} meter />
      </Card>
    </div>
  );
}
