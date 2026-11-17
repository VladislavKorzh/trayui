import * as React from 'react';
import { InviteForm } from 'trayui-react';

export function WithAWrongAddress() {
  return (
    <InviteForm
      card
      title="Invite people"
      description="They get an email with a link that works for 7 days."
      seats={5}
      placeholder="Add another"
      defaultEmails={['andriy@perly.example', 'marta@perly']}
      roleHint={<>A packer sees today's orders and marks them packed. One seat is free; more people need <a href="#">extra seats</a>.</>}
      onSubmit={() => {}}
    />
  );
}

export function SendAndClear() {
  const [emails, setEmails] = React.useState<string[]>([]);
  const [sent, setSent] = React.useState<string | null>(null);
  return (
    <div className="tray-stack">
      <InviteForm
        seats={1}
        hint="Separate emails with a comma or Enter. One seat is free."
        emails={emails}
        onEmailsChange={(next) => setEmails(next)}
        roles={['Manager', 'Packer', 'Viewer']}
        defaultRole="Packer"
        onSubmit={({ emails: to, role, valid }) => {
          if (!valid || !to.length) return;
          setSent(`Invited ${to.join(', ')} as ${role.toLowerCase()}.`);
          setEmails([]);
        }}
      />
      <p className="tray-demo-note" role="status">{sent ?? 'Nothing is sent until the button is pressed.'}</p>
    </div>
  );
}
