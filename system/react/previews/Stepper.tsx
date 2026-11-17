import * as React from 'react';
import { Button, Card, Stepper, type StepperStep } from 'trayui-react';

export function Checkout() {
  return (
    <Stepper
      aria-label="Checkout"
      current={1}
      steps={[{ label: 'Cart', href: '#' }, { label: 'Delivery' }, { label: 'Payment' }, { label: 'Review' }]}
    />
  );
}

export function Vertical() {
  return (
    <Card style={{ padding: 'var(--space-6)', maxInlineSize: '26rem' }}>
      <Stepper
        aria-label="Set up the workspace"
        orientation="vertical"
        current={2}
        steps={[
          { label: 'Farm details', description: 'Perly Farm, Kyiv region', href: '#' },
          { label: 'Products', description: 'Three jar sizes', href: '#' },
          { label: 'Delivery', description: 'Choose the days the courier comes' },
          { label: 'Invite the team' },
        ]}
      />
    </Card>
  );
}

const steps: StepperStep[] = [{ label: 'Jars' }, { label: 'Delivery' }, { label: 'Payment' }];

export function GoingBack() {
  const [at, setAt] = React.useState(2);
  return (
    <div className="tray-stack tray-stack--lg" style={{ maxInlineSize: '40rem' }}>
      <Stepper aria-label="Order a jar" current={at} steps={steps} onStepClick={setAt} />
      <div className="tray-row tray-row--between">
        <p className="tray-soft">{at < steps.length ? `Step ${at + 1} of ${steps.length}. A finished step can be clicked to go back to it.` : 'Every step is done.'}</p>
        <Button size="sm" variant={at < steps.length ? 'primary' : 'quiet'} onClick={() => setAt(at < steps.length ? at + 1 : 0)}>
          {at < steps.length ? 'Continue' : 'Start again'}
        </Button>
      </div>
    </div>
  );
}
