import * as React from 'react';
import { Resizable } from 'trayui-react';

export function ListAndDetail() {
  return (
    <Resizable
      defaultSize={34}
      min={22}
      max={60}
      handleLabel="Resize the order list"
      style={{ minBlockSize: '14rem' }}
      start={
        <>
          <p className="label tray-soft">Orders</p>
          <ul className="tray-list-plain" style={{ listStyle: 'none', padding: 0, marginBlockStart: 'var(--space-3)' }}>
            <li className="nav">PL-20418</li>
            <li className="nav tray-muted">PL-20417</li>
            <li className="nav tray-muted">PL-20416</li>
          </ul>
        </>
      }
      end={
        <>
          <p className="subtitle">Order PL-20418</p>
          <p className="tray-soft" style={{ marginBlockStart: 'var(--space-2)' }}>
            Two jars of 50 g, out for delivery. Drag the handle, or focus it and use the arrow keys.
          </p>
        </>
      }
    />
  );
}

export function StackedWithSize() {
  const [size, setSize] = React.useState(60);
  return (
    <Resizable
      orientation="vertical"
      defaultSize={60}
      min={30}
      max={80}
      onSizeChange={setSize}
      handleLabel="Resize the note and its draft"
      style={{ blockSize: '22rem' }}
      start={
        <>
          <p className="subtitle">Night walk, 12 June</p>
          <p className="tray-soft" style={{ marginBlockStart: 'var(--space-2)' }}>
            Bed A woke at 22:40. Most snails were on the clover by midnight; the first eggs were under the leaves by two.
          </p>
        </>
      }
      end={
        <p className="tray-soft">
          The note takes {Math.round(size)}% of the height. Drag the handle up or down.
        </p>
      }
    />
  );
}
