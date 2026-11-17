import { Badge, Button, Card } from 'trayui-react';

export function Tray() {
  return (
    <Card title="Autumn batch" description="Packed on 2 November, kept at 2 to 4 °C." action={<Badge>412 jars</Badge>} footer={<><Button size="sm">Reserve jars</Button><Button size="sm" variant="ghost">History</Button></>}>
      <p className="tray-soft">132 jars are left. At this pace they last nine days.</p>
    </Card>
  );
}

export function Tones() {
  return (
    <div className="tray-bento">
      <Card tone="accent" className="tray-span-5" title="Order before 14:00">
        <p>It leaves with today's courier.</p>
      </Card>
      <Card tone="inverse" className="tray-span-7" title="Returning customers">
        <p className="tray-soft">61% of October's orders came from people who had ordered before.</p>
      </Card>
      <Card tone="leaf" className="tray-span-6" title="From our own farm">
        <p className="tray-soft">The snails live in the open air, in beds of clover.</p>
      </Card>
      <Card className="tray-span-6" title="With a white panel inside">
        <Card tone="panel"><p className="tray-soft">A panel sits inside a card; a card never sits inside a card.</p></Card>
      </Card>
    </div>
  );
}

export function AsLink() {
  return (
    <div className="tray-bento">
      <Card href="#" className="tray-span-6" title="Field notes" description="What the season taught us, month by month." />
      <Card href="#" className="tray-span-6" title="How to serve it" description="Cold, on a spoon of bone or mother of pearl." />
    </div>
  );
}
