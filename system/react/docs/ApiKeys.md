---
category: Account
keywords: [api keys, api key, tokens, secret, developer keys, access tokens, revoke key, copy key]
---
# API Keys

API keys lists the keys of a workspace with the secret masked, and shows a new key in full once, at the moment it is made.

## Use
```tsx
<ApiKeys
  title="API keys"
  description="A key gives a program the same access as its role."
  action={<Button size="sm" icon="plus">New key</Button>}
  keys={[
    { name: 'Storefront', masked: 'ck_live_••••4f2a', value: fullKey, access: 'Read and write', lastUsed: '2 minutes ago' },
    { name: 'Old label printer', masked: 'ck_live_••••07bd', access: 'Read only' },   // no lastUsed: "Never"
  ]}
  onRevoke={(key) => askToRevoke(key)}
  newKey={created}                                  /* { name, value }: opens "Copy the new key" */
  onNewKeyDone={() => setCreated(undefined)}
/>
```

## Parts
A Table with the key's name, the secret, what it may do (a Badge), when it was last used, and "Revoke". The secret is masked to its prefix and last four characters. A key with a `value` gets a button that shows it (and turns into "Hide the key") and one that copies the real value whichever is shown, with a check for a moment. A key without a `value` is masked text only.

## The new key
Set `newKey` the moment a key is made: a dialog shows it in full, the only time it is shown, with a warning to keep it out of the browser and the repository. Its one button copies the key if it was not copied yet, then calls `onNewKeyDone`: clear `newKey` there. Escape does not lose the key; the dialog closes only after the copy. `newKeyModal={false}` pictures the dialog in place on a scrim, for documentation.

`onCopy` runs after any key is copied.

## Do and don't
- Do mask all but the prefix and the last four characters.
- Do show when each key was last used, so a dead one can be revoked.
- Don't put a real key in the page for a key that already exists: fetch it only at creation.
- Don't revoke without asking. Use an Alert Dialog and name the key.
