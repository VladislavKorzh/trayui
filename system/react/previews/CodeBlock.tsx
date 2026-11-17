import { CodeBlock, Message } from 'trayui-react';

export function Numbered() {
  return (
    <CodeBlock title="stock.js" numbered mark={3}>{`
// The jars left in a batch
function jarsLeft(batch) {
  return batch.packed - batch.reserved;
}

jarsLeft({ name: 'autumn', packed: 412, reserved: 280 });
`}</CodeBlock>
  );
}

export function InlineAndOutput() {
  return (
    <div className="tray-stack">
      <p>
        Run <span className="tray-code-inline">npm run stock</span> to print the same figure in the terminal:
      </p>
      <CodeBlock size="sm" highlight={false}>{`
$ npm run stock
autumn batch: 412 packed, 280 reserved, 132 left
`}</CodeBlock>
    </div>
  );
}

export function InAnAnswer() {
  return (
    <div className="tray-thread" style={{ maxWidth: 640 }}>
      <Message variant="own">How do I get the stock of a batch from the API?</Message>
      <Message variant="assistant">
        <p>Ask for the batch by its name. The answer holds the packed and the reserved jars.</p>
        <CodeBlock title="python" code={`# Counter API
batch = counter.batches.get("autumn")
print(batch.packed - batch.reserved)`} />
      </Message>
    </div>
  );
}
