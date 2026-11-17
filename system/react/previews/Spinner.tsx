import { Button, Spinner } from 'trayui-react';

export function Sizes() {
  return (
    <div className="tray-row" style={{ gap: 32 }}>
      <Spinner size="sm" label="Checking the address" />
      <Spinner label="Sending the order" />
      <Spinner size="lg" label="Loading the season" />
    </div>
  );
}

export function InAButton() {
  return (
    <div className="tray-row">
      <Button busy>Placing the order</Button>
      <Button variant="quiet" size="sm" busy>Saving</Button>
    </div>
  );
}
