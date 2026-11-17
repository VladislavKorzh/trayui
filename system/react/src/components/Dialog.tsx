import * as React from 'react';
import { DialogShell } from '../lib/overlays';
import { cx, useUid } from '../lib/util';
import { Button } from './Button';

export type DialogSize = 'md' | 'sm' | 'lg';

export interface DialogProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'title' | 'onCancel' | 'onClose'> {
  /** The task in a few words, in `title` type: "Change the delivery day". It also names the dialog for screen readers. */
  title: React.ReactNode;
  /** One or two sentences under the title, in soft ink: what the task changes, or why it is asked now. */
  description?: React.ReactNode;
  /** The body: the fields or the few lines the task needs. Laid out as a grid with 16px gaps. */
  children?: React.ReactNode;
  /**
   * The buttons at the end: a ghost "Cancel" first, the action last, labelled with what it does ("Save the day").
   * Give a button `data-close` and it closes the dialog when clicked; call `event.preventDefault()` in its onClick to keep it open (a value to fix).
   */
  footer?: React.ReactNode;
  /** 'md' 32rem wide (the default), 'sm' 26rem for a short question, 'lg' 44rem for a wider form. */
  size?: DialogSize;
  /** Whether it is open. Pass it with `onOpenChange` to control the dialog; leave it out and the dialog keeps its own state. */
  open?: boolean;
  /** Whether it starts open, when `open` is left out. Default false. */
  defaultOpen?: boolean;
  /** Called with `true` when the trigger opens it, and with `false` when Escape, the veil, the close button or a `data-close` button closes it. */
  onOpenChange?: (open: boolean) => void;
  /** The button that opens it, rendered in place just before the dialog: `<Button variant="quiet">Change the day</Button>`. Focus returns to it on close. */
  trigger?: React.ReactElement;
  /**
   * true (the default): opens over the page on the `scrim` veil, holds focus inside, and closes on Escape and on a click on the veil.
   * false: shown in place, with no veil and no focus trap. Inside a `<div className="tray-stage tray-stage--scrim">` this pictures an open dialog
   * in a preview or a documentation page (with `defaultOpen`).
   */
  modal?: boolean;
  /** Shows the round close button (an x) in the corner of the head. Default true. */
  closeButton?: boolean;
  /** The close button's name for screen readers. Default 'Close'. */
  closeLabel?: string;
  /** false keeps the dialog open on a click on the veil, so typed work is not lost by a stray click; Escape and the buttons still close it. Default true. */
  closeOnVeil?: boolean;
}

/**
 * A dialog asks for one decision or one small task in a panel over the page, and holds the page still until it is done.
 * Use it for a short task that must be finished or abandoned before going on; for a choice that destroys something use AlertDialog,
 * and for a message that needs no answer use a toast.
 */
export const Dialog = React.forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
  {
    title,
    description,
    children,
    footer,
    size = 'md',
    open,
    defaultOpen,
    onOpenChange,
    trigger,
    modal = true,
    closeButton = true,
    closeLabel = 'Close',
    closeOnVeil = true,
    className,
    ...rest
  },
  ref,
) {
  const titleId = useUid('dialog-title');
  return (
    <DialogShell
      ref={ref}
      className={cx('tray-dialog', size !== 'md' && `tray-dialog--${size}`, className)}
      aria-labelledby={titleId}
      data-static={closeOnVeil ? undefined : ''}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      trigger={trigger}
      modal={modal}
      veil={closeOnVeil}
      escape
      {...rest}
    >
      <div className="tray-dialog__head">
        <div>
          <h2 className="title" id={titleId}>
            {title}
          </h2>
          {description != null ? <p className="tray-dialog__text">{description}</p> : null}
        </div>
        {closeButton ? <Button variant="ghost" size="xs" icon="x" aria-label={closeLabel} data-close="" /> : null}
      </div>
      {children != null ? <div className="tray-dialog__body">{children}</div> : null}
      {footer != null ? <div className="tray-dialog__foot">{footer}</div> : null}
    </DialogShell>
  );
});
Dialog.displayName = 'Dialog';
