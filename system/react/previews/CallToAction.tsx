import * as React from 'react';
import { Button, CallToAction } from 'trayui-react';

export function Offer() {
  return (
    <CallToAction
      title="Pack tomorrow's orders with Counter"
      description="Free for 14 days. Your products and customers stay yours."
      actions={
        <>
          <Button variant="dark" href="#">
            Start free
          </Button>
          <Button variant="quiet" href="#">
            Talk to us
          </Button>
        </>
      }
    />
  );
}

/** The email form; send it to see what onSubmit receives. */
export function Newsletter() {
  const [sent, setSent] = React.useState<string | null>(null);
  return (
    <div className="tray-stack">
      <CallToAction
        title="One letter a month about running a small food business"
        titleSize="title"
        email={{ action: 'Subscribe', placeholder: 'you@farm.example', onSubmit: setSent }}
      />
      {sent ? <p className="tray-demo-note">{`Subscribed: ${sent}`}</p> : null}
    </div>
  );
}
