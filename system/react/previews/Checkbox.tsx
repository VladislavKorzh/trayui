import * as React from 'react';
import { Checkbox } from 'trayui-react';

export function States() {
  return (
    <div className="tray-row" style={{ alignItems: 'flex-start', columnGap: 48 }}>
      <div className="tray-stack" style={{ gap: 0 }}>
        <Checkbox label="Gift box" />
        <Checkbox label="Chilled delivery" defaultChecked />
        <Checkbox label="All extras" indeterminate />
        <Checkbox label="Farm sticker, always included" defaultChecked disabled />
      </div>
      <div className="tray-stack" style={{ gap: 0, maxWidth: 352 }}>
        <Checkbox label="Remind me before the season ends" description="One email in November, nothing else." defaultChecked />
        <Checkbox label="I agree to the terms of the order" error="Agree to the terms to place the order." />
      </div>
    </div>
  );
}

export function SelectAll() {
  const extras = ['Gift box', 'Chilled delivery', 'A spoon of mother of pearl'];
  const [on, setOn] = React.useState<string[]>(['Gift box']);
  const all = on.length === extras.length;
  return (
    <fieldset>
      <legend className="tray-label">Extras for order PL-20431</legend>
      <div className="tray-stack" style={{ gap: 0 }}>
        <Checkbox label="All extras" checked={all} indeterminate={on.length > 0 && !all} onCheckedChange={(c) => setOn(c ? extras : [])} />
        <div className="tray-stack" style={{ gap: 0, paddingInlineStart: 38 }}>
          {extras.map((x) => (
            <Checkbox key={x} label={x} checked={on.includes(x)} onCheckedChange={(c) => setOn(extras.filter((e) => (e === x ? c : on.includes(e))))} />
          ))}
        </div>
      </div>
    </fieldset>
  );
}
