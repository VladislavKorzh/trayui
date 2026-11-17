import { ApiKeys, Button, type ApiKey } from 'trayui-react';

const keys: ApiKey[] = [
  { name: 'Storefront', masked: 'ck_live_••••4f2a', value: 'ck_live_9f2c41d87ab04f2a', access: 'Read and write', lastUsed: '2 minutes ago' },
  { name: 'Accounting export', masked: 'ck_live_••••c81e', access: 'Read only', lastUsed: '1 November' },
  { name: 'Old label printer', masked: 'ck_live_••••07bd', access: 'Read only' },
];

export function Keys() {
  return (
    <ApiKeys
      title="API keys"
      description="A key gives a program the same access as its role."
      action={<Button size="sm" icon="plus">New key</Button>}
      keys={keys}
    />
  );
}

export function NewKey() {
  return (
    <ApiKeys
      keys={[{ name: 'Courier labels', masked: 'ck_live_••••48f1', access: 'Read and write' }]}
      newKey={{ name: 'Courier labels', value: 'ck_live_51b7e09c3d6a48f1' }}
      newKeyModal={false}
    />
  );
}
