import * as React from 'react';
import { Attachment, Bubble, Icon, Marker, Message } from 'trayui-react';

export function Conversation() {
  return (
    <div className="tray-thread">
      <Message author="Oksana" time="14:02" avatar="OF">
        The courier has the box. He will call from the gate.
      </Message>
      <Message variant="own" footer={<><Icon name="check" size="sm" />Delivered</>}>
        Thank you. Can he leave it with the neighbour if I miss the call?
      </Message>
      <Message
        variant="assistant"
        author="Assistant"
        time="14:03"
        actions={[
          { icon: 'copy', label: 'Copy the answer' },
          { icon: 'thumbs-up', label: 'Good answer' },
          { icon: 'rotate-cw', label: 'Try again' },
        ]}
      >
        <p>Yes. Chilled boxes keep for six hours, so a neighbour is fine today.</p>
        <p>I have added a note for the courier: "Leave with the neighbour at number 12 if nobody answers."</p>
      </Message>
    </div>
  );
}

export function GroupedWithAttachments() {
  return (
    <div className="tray-thread">
      <Marker variant="separator">Today</Marker>
      <Message author="Dana Kovalenko" time="09:12" avatar="DK">
        <Bubble>Is the autumn batch still open?</Bubble>
        <Bubble>I would like two jars of 50 g before the season ends.</Bubble>
      </Message>
      <Message variant="own">
        <Bubble>Yes, 132 jars are left.</Bubble>
        <Bubble>Here is last year's receipt.</Bubble>
        <div className="tray-attachments">
          <Attachment name="receipt-20418.pdf" meta="PDF, 84 KB" href="#" action="download" />
        </div>
      </Message>
    </div>
  );
}

export function Reactions() {
  const [said, setSaid] = React.useState('Press a reaction.');
  return (
    <div className="tray-stack" style={{ maxWidth: 640 }}>
      <div className="tray-thread">
        <Message
          author="Oksana Franko"
          time="18:40"
          avatar="OF"
          reactions={[
            { icon: 'thumbs-up', label: 'Thumbs up', count: 2, pressed: true },
            { icon: 'heart', label: 'Heart', count: 1 },
          ]}
          onReact={(r) => setSaid(`${r.label}: ${r.pressed ? 'yours' : 'not yours'}, ${r.count} in all.`)}
        >
          Order PL-20431 is packed and in the cold room.
        </Message>
      </div>
      <p className="caption tray-muted" aria-live="polite">{said}</p>
    </div>
  );
}
