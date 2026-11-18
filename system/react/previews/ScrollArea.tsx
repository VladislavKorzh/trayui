import { ScrollArea } from 'trayui-react';

const points: [string, string][] = [
  ['Farm shop', '2.4 km'],
  ['Market square', '5.1 km'],
  ['Station', '6.8 km'],
  ['Old town', '7.2 km'],
  ['Riverside', '9.0 km'],
  ['Airport', '14.5 km'],
];

const months = ['All months', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November'];

export function Vertical() {
  return (
    <div className="tray-card" style={{ padding: 'var(--space-5)', maxWidth: 428 }}>
      <ScrollArea label="Pickup points" maxHeight="13rem">
        <ul className="tray-items tray-items--ruled" role="list" style={{ borderBlockStart: 0 }}>
          {points.map(([name, km]) => (
            <li key={name} className="tray-item tray-item--sm">
              <span className="tray-item__body">
                <span className="tray-item__title">{name}</span>
              </span>
              <span className="tray-item__end tray-num">{km}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

export function Sideways() {
  return (
    <ScrollArea label="Filters" orientation="horizontal" style={{ maxWidth: 520 }}>
      <div className="tray-row tray-row--sm" style={{ flexWrap: 'nowrap', paddingBlockEnd: 'var(--space-3)' }}>
        {months.map((m) => (
          <span key={m} className="tray-chip">
            {m}
          </span>
        ))}
      </div>
    </ScrollArea>
  );
}
