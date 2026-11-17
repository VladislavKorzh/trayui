import * as React from 'react';
import { Button, Card, Field, Slider } from 'trayui-react';

export function Fields() {
  return (
    <div className="tray-bento" style={{ alignItems: 'start' }}>
      <Slider className="tray-span-4" label="Jars per month" min={1} max={12} defaultValue={4} scale />
      <Slider className="tray-span-4" label="Delivery radius" min={0} max={50} step={10} defaultValue={30} unit=" km" scale={[0, 10, 20, 30, 40, 50]} />
      <Card className="tray-span-4" style={{ padding: 'var(--space-6)' }}>
        <Slider label="Salt, on a tray" defaultValue={65} unit="%" />
      </Card>
      <Slider className="tray-span-4" label="Locked" defaultValue={20} disabled />
    </div>
  );
}

export function Controlled() {
  const [jars, setJars] = React.useState(4);
  return (
    <Card style={{ maxWidth: 520 }}>
      <div className="tray-stack">
        <Slider label="Jars per month" min={1} max={12} value={jars} onValueChange={setJars} scale />
        <div className="tray-row tray-row--between">
          <p className="tray-soft">
            {jars} jars of 50 g, ${jars * 59} a month
          </p>
          <Button size="sm" variant="quiet" onClick={() => setJars(4)}>
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function InAField() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Field label="Delivery radius" hint="The courier drives this far from the farm.">
        <Slider min={0} max={50} step={10} defaultValue={20} unit=" km" scale />
      </Field>
    </div>
  );
}
