import { Kbd } from 'trayui-react';

export function Keys() {
  return (
    <div className="tray-row">
      <Kbd>K</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd keys={['Ctrl', 'K']} />
      <Kbd keys={['Shift', 'Enter']} />
    </div>
  );
}

export function InText() {
  return <p className="tray-soft">Press <Kbd>/</Kbd> to search the orders, or <Kbd>Esc</Kbd> to close the panel.</p>;
}
