import { Card, Field, InputGroup, Kbd } from 'trayui-react';

export function AddOns() {
  return (
    <div className="tray-bento" style={{ alignItems: 'start' }}>
      <InputGroup className="tray-span-4" icon="search" type="search" placeholder="Search orders" aria-label="Search orders" suffix={<Kbd>/</Kbd>} />
      <InputGroup className="tray-span-4" prefix="https://" defaultValue="perly.example/notes" aria-label="Page address" action={{ label: 'Copy the address', icon: 'copy' }} />
      <InputGroup className="tray-span-4" inputMode="decimal" defaultValue="2.5" aria-label="Weight" suffix="kg" />
      <InputGroup className="tray-span-4" icon="lock" reveal defaultValue="example-password" aria-label="Password" />
      <InputGroup className="tray-span-4" placeholder="Promo code" aria-label="Promo code" action={{ label: 'Apply', accent: true }} />
      <InputGroup className="tray-span-4" size="sm" icon="filter" placeholder="Filter" aria-label="Filter" />
    </div>
  );
}

export function InAForm() {
  return (
    <Card style={{ maxWidth: 560 }}>
      <div className="tray-stack">
        <Field label="Password" hint="At least ten characters.">
          <InputGroup icon="lock" reveal autoComplete="new-password" defaultValue="clover-beds-27" />
        </Field>
        <Field label="Promo code" error="AUTUMN ended on 31 October. Try another code.">
          <InputGroup defaultValue="AUTUMN" action={{ label: 'Apply', accent: true }} />
        </Field>
      </div>
    </Card>
  );
}
