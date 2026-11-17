import * as React from 'react';
import { Card, Field, TagInput } from 'trayui-react';

export function Tags() {
  return (
    <div className="tray-fields">
      <Field label="Order tags" hint="Press Enter or a comma after each one.">
        <TagInput name="tags" placeholder="Add a tag" defaultValue={['gift', 'chilled']} />
      </Field>
      <Field label="Send the report to" error="“books@perly” is not a full email address.">
        <TagInput name="to" pattern="email" placeholder="Add an email" defaultValue={['oksana@perly.example', 'books@perly']} />
      </Field>
    </div>
  );
}

export function OnACard() {
  return (
    <Card>
      <Field label="Cities you deliver to" hint="Up to four on the Stall plan.">
        <TagInput name="cities" max={4} placeholder="Add a city" defaultValue={['Kyiv', 'Lviv']} />
      </Field>
    </Card>
  );
}

export function CheckedAsYouType() {
  const [to, setTo] = React.useState<string[]>(['oksana@perly.example']);
  const wrong = to.find((v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
  return (
    <div style={{ maxWidth: 520 }}>
      <Field
        label="Send the invoice to"
        hint={`${to.length} of 3 addresses. Separate them with a comma or Enter.`}
        error={wrong ? `“${wrong}” is not a full email address.` : undefined}
      >
        <TagInput pattern="email" max={3} placeholder="Add an email" value={to} onChange={(values) => setTo(values)} />
      </Field>
    </div>
  );
}
