import * as React from 'react';
import { DatePicker, Field } from 'trayui-react';

export function ReportPeriod() {
  return (
    // The open panel is about 510px tall: the cell keeps room for it under the field.
    <div style={{ width: '19rem', minHeight: 610 }}>
      <Field label="Report period">
        <DatePicker
          mode="range"
          name="period"
          today="2026-11-15"
          month="2026-10"
          max="2026-11-15"
          defaultValue="2026-10-26/2026-11-08"
          presets={[
            { label: 'Last 7 days', days: 7 },
            { label: 'Last 30 days', days: 30 },
            { label: 'Last 90 days', days: 90 },
          ]}
          apply
          defaultOpen
        />
      </Field>
    </div>
  );
}

export function DeliveryDay() {
  return (
    <div style={{ width: '17rem', minHeight: 500 }}>
      <Field label="Delivery day">
        <DatePicker name="day" today="2026-11-15" min="2026-11-15" defaultOpen />
      </Field>
    </div>
  );
}

export function InAForm() {
  return (
    <div className="tray-fields" style={{ maxWidth: 640 }}>
      <Field label="Delivery day" hint="The courier calls ten minutes before arriving.">
        <DatePicker today="2026-11-15" min="2026-11-15" defaultValue="2026-11-19" />
      </Field>
      <Field label="Collection day" error="The farm shop is closed on Sundays. Pick another day.">
        <DatePicker today="2026-11-15" min="2026-11-15" defaultValue="2026-11-22" />
      </Field>
      <Field label="Packed on" disabled>
        <DatePicker defaultValue="2026-11-02" />
      </Field>
      <Field label="Period" layout="row" full>
        <DatePicker mode="range" size="sm" today="2026-11-15" max="2026-11-15" defaultValue="2026-11-09/2026-11-15" />
      </Field>
    </div>
  );
}

export function Controlled() {
  const [period, setPeriod] = React.useState('2026-11-01/2026-11-15');
  const [start, end] = period.split('/');
  const days = start && end ? Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1 : 0;
  return (
    <div className="tray-row" style={{ maxWidth: 640, alignItems: 'flex-end' }}>
      <div style={{ flex: '1 1 18rem' }}>
        <Field label="Report period">
          <DatePicker mode="range" today="2026-11-15" max="2026-11-15" value={period} onChange={(v) => setPeriod(v)} />
        </Field>
      </div>
      <p className="tray-soft" style={{ paddingBlockEnd: 16 }}>
        {days ? `${days} days of orders` : 'Pick the last day'}
      </p>
    </div>
  );
}
