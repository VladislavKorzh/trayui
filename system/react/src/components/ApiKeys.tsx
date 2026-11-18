'use client';
import * as React from 'react';
import { cx, useTrayEvent, useBehaviour, useUid } from '../lib/util';
import { SectionHead } from '../lib/account';
import { Badge } from './Badge';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { Icon } from './Icon';
import { Table } from './Table';

export interface ApiKey {
  /** Tells the keys apart, for React keys and your handlers. Default: the name. */
  id?: string;
  /** What uses the key: "Storefront", "Accounting export". */
  name: string;
  /** The key with all but its prefix and last four characters hidden: "ck_live_••••4f2a". */
  masked: string;
  /** The full key, only while your server still holds it: adds a button that shows it and one that copies it. Leave it out for every older key. */
  value?: string;
  /** What the key may do, on a badge: "Read and write", "Read only". */
  access: React.ReactNode;
  /** When it was last used: "2 minutes ago", "1 November". Left out, it says "Never" in muted type, so a dead key can be revoked. */
  lastUsed?: React.ReactNode;
}

export interface ApiNewKey {
  /** The name the key was given: "Courier labels". */
  name: string;
  /** The full key, shown this once: "ck_live_51b7e09c3d6a48f1". */
  value: string;
}

export interface ApiKeysProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onCopy'> {
  /** The workspace's keys, one row each. */
  keys: ApiKey[];
  /** The title above the table: "API keys". */
  title?: React.ReactNode;
  /** One line under the title: "A key gives a program the same access as its role." */
  description?: React.ReactNode;
  /** The button at the end of the head that starts a new key: `<Button size="sm" icon="plus">New key</Button>`. */
  action?: React.ReactNode;
  /** Called when a key's "Revoke" is pressed. Ask first, in an Alert Dialog that names the key. */
  onRevoke?: (key: ApiKey) => void;
  /** Called after a key was copied to the clipboard, from its row or from the new-key dialog. */
  onCopy?: (key: ApiKey | ApiNewKey) => void;
  /**
   * A key that was just made: opens the "Copy the new key" dialog, the only time it is shown in full, with a warning and one button.
   * The button copies the key if it was not copied yet, then calls `onNewKeyDone`; clear `newKey` there to close the dialog.
   */
  newKey?: ApiNewKey;
  /** Called when the new-key dialog's button is pressed, after the copy. Set `newKey` to undefined then. */
  onNewKeyDone?: () => void;
  /** false shows the new-key dialog in place, on a scrim stage under the table, with no veil: a picture of that moment for previews and docs. Default true. */
  newKeyModal?: boolean;
  /** The words of each row's revoke button. Default "Revoke". */
  revokeLabel?: string;
}

/** The masked key with its show and copy buttons, wired by the `secret` behaviour. Without a value it is plain text. */
function Secret({ masked, value, block, onCopied }: { masked: string; value?: string; block?: boolean; onCopied?: () => void }) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  useTrayEvent(ref, 'change', (detail: { copied?: boolean }) => {
    if (detail?.copied) onCopied?.();
  });
  useBehaviour(ref);
  if (value == null) {
    return (
      <span className={cx('tray-secret', block && 'tray-secret--block')}>
        <code>{masked}</code>
      </span>
    );
  }
  return (
    <span ref={ref} className={cx('tray-secret', block && 'tray-secret--block')} data-tray="secret" data-value={value}>
      <code>{masked}</code>
      {masked !== value ? (
        <button type="button" data-secret="show" aria-label="Show the key">
          <Icon name="eye" />
        </button>
      ) : null}
      <button type="button" data-secret="copy" aria-label="Copy the key">
        <Icon name="copy" />
      </button>
    </span>
  );
}

function NewKeyDialog({ newKey, modal, onCopy, onDone }: { newKey: ApiNewKey; modal: boolean; onCopy?: (key: ApiNewKey) => void; onDone?: () => void }) {
  const copied = React.useRef(false);
  const finish = () => {
    if (copied.current) {
      onDone?.();
      return;
    }
    const after = () => {
      copied.current = true;
      onCopy?.(newKey);
      onDone?.();
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(newKey.value).then(after, after);
    else after();
  };
  return (
    <Dialog
      modal={modal}
      open
      onOpenChange={(open) => {
        // Escape and the veil do not lose the key: the dialog closes only after the copy.
        if (!open && copied.current) onDone?.();
      }}
      closeButton={false}
      closeOnVeil={false}
      title="Copy the new key"
      description={`This is the only time “${newKey.name}” is shown in full.`}
      footer={
        <Button size="md" onClick={finish}>
          I have copied it
        </Button>
      }
    >
      <Secret
        block
        masked={newKey.value}
        value={newKey.value}
        onCopied={() => {
          copied.current = true;
          onCopy?.(newKey);
        }}
      />
      {/* A plain alert, no live region: it is there as the dialog opens, so it is read with the dialog. */}
      <div className="tray-alert">
        <span className="tray-alert__icon">
          <Icon name="shield" />
        </span>
        <div className="tray-alert__body">
          <p className="tray-alert__text">Keep it out of the browser and out of your repository. Anyone who has it can read and change orders.</p>
        </div>
      </div>
    </Dialog>
  );
}

/**
 * API keys lists the keys of a workspace with the secret masked, and shows a new key in full once, at the moment it is made.
 * A key whose full value your server still holds can be shown and copied; every other key is masked text only.
 */
export const ApiKeys = React.forwardRef<HTMLDivElement, ApiKeysProps>(function ApiKeys(
  { keys, title, description, action, onRevoke, onCopy, newKey, onNewKeyDone, newKeyModal = true, revokeLabel = 'Revoke', className, ...rest },
  ref,
) {
  const headId = useUid('keys');
  const dialog = newKey ? <NewKeyDialog key={newKey.value} newKey={newKey} modal={newKeyModal} onCopy={onCopy} onDone={onNewKeyDone} /> : null;
  return (
    <div ref={ref} className={cx('tray-stack', className)} {...rest}>
      <SectionHead id={headId} title={title} description={description} action={action} />
      <Table aria-labelledby={title != null ? headId : undefined} aria-label={title == null ? 'API keys' : undefined}>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Key</th>
            <th scope="col">Access</th>
            <th scope="col">Last used</th>
            <th scope="col">
              <span className="tray-vh">{revokeLabel}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => (
            <tr key={k.id ?? k.name}>
              <th scope="row">{k.name}</th>
              <td>
                <Secret masked={k.masked} value={k.value} onCopied={() => onCopy?.(k)} />
              </td>
              <td>
                <Badge>{k.access}</Badge>
              </td>
              {k.lastUsed != null ? <td className="tray-soft">{k.lastUsed}</td> : <td className="tray-muted">Never</td>}
              <td data-num="">
                <Button variant="ghost" size="xs" aria-label={`${revokeLabel} ${k.name}`} onClick={() => onRevoke?.(k)}>
                  {revokeLabel}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {dialog && !newKeyModal ? <div className="tray-stage tray-stage--scrim">{dialog}</div> : dialog}
    </div>
  );
});
ApiKeys.displayName = 'ApiKeys';
