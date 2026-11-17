import * as React from 'react';
import { Button, Field, InputOTP } from 'trayui-react';

export function States() {
  return (
    <div className="tray-fields">
      <Field label="Code from the message" hint="Sent to the number ending in 27.">
        <InputOTP separator={3} defaultValue="409" />
      </Field>
      <Field label="Wrong code" error="That code does not match. Try again.">
        <InputOTP length={4} defaultValue="1234" />
      </Field>
    </div>
  );
}

export function Verify() {
  const [code, setCode] = React.useState('');
  const [result, setResult] = React.useState<'waiting' | 'wrong' | 'right'>('waiting');
  return (
    <div className="tray-stack" style={{ maxWidth: 480 }}>
      <Field
        label="Code from the message"
        hint={result === 'right' ? 'Confirmed. Order PL-20431 is on its way.' : 'Sent to the number ending in 27.'}
        error={result === 'wrong' ? 'That code does not match. Try again.' : undefined}
      >
        <InputOTP
          separator={3}
          value={code}
          onChange={(next) => {
            setCode(next);
            setResult('waiting');
          }}
          onComplete={(full) => setResult(full === '409127' ? 'right' : 'wrong')}
        />
      </Field>
      <div className="tray-row">
        <Button size="sm" variant="quiet" onClick={() => setCode('')}>
          Send a new code
        </Button>
      </div>
    </div>
  );
}
