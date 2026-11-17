import * as React from 'react';
import { Switch } from 'trayui-react';

export function Inline() {
  return (
    <div className="tray-stack tray-stack--sm" style={{ maxWidth: 420 }}>
      <Switch label="Email me the receipt" />
      <Switch label="Order updates by text" defaultChecked />
      <Switch label="Courier tracking, not in your area yet" disabled />
    </div>
  );
}

export function Rows() {
  return (
    <div className="tray-stack tray-stack--sm" style={{ maxWidth: 520 }}>
      <Switch layout="row" label="Gift box" description="A card box with a note, $12" defaultChecked />
      <Switch layout="row" label="Leave at the door" description="The courier sends a photo" />
    </div>
  );
}

export function AppliesAtOnce() {
  const [gift, setGift] = React.useState(false);
  return (
    <div className="tray-stack tray-stack--sm" style={{ maxWidth: 520 }}>
      <Switch layout="row" label="Gift box" description="A card box with a note, $12" checked={gift} onCheckedChange={setGift} />
      <p className="tray-soft">Order PL-20431: two jars of 50 g, ${118 + (gift ? 12 : 0)} in all.</p>
    </div>
  );
}
