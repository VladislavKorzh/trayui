import * as React from 'react';
import { Card, RadioGroup } from 'trayui-react';

export function Plain() {
  return (
    <div className="tray-row" style={{ alignItems: 'flex-start', columnGap: 64 }}>
      <RadioGroup
        label="Payment"
        defaultValue="delivery"
        options={[
          { value: 'delivery', label: 'Card, on delivery' },
          { value: 'online', label: 'Card, online now' },
          { value: 'cash', label: 'Cash, not for chilled orders', disabled: true },
        ]}
      />
      <RadioGroup
        label="Jar size"
        layout="row"
        defaultValue="50"
        options={[
          { value: '30', label: '30 g' },
          { value: '50', label: '50 g' },
          { value: '100', label: '100 g' },
        ]}
      />
    </div>
  );
}

export function Choices() {
  const fees: Record<string, number> = { courier: 9, pickup: 0 };
  const [delivery, setDelivery] = React.useState('courier');
  return (
    <div className="tray-stack" style={{ maxWidth: 640 }}>
      <RadioGroup
        label="Delivery"
        variant="choice"
        layout="row"
        value={delivery}
        onChange={setDelivery}
        options={[
          { value: 'courier', label: 'Courier', description: 'Chilled box, the same day', end: '$9' },
          { value: 'pickup', label: 'Pickup', description: 'Farm shop, from tomorrow', end: 'Free' },
        ]}
      />
      <p className="tray-soft">Order PL-20431 comes to ${59 + fees[delivery]} with delivery.</p>
    </div>
  );
}

export function OnACard() {
  return (
    <Card>
      <RadioGroup
        aria-label="Gift wrapping"
        variant="choice"
        layout="row"
        defaultValue="none"
        options={[
          { value: 'none', label: 'No wrapping', description: 'The jar in its chilled sleeve' },
          { value: 'box', label: 'Gift box', description: 'A card box with a note from you', end: '$12' },
        ]}
      />
    </Card>
  );
}
