import * as React from 'react';
import { Banner, Button } from 'trayui-react';

export function Tones() {
  return (
    <div className="tray-stack">
      <Banner tone="accent" icon="clock" title="The trial ends in 5 days." action={<Button variant="dark" size="xs" href="#">Choose a plan</Button>} dismissible>
        Choose a plan to keep your orders and your team.
      </Banner>
      <Banner icon="megaphone" title="Courier labels print in one click now." action={<Button variant="link" href="#">What changed</Button>} dismissible>
        Open any order to try it.
      </Banner>
      <Banner tone="inverse" icon="settings" title="Maintenance on Sunday, 22 November, 02:00 to 03:00.">
        Orders placed then are kept and shown after.
      </Banner>
    </div>
  );
}

export function ProblemAndEdge() {
  return (
    <div className="tray-stack">
      <Banner tone="danger" icon="circle-alert" title="The last payment did not go through." action={<Button variant="quiet" size="xs" href="#">Update the card</Button>}>
        Update the card by 20 November to keep the Shop plan.
      </Banner>
      <Banner tone="accent" edge title="Two months free" action={<Button variant="link" href="#" style={{ color: 'inherit' }}>See the plans</Button>}>
        on a yearly plan until 30 November.
      </Banner>
    </div>
  );
}

export function Dismissing() {
  const [dismissed, setDismissed] = React.useState(0);
  return (
    <div className="tray-stack">
      <Banner key={dismissed} icon="megaphone" title="Courier labels print in one click now." dismissible onDismiss={() => setDismissed((n) => n + 1)}>
        Open any order to try it.
      </Banner>
      <p className="tray-soft">
        {dismissed ? `Dismissed ${dismissed === 1 ? 'once' : dismissed + ' times'}: a product would remember it and not show the banner again. Here it comes back.` : 'The close button hides the banner and reports it through onDismiss.'}
      </p>
    </div>
  );
}
