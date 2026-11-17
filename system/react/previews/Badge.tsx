import { Badge } from 'trayui-react';

export function Tones() {
  return (
    <div className="tray-row tray-row--sm">
      <Badge>To pack</Badge>
      <Badge tone="accent">On shift</Badge>
      <Badge tone="ink">With the courier</Badge>
      <Badge tone="off">Invited</Badge>
    </div>
  );
}

export function Status() {
  return (
    <div className="tray-row tray-row--sm">
      <Badge tone="success" icon="circle-check">Paid</Badge>
      <Badge icon="clock">Due</Badge>
      <Badge tone="danger" icon="circle-x">Failed</Badge>
    </div>
  );
}

export function Counts() {
  return (
    <div className="tray-row tray-row--sm">
      <span className="tray-row tray-row--sm nav">Orders <Badge count>12</Badge></span>
      <span className="tray-row tray-row--sm nav">Messages <Badge count tone="ink">3</Badge></span>
    </div>
  );
}
