import * as React from 'react';
import { Button, Card, Field, Textarea } from 'trayui-react';

export function States() {
  return (
    <div className="tray-fields">
      <Field label="Note for the courier" optional>
        <Textarea rows={3} maxLength={140} showCount hint="Door codes, landmarks, a safe place." defaultValue="Call from the gate, the bell is broken." />
      </Field>
      <Field label="What went wrong" error="Tell us what happened, in a sentence or two.">
        <Textarea rows={3} />
      </Field>
    </div>
  );
}

export function Controlled() {
  const [review, setReview] = React.useState('The 50 g jar came cold and sealed, with a spoon of mother of pearl. We served it on blinis.');
  return (
    <Card style={{ maxWidth: 560 }}>
      <div className="tray-stack">
        <Field label="Your review of the 50 g jar">
          <Textarea
            rows={5}
            maxLength={280}
            showCount
            hint="Shown on the product page with your first name."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </Field>
        <div className="tray-row">
          <Button size="sm">Publish review</Button>
          <Button size="sm" variant="ghost" onClick={() => setReview('')}>
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}
