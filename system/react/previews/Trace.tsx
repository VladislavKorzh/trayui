import { CodeBlock, Message, Trace } from 'trayui-react';

export function Working() {
  return (
    <Trace
      style={{ maxWidth: 444 }}
      summary="Worked for 42 seconds, 5 steps"
      steps={[
        { verb: 'Read', text: 'orders-november.csv', icon: 'file', time: '0.4 s' },
        { verb: 'Searched', text: 'for "chilled delivery" in the notes', icon: 'search', time: '1.2 s' },
        {
          verb: 'Ran',
          text: 'the stock check',
          icon: 'terminal',
          time: '8.0 s',
          detail: <CodeBlock size="sm" highlight={false} code="autumn batch: 412 packed, 280 reserved, 132 left" />,
        },
        { verb: 'Could not reach', text: "the courier's schedule", status: 'failed', time: '30 s' },
        { verb: 'Writing', text: 'the summary', status: 'running' },
      ]}
    />
  );
}

export function FinishedAnswer() {
  return (
    <div className="tray-thread" style={{ maxWidth: 640 }}>
      <Message variant="own">Which orders still wait for a courier?</Message>
      <Message variant="assistant" author="Assistant" time="14:06">
        <Trace
          summary="Worked for 9 seconds, 3 steps"
          defaultOpen={false}
          steps={[
            { verb: 'Read', text: 'orders-november.csv', icon: 'file', time: '0.4 s' },
            { verb: 'Searched', text: 'for orders without a courier', icon: 'search', time: '1.1 s' },
            { verb: 'Skipped', text: 'the courier schedule, it was not needed', icon: 'minus' },
          ]}
        />
        <p>Two orders wait: PL-20431 for Dana Kovalenko and PL-20433 for Oksana Franko. Both are packed and in the cold room.</p>
      </Message>
    </div>
  );
}

export function StepsOnly() {
  return (
    <Trace
      style={{ maxWidth: 444 }}
      steps={[
        { verb: 'Checked', text: 'the address of order PL-20431', icon: 'map-pin', time: '0.8 s' },
        { verb: 'Denied', text: 'access to the payment details', icon: 'lock' },
      ]}
    />
  );
}
