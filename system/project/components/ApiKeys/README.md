# API Keys

API keys lists the keys of a workspace with the secret masked, and shows a new key in full once, at the moment it is made.

## Markup
```html
<span class="tray-secret" data-tray="secret" data-value="ck_live_9f2c41d87ab04f2a">
  <code>ck_live_&bull;&bull;&bull;&bull;4f2a</code>
  <button type="button" data-secret="show" aria-label="Show the key">…eye…</button>
  <button type="button" data-secret="copy" aria-label="Copy the key">…copy…</button>
</span>
```
## Behaviour
`data-tray="secret"`: the `<code>` holds the masked form and `data-value` the real one. The `data-secret="show"` button swaps them and turns into "Hide the key" (`data-label-on` renames it); `data-secret="copy"` copies the real value whichever is shown, and shows a check for a moment. It fires `tray:change` with `{ copied: true }`.

For a key your server no longer holds in full, leave out `data-value` and both buttons: show the masked form as plain `<code>` text.

The list is a Table: the key's name, the secret, what it may do, when it was last used, and "Revoke". A new key is shown in a Dialog with `tray-secret--block`, a warning that it will not be shown again, and a button that closes only after the copy.

## Do and don't
- Do mask all but the prefix and the last four characters.
- Do show when each key was last used, so a dead one can be revoked.
- Don't put a real key in the page for a key that already exists: fetch it only at creation.
- Don't revoke without asking. Use an Alert Dialog and name the key.
