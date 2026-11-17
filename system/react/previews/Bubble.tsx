import { Bubble, Message } from 'trayui-react';

export function Thread() {
  return (
    <div className="tray-thread">
      <Message
        reactions={[
          { icon: 'thumbs-up', label: 'Thumbs up', count: 2, pressed: true },
          { icon: 'heart', label: 'Heart', count: 1 },
        ]}
      >
        <Bubble>Is the autumn batch still open?</Bubble>
        <Bubble>I would like two jars before the season ends.</Bubble>
      </Message>
      <Message variant="own">
        <Bubble>
          Yes, 132 jars are left. You can <a href="#">order here</a> and choose the day.
        </Bubble>
      </Message>
      <Message>
        <Bubble clamp>
          Thank you. One more thing about delivery: the entrance is from the yard, not from the street, the bell for flat 12 is the second from the top and
          it sticks, so it is better to call. If nobody answers, the neighbour at number 14 is usually home after four and has agreed to take a chilled box
          and keep it in the fridge until the evening.
        </Bubble>
      </Message>
      <Message variant="assistant">
        <Bubble>
          <p>Noted. The courier will call first and, after four, try number 14.</p>
        </Bubble>
      </Message>
    </div>
  );
}

export function Variants() {
  return (
    <div className="tray-stack" style={{ maxWidth: 560 }}>
      <div className="tray-row tray-row--sm">
        <Bubble>Is the autumn batch still open?</Bubble>
        <Bubble variant="own">Yes, 132 jars are left.</Bubble>
      </div>
      <Bubble variant="plain">
        <p>The autumn batch was packed on 2 November and is kept at 2 to 4 °C.</p>
        <p>Of the 412 jars, 280 are reserved. At this pace the rest last about nine days.</p>
      </Bubble>
    </div>
  );
}

export function GroupedOwn() {
  return (
    <div className="tray-thread">
      <Message variant="own">
        <Bubble>Two jars of 50 g, please.</Bubble>
        <Bubble>And one of 30 g as a gift.</Bubble>
        <Bubble>Can they arrive before Friday?</Bubble>
      </Message>
    </div>
  );
}
