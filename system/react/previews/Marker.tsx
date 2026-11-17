import { Button, Marker, Message } from 'trayui-react';

export function Kinds() {
  return (
    <div className="tray-stack" style={{ maxWidth: 416 }}>
      <Marker variant="separator">Today</Marker>
      <Marker icon="truck">The courier picked up order PL-20418</Marker>
      <Marker busy>Checking the address</Marker>
      <Marker icon="search">Looked through 4 earlier orders</Marker>
      <Marker variant="row" icon="circle-check" end="14:10">
        Order PL-20418 was paid
      </Marker>
      <Marker variant="separator">Conversation shortened</Marker>
    </div>
  );
}

export function InAThread() {
  return (
    <div className="tray-thread" style={{ maxWidth: 640 }}>
      <Message author="Dana Kovalenko" time="10:04" avatar="DK">
        Can I still change the address?
      </Message>
      <Marker variant="separator">New messages</Marker>
      <Marker variant="row" icon="map-pin" end={<Button variant="ghost" size="xs">Undo</Button>}>
        The address of order PL-20431 was changed
      </Marker>
      <Message variant="assistant">Yes. The courier now goes to 12 Market Square, between three and four.</Message>
    </div>
  );
}
