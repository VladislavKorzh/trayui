import { Badge, Button, Hero, Item, Typography } from 'trayui-react';

export function Figure() {
  return (
    <div className="tray-stack">
      <Hero
        title="Every order, packed on time"
        description="Counter is the order desk for small farms: orders in, labels out, the courier told."
        actions={
          <>
            <Button href="#">Start free</Button>
            <Button variant="quiet" href="#">
              See how it works
            </Button>
          </>
        }
        note="Free for 14 days. No card needed."
        media={
          <>
            <div className="tray-row tray-row--between">
              <span className="nav" style={{ fontWeight: 600 }}>Today at Perly Farm</span>
              <Badge tone="ink">14:00 courier</Badge>
            </div>
            <div>
              <Typography variant="figure" unit="orders">
                38
              </Typography>
              <p style={{ marginBlockStart: 'var(--space-3)' }}>26 packed, 12 to go. All of them leave today.</p>
            </div>
            {/* A picture of the share, beside the figure that says it: one image with the words, as in the HTML preview. */}
            <div className="tray-steps" role="img" aria-label="26 of 38 orders packed">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} data-done={i < 7 ? '' : undefined} />
              ))}
            </div>
          </>
        }
      />
      <p className="tray-demo-note">Counter, Perly Farm and their figures are invented for these examples.</p>
    </div>
  );
}

export function Display() {
  return (
    <div className="tray-stack">
      <Hero
        title="Packed by two"
        titleSize="display"
        description="Counter tells the people who pack what goes in which box, and books the courier when they are done."
        actions={
          <>
            <Button href="#">Start free</Button>
            <Button variant="quiet" href="#">
              Talk to us
            </Button>
          </>
        }
        media={
          <>
            <span className="nav" style={{ fontWeight: 600 }}>To pack this morning</span>
            <ul className="tray-items" role="list">
              <Item size="sm" title="PL-20431" text="Two jars of 50 g" end="$118.00" />
              <Item size="sm" title="PL-20430" text="One jar of 100 g" end="$59.00" />
              <Item size="sm" title="PL-20429" text="Four jars of 50 g" end="$236.00" />
            </ul>
          </>
        }
      />
      <p className="tray-demo-note">Counter, Perly Farm and their figures are invented for these examples.</p>
    </div>
  );
}
