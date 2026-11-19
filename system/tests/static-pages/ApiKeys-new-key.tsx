// A test page for static parity (tests/components/ApiKeys.py, STATIC_PAGES): a key just made, shown in full once in the
// "Copy the new key" dialog over the page, which the page closes once the key is copied. The preview shows the dialog in
// place instead. Not a usage example.
import * as React from 'react';
import { ApiKeys, type ApiNewKey } from 'trayui-react';

export function NewKeyOverThePage() {
  const [made, setMade] = React.useState<ApiNewKey | undefined>({ name: 'Courier labels', value: 'ck_live_51b7e09c3d6a48f1' });
  return (
    <ApiKeys
      title="API keys"
      keys={[{ name: 'Courier labels', masked: 'ck_live_••••48f1', access: 'Read and write' }]}
      newKey={made}
      onNewKeyDone={() => setMade(undefined)}
    />
  );
}
