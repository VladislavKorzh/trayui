import { Input, Label } from 'trayui-react';

export function Basic() {
  return (
    <div className="tray-stack" style={{ maxWidth: 420 }}>
      <div><Label htmlFor="lb-1">Delivery address</Label><Input id="lb-1" placeholder="Street, house, apartment" required /></div>
      <div><Label htmlFor="lb-2" optional>Gift note</Label><Input id="lb-2" /></div>
      <div className="tray-row"><Label htmlFor="lb-3" inline>Jars</Label><Input id="lb-3" size="sm" defaultValue="2" required style={{ width: 96 }} /></div>
    </div>
  );
}
