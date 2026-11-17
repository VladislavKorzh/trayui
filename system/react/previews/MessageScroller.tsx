import * as React from 'react';
import { Marker, Message, MessageScroller } from 'trayui-react';

export function Conversation() {
  const [sent, setSent] = React.useState<string[]>([]);
  return (
    <div className="tray-stack">
      <MessageScroller label="Conversation with the farm" height="22rem" onSend={(text) => setSent((s) => [...s, text])}>
        <Marker variant="separator">Yesterday</Marker>
        <Message author="Oksana" time="18:40" avatar="OF">
          Your order is packed and in the cold room.
        </Message>
        <Message variant="own">Great. What time does the courier leave?</Message>
        <Marker variant="separator">Today</Marker>
        <Message author="Oksana" time="13:55" avatar="OF">
          He sets off at two and reaches you between three and four.
        </Message>
        <Marker icon="truck">The courier picked up order PL-20418</Marker>
        <Message author="Oksana" time="14:02" avatar="OF">
          The courier has the box. He will call from the gate.
        </Message>
        {sent.map((text, i) => (
          <Message key={i} variant="own">
            {text}
          </Message>
        ))}
      </MessageScroller>
    </div>
  );
}

export function ReadingBack() {
  return (
    <MessageScroller label="Conversation with the assistant" height="20rem" start="top" style={{ maxWidth: 640 }}>
      <Marker variant="separator">Monday</Marker>
      <Message variant="own">How many jars are left in the autumn batch?</Message>
      <Message variant="assistant">
        <p>132 jars: 412 were packed and 280 are reserved.</p>
        <p>At this pace they last about nine days.</p>
      </Message>
      <Message variant="own">Reserve two of 50 g for Dana Kovalenko.</Message>
      <Message variant="assistant">Done. Order PL-20431 holds two jars of 50 g, ready to pay until Friday.</Message>
      <Message variant="own">And a gift box with a handwritten note, please.</Message>
      <Marker busy>Writing the answer</Marker>
    </MessageScroller>
  );
}
