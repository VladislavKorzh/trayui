import * as React from 'react';
import { Field, Select } from 'trayui-react';

const jars = [
  { value: '30', label: '30 g' },
  { value: '50', label: '50 g' },
  { value: '100', label: '100 g' },
];

const delivery = [
  {
    label: 'To your door',
    options: [
      { value: 'courier', label: 'Courier, chilled box' },
      { value: 'express', label: 'Express, two hours' },
    ],
  },
  {
    label: 'Collect it yourself',
    options: [
      { value: 'shop', label: 'Farm shop' },
      { value: 'locker', label: 'Parcel locker', disabled: true },
    ],
  },
];

export function InAForm() {
  return (
    <div className="tray-stage tray-stage--page tray-stage--start" style={{ minHeight: 410 }}>
      <div className="tray-fields" style={{ width: '100%' }}>
        <Field label="Jar size">
          <Select name="jar" placeholder="Choose a jar" options={jars} />
        </Field>
        <Field label="Delivery">
          <Select name="delivery" options={delivery} defaultValue="courier" defaultOpen />
        </Field>
      </div>
    </div>
  );
}

export function TwoLines() {
  return (
    <div className="tray-stage tray-stage--page tray-stage--start" style={{ minHeight: 360 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Field label="Packer">
          <Select
            defaultOpen
            defaultValue="anna"
            options={[
              { value: 'anna', label: 'Anna Melnyk', description: 'Packing, mornings' },
              { value: 'bohdan', label: 'Bohdan Shevchuk', description: 'Courier, Kyiv routes' },
              { value: 'oksana', label: 'Oksana Franko', description: 'Farm manager' },
            ]}
          />
        </Field>
      </div>
    </div>
  );
}

export function States() {
  return (
    <div className="tray-fields" style={{ maxWidth: 640 }}>
      <Field label="Jar size" error="Choose a jar size to see the price.">
        <Select placeholder="Choose a jar" options={jars} />
      </Field>
      <Field label="Gift box" disabled>
        <Select options={[{ value: 'none', label: 'No gift box' }]} defaultValue="none" />
      </Field>
      <Field label="Rows per page" layout="row" full>
        <Select size="sm" options={[{ value: '25', label: '25 rows' }, { value: '50', label: '50 rows' }, { value: '100', label: '100 rows' }]} defaultValue="25" />
      </Field>
    </div>
  );
}

export function Controlled() {
  const [jar, setJar] = React.useState('50');
  const price: Record<string, string> = { '30': '$39', '50': '$59', '100': '$109' };
  return (
    <div className="tray-row" style={{ maxWidth: 640, alignItems: 'flex-end' }}>
      <div style={{ flex: '1 1 14rem' }}>
        <Field label="Jar size">
          <Select options={jars} value={jar} onChange={setJar} />
        </Field>
      </div>
      <p className="subtitle" style={{ paddingBlockEnd: 14 }}>{price[jar]}</p>
    </div>
  );
}
