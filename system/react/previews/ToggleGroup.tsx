import * as React from 'react';
import { Card, ToggleGroup } from 'trayui-react';

export function Variants() {
  return (
    <div className="tray-row" style={{ alignItems: 'flex-start' }}>
      <ToggleGroup
        aria-label="Jar size"
        defaultValue="50"
        items={[
          { value: '30', label: '30 g' },
          { value: '50', label: '50 g' },
          { value: '100', label: '100 g' },
        ]}
      />
      <ToggleGroup
        aria-label="View"
        size="sm"
        items={[
          { value: 'list', label: 'List', icon: 'list' },
          { value: 'grid', label: 'Grid', icon: 'layout-grid' },
        ]}
      />
      <ToggleGroup
        aria-label="Text style"
        size="sm"
        iconOnly
        multiple
        defaultValues={['bold', 'underline']}
        items={[
          { value: 'bold', label: 'Bold', icon: 'bold' },
          { value: 'italic', label: 'Italic', icon: 'italic' },
          { value: 'underline', label: 'Underline', icon: 'underline' },
        ]}
      />
    </div>
  );
}

export function FullWidth() {
  const sold: Record<string, string> = { day: '18 jars sold today', week: '126 jars sold this week', month: '412 jars sold this month' };
  const [period, setPeriod] = React.useState('week');
  return (
    <Card>
      <div className="tray-stack">
        <ToggleGroup
          aria-label="Period"
          fill
          value={period}
          onChange={setPeriod}
          items={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year', disabled: true },
          ]}
        />
        <p className="tray-soft">{sold[period]}</p>
      </div>
    </Card>
  );
}
