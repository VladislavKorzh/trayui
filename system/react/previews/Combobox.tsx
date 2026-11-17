import * as React from 'react';
import { Combobox, Field } from 'trayui-react';

const cities = [
  { value: 'dnipro', label: 'Dnipro' },
  { value: 'kharkiv', label: 'Kharkiv' },
  { value: 'kyiv', label: 'Kyiv' },
  { value: 'lviv', label: 'Lviv' },
  { value: 'odesa', label: 'Odesa' },
  { value: 'ternopil', label: 'Ternopil' },
  { value: 'uzhhorod', label: 'Uzhhorod' },
];

const people = [
  { value: 'anna', label: 'Anna Melnyk', description: 'Packing' },
  { value: 'bohdan', label: 'Bohdan Shevchuk', description: 'Courier' },
  { value: 'iryna', label: 'Iryna Koval', description: 'Customer care' },
  { value: 'oksana', label: 'Oksana Franko', description: 'Farm manager' },
  { value: 'petro', label: 'Petro Hnatiuk', description: 'Snail beds' },
];

export function Typing() {
  return (
    <div className="tray-stage tray-stage--page tray-stage--start" style={{ minHeight: 380 }}>
      <div className="tray-fields" style={{ width: '100%' }}>
        <Field label="City">
          <Combobox placeholder="Find a city" options={cities} emptyText="No city by that name. Check the spelling." />
        </Field>
        <Field label="Assign to">
          <Combobox icon="user" options={people} defaultQuery="an" defaultOpen emptyText="Nobody by that name." />
        </Field>
      </div>
    </div>
  );
}

export function NothingMatches() {
  return (
    <div className="tray-stage tray-stage--page tray-stage--start" style={{ minHeight: 220 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Field label="City">
          <Combobox options={cities} defaultQuery="Lvov" defaultOpen emptyText="No city by that name. Check the spelling." />
        </Field>
      </div>
    </div>
  );
}

export function Controlled() {
  const [city, setCity] = React.useState('lviv');
  const name = cities.find((c) => c.value === city)?.label;
  return (
    <div className="tray-fields" style={{ maxWidth: 640 }}>
      <Field label="Delivery city" hint={name ? `The courier leaves for ${name} at 9:00.` : 'Pick the city first.'}>
        <Combobox icon="map-pin" options={cities} value={city} onChange={setCity} />
      </Field>
      <Field label="City" error="We do not deliver there yet. Pick the farm shop instead.">
        <Combobox options={cities} defaultValue="uzhhorod" />
      </Field>
    </div>
  );
}
