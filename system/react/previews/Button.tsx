import { Button } from 'trayui-react';

export function Variants() {
  return (
    <div className="tray-row">
      <Button>Order a jar</Button>
      <Button variant="dark">See the farm</Button>
      <Button variant="quiet">Details</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Delete order</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="tray-row">
      <Button variant="quiet">Large</Button>
      <Button variant="quiet" size="md">Medium</Button>
      <Button variant="quiet" size="sm">Small</Button>
      <Button variant="quiet" size="xs">Extra small</Button>
      <Button variant="link">Read the terms</Button>
    </div>
  );
}

export function WithIcons() {
  return (
    <div className="tray-row">
      <Button icon="shopping-bag">Add to order</Button>
      <Button variant="quiet" iconEnd="arrow-right">Next</Button>
      <Button variant="quiet" icon="search" aria-label="Search" />
      <Button end="$59">Order a jar</Button>
    </div>
  );
}

export function States() {
  return (
    <div className="tray-row">
      <Button disabled>Order a jar</Button>
      <Button variant="dark" busy>Sending</Button>
      <Button variant="quiet" size="sm" href="#">Open the guide</Button>
      <Button size="md" block>Pay $414.72</Button>
    </div>
  );
}
