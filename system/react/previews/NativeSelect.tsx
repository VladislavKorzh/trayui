import * as React from 'react';
import { Field, NativeSelect } from 'trayui-react';

export function States() {
  return (
    <div className="tray-bento" style={{ alignItems: 'start' }}>
      <Field className="tray-span-4" label="Delivery window">
        <NativeSelect options={['10:00 to 14:00', '14:00 to 18:00', '18:00 to 22:00']} defaultValue="14:00 to 18:00" />
      </Field>
      <Field className="tray-span-4" label="Pickup point" error="Choose where to collect the order.">
        <NativeSelect
          placeholder="Choose a point"
          options={[
            { label: 'City', options: ['Market square', 'Station'] },
            { label: 'Farm', options: ['Farm shop'] },
          ]}
        />
      </Field>
      <Field className="tray-span-4" label="Rows per page">
        <NativeSelect size="sm" options={['10', '25', '50']} />
      </Field>
    </div>
  );
}

export function Controlled() {
  const prices: Record<string, number> = { '30': 35, '50': 59, '100': 110 };
  const [size, setSize] = React.useState('50');
  return (
    <div style={{ maxWidth: 360 }}>
      <Field label="Jar size" hint={`$${prices[size]} a jar, chilled delivery included.`}>
        <NativeSelect
          value={size}
          onChange={(e) => setSize(e.target.value)}
          options={[
            { value: '30', label: '30 g' },
            { value: '50', label: '50 g' },
            { value: '100', label: '100 g' },
          ]}
        />
      </Field>
    </div>
  );
}
