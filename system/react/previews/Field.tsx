import { Field, Input } from 'trayui-react';

export function Basic() {
  return (
    <div className="tray-fields" style={{ maxWidth: 640 }}>
      <Field label="Name"><Input defaultValue="Dana Kovalenko" autoComplete="name" /></Field>
      <Field label="Phone" error="Enter the phone number with its area code."><Input type="tel" defaultValue="555" /></Field>
      <Field label="Address" hint="The courier calls ten minutes before arriving." full><Input placeholder="Street, house, apartment" /></Field>
      <Field label="Gift note" optional full><Input placeholder="A few words for the card" /></Field>
    </div>
  );
}

export function Row() {
  return (
    <div className="tray-stack" style={{ maxWidth: 640 }}>
      <Field label="Display name" layout="row" hint="Shown on your orders and reviews."><Input defaultValue="Dana" /></Field>
      <Field label="Shop address" layout="row" disabled><Input defaultValue="perly.counter.example" /></Field>
    </div>
  );
}
