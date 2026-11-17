import * as React from 'react';
import type { IconName } from '../icons';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { Button } from './Button';
import { Icon } from './Icon';

export type AttachmentAction = 'download' | 'remove' | 'cancel' | 'retry' | 'none';

export interface AttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The real file name, with its extension: "receipt-20418.pdf". Long names are cut with an ellipsis. */
  name: string;
  /** One line about the file: its type and size, "PDF, 84 KB". While uploading it defaults to "Uploading, 42%". */
  meta?: React.ReactNode;
  /** 'file' is a row: a tile, the name and the meta (the default). 'image' stacks a 4 to 3 thumbnail over the name. */
  variant?: 'file' | 'image';
  /** Where the file opens. The link covers the whole tray, while the button inside stays separately clickable. Leave it out while uploading or failed. */
  href?: string;
  /** A thumbnail picture for the tile, usually with variant 'image'. */
  src?: string;
  /** The icon in the tile when there is no picture. Default 'file', or 'image' for variant 'image'. */
  icon?: IconSource;
  /** Upload progress, 0 to 100: shows a thin bar under the meta line and "Uploading, N%". Leave it out once the file is sent. */
  progress?: number;
  /** Why the upload failed, said plainly: "Too large. The limit is 10 MB." Turns the meta line danger and replaces it. */
  error?: React.ReactNode;
  /**
   * The button at the end, labelled with the file name for screen readers. 'download' in a thread, 'remove' in a composer,
   * 'cancel' while uploading, 'retry' after an error, 'none' for no button.
   * Default: 'retry' with an error, 'cancel' while uploading, otherwise 'none'.
   */
  action?: AttachmentAction;
  /** Called when the button is pressed. */
  onAction?: (event: React.MouseEvent<HTMLElement>) => void;
}

const actionIcon: Record<Exclude<AttachmentAction, 'none'>, IconName> = { download: 'download', remove: 'x', cancel: 'x', retry: 'rotate-cw' };

function actionLabel(action: Exclude<AttachmentAction, 'none'>, name: string): string {
  if (action === 'download') return `Download ${name}`;
  if (action === 'remove') return `Remove ${name}`;
  if (action === 'cancel') return `Cancel the upload of ${name}`;
  return `Try ${name} again`;
}

/**
 * An attachment is a file or an image that travels with a message: a small tray with a tile, a name and one line about it.
 * Put several in a `<div className="tray-attachments">`, a wrapping row, in the message's column beside the bubble.
 */
export const Attachment = React.forwardRef<HTMLDivElement, AttachmentProps>(function Attachment(
  { name, meta, variant = 'file', href, src, icon, progress, error, action, onAction, className, ...rest },
  ref,
) {
  const uploading = progress !== undefined && error == null;
  const act: AttachmentAction = action ?? (error != null ? 'retry' : uploading ? 'cancel' : 'none');
  const pct = uploading ? Math.max(0, Math.min(100, progress as number)) : 0;
  const line = error != null ? error : meta !== undefined ? meta : uploading ? `Uploading, ${Math.round(pct)}%` : null;
  return (
    <div ref={ref} className={cx('tray-attachment', variant === 'image' && 'tray-attachment--image', className)} data-state={error != null ? 'error' : undefined} {...rest}>
      <span className="tray-attachment__media">
        {src ? <img src={src} alt="" /> : <Icon name={icon ?? (variant === 'image' ? 'image' : 'file')} size={variant === 'image' ? 'lg' : 'md'} />}
      </span>
      <span className="tray-attachment__body">
        {href !== undefined ? (
          <a className="tray-attachment__link tray-attachment__name" href={href}>
            {name}
          </a>
        ) : (
          <span className="tray-attachment__name">{name}</span>
        )}
        {line != null ? <span className="tray-attachment__meta">{line}</span> : null}
        {uploading ? (
          <span
            className="tray-progress__bar"
            role="progressbar"
            aria-label={`Uploading ${name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
            style={{ '--tray-v': pct } as React.CSSProperties}
          />
        ) : null}
      </span>
      {act !== 'none' ? <Button variant="ghost" size="xs" icon={actionIcon[act]} aria-label={actionLabel(act, name)} onClick={onAction} /> : null}
    </div>
  );
});
Attachment.displayName = 'Attachment';
