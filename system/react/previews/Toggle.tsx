import * as React from 'react';
import { Toggle } from 'trayui-react';

export function Toolbar() {
  return (
    <div className="tray-row">
      <Toggle icon="bold" aria-label="Bold" defaultPressed />
      <Toggle icon="italic" aria-label="Italic" />
      <Toggle icon="bookmark">Pin</Toggle>
      <Toggle icon="bell" defaultPressed>
        Notify me
      </Toggle>
      <Toggle icon="moon" iconPressed="sun" aria-label="Dark theme" />
      <Toggle size="xs" icon="star">
        Favourite
      </Toggle>
      <Toggle icon="lock" disabled>
        Locked
      </Toggle>
    </div>
  );
}

export function Controlled() {
  const [pinned, setPinned] = React.useState(true);
  return (
    <div className="tray-row">
      <Toggle icon="bookmark" pressed={pinned} onPressedChange={setPinned}>
        Pin
      </Toggle>
      <p className="tray-soft">{pinned ? 'Order PL-20431 stays at the top of the list.' : 'Order PL-20431 is sorted by date with the rest.'}</p>
    </div>
  );
}
