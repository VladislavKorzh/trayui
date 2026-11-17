import { Typography } from 'trayui-react';

export function Headings() {
  return (
    <div>
      <div className="tray-type-row"><span>display</span><Typography variant="display" as="p">White caviar</Typography></div>
      <div className="tray-type-row"><span>headline</span><Typography variant="headline" as="p">How to tell it</Typography></div>
      <div className="tray-type-row"><span>title</span><Typography variant="title" as="p">Your order</Typography></div>
      <div className="tray-type-row"><span>subtitle</span><Typography variant="subtitle" as="p">From soil to jar</Typography></div>
      <div className="tray-type-row"><span>figure</span><Typography variant="figure" unit="%">88</Typography></div>
    </div>
  );
}

export function TextAndInterface() {
  return (
    <div>
      <div className="tray-type-row"><span>lead</span><Typography variant="lead" tone="soft">Raised, collected by hand and packed on our own farm.</Typography></div>
      <div className="tray-type-row"><span>body</span><Typography>By day the beds look empty. The snails are there, under the boards.</Typography></div>
      <div className="tray-type-row"><span>action</span><Typography variant="action">Order a jar</Typography></div>
      <div className="tray-type-row"><span>control</span><Typography variant="control">50 g</Typography></div>
      <div className="tray-type-row"><span>nav</span><Typography variant="nav">Field notes</Typography></div>
      <div className="tray-type-row"><span>label</span><Typography variant="label">Delivery address</Typography></div>
      <div className="tray-type-row"><span>caption</span><Typography variant="caption" tone="muted">Courier delivery in a chilled box.</Typography></div>
      <div className="tray-type-row"><span>tick</span><Typography variant="tick" tone="hint">00:00 &nbsp; 06:00 &nbsp; 12:00 &nbsp; 18:00</Typography></div>
      <div className="tray-type-row"><span>code</span><Typography variant="code" as="p">const jar = order.items[0];</Typography></div>
      <div className="tray-type-row"><span>kbd</span><Typography variant="kbd" as="p">Ctrl K</Typography></div>
    </div>
  );
}

export function Prose() {
  return (
    <div className="tray-prose">
      <Typography variant="subtitle" as="h2">Why we collect in the morning</Typography>
      <p>
        A snail lays once it has dug in, and it should not be disturbed. So we leave the marked spots alone overnight and collect after sunrise. The weight goes
        into <span className="tray-code-inline">harvest.kg</span> the same day.
      </p>
      <ul className="tray-list-plain">
        <li>Out and feeding: the bed is healthy.</li>
        <li>Clustered on the boards: too dry, so we water before dawn.</li>
      </ul>
      <p className="tray-quote">
        It is slow work. One snail gives roughly 4 g of caviar in a year.<cite>Field notes, 12 June 2026</cite>
      </p>
    </div>
  );
}
