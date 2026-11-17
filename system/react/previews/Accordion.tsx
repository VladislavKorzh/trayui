import * as React from 'react';
import { Accordion, Button, Card } from 'trayui-react';

export function Questions() {
  return (
    <Accordion
      defaultValue={['taste']}
      items={[
        {
          value: 'taste',
          title: 'What does it taste like?',
          content: 'Mild and earthy, with mushroom and herbal notes, and less salty than sturgeon caviar. The eggs are firm and pop on the tongue.',
        },
        { value: 'keep', title: 'How long does a jar keep?', content: 'Unopened, up to three months in the fridge. Once opened, eat it within three days.' },
        { value: 'delivery', title: 'How is it delivered?', content: 'By courier in a chilled box, the same day in the city, or you collect it at the farm shop.' },
      ]}
    />
  );
}

export function SmallOnACard() {
  return (
    <Card style={{ padding: 'var(--space-5) var(--space-6)' }}>
      <Accordion
        size="sm"
        multiple
        items={[
          { title: 'Delivery', content: 'Courier, chilled box, 14:00 to 18:00.' },
          { title: 'Payment', content: 'Card, on delivery.' },
        ]}
      />
    </Card>
  );
}

const sizes = [
  { value: '30', title: 'Jar of 30 g', content: 'Enough for two, on blinis or a boiled egg. $39.' },
  { value: '50', title: 'Jar of 50 g', content: 'Our most ordered jar: a starter for four. $59.' },
  { value: '100', title: 'Jar of 100 g', content: 'For a table of eight, or a gift. $109.' },
];

export function Controlled() {
  const [open, setOpen] = React.useState<string[]>(['50']);
  return (
    <div className="tray-stack">
      <div className="tray-row tray-row--sm">
        <Button variant="quiet" size="sm" onClick={() => setOpen(sizes.map((s) => s.value))}>Open all</Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen([])}>Close all</Button>
      </div>
      <Accordion size="sm" multiple value={open} onChange={setOpen} items={sizes} />
    </div>
  );
}
