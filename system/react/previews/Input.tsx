import { Card, Field, Input } from 'trayui-react';

export function States() {
  return (
    <div className="tray-fields" style={{ maxWidth: 640 }}>
      <Field label="Email"><Input type="email" placeholder="you@example.com" /></Field>
      <Field label="Postcode" error="A postcode has five digits."><Input inputMode="numeric" defaultValue="0410" /></Field>
      <Field label="Order number"><Input readOnly defaultValue="PL-20431" /></Field>
      <Field label="Promo code"><Input disabled defaultValue="AUTUMN" /></Field>
    </div>
  );
}

export function OnACard() {
  return (
    <Card style={{ maxWidth: 520 }}>
      <div className="tray-stack">
        <Field label="Search a city" hideLabel><Input size="sm" type="search" placeholder="Search a city" /></Field>
        <Field label="Weight, kg"><Input inputMode="decimal" defaultValue="2.5" /></Field>
      </div>
    </Card>
  );
}
