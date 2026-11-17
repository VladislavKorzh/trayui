import { Button, Card, Carousel } from 'trayui-react';

const pad = { padding: 'var(--space-7)' };

export function FieldNotes() {
  return (
    <Carousel label="Field notes" previousLabel="Previous note" nextLabel="Next note">
      <Card href="#" tone="accent" className="tray-stack tray-stack--sm" style={pad}>
        <h3 className="subtitle">The May peak</h3>
        <p>The last eggs are in. This is the season in one chart.</p>
        <p className="caption">14 November 2026</p>
      </Card>
      <Card href="#" tone="inverse" className="tray-stack tray-stack--sm" style={pad}>
        <h3 className="subtitle">Closing the beds for winter</h3>
        <p className="tray-soft">From December to February the farm is quiet.</p>
        <p className="caption tray-muted">10 November 2026</p>
      </Card>
      <Card href="#" className="tray-stack tray-stack--sm" style={pad}>
        <h3 className="subtitle">Why we salt by hand</h3>
        <p className="tray-soft">Two things go in the jar: caviar and sea salt.</p>
        <p className="caption tray-muted">3 October 2026</p>
      </Card>
      <Card href="#" className="tray-stack tray-stack--sm" style={pad}>
        <h3 className="subtitle">Three ways to serve white caviar</h3>
        <p className="tray-soft">Cold, plain and unhurried. The rest is detail.</p>
        <p className="caption tray-muted">14 August 2026</p>
      </Card>
      <Card href="#" tone="leaf" className="tray-stack tray-stack--sm" style={pad}>
        <h3 className="subtitle">A night on the farm</h3>
        <p className="tray-soft">Snails wake after sunset. Twice a week, so do we.</p>
        <p className="caption tray-muted">12 June 2026</p>
      </Card>
    </Carousel>
  );
}

const jars = [
  { name: 'Jar of 30 g', price: '$39', note: 'Enough for two' },
  { name: 'Jar of 50 g', price: '$59', note: 'A starter for four' },
  { name: 'Jar of 100 g', price: '$109', note: 'For a table of eight' },
  { name: 'Gift box', price: '$129', note: 'With a bone spoon' },
  { name: 'Tasting set', price: '$89', note: 'Three jars of 30 g' },
];

export function NarrowSlides() {
  return (
    <Carousel label="Jars" slideWidth="16rem" previousLabel="Previous jar" nextLabel="Next jar">
      {jars.map((j) => (
        <Card key={j.name} title={j.name} description={j.note}>
          <Button variant="quiet" size="sm" end={j.price} block>
            Add
          </Button>
        </Card>
      ))}
    </Carousel>
  );
}
