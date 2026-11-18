'use client';
import * as React from 'react';
import { DialogShell } from '../lib/overlays';
import { cx, useUid } from '../lib/util';
import { Button } from './Button';

export interface AlertDialogProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'title' | 'onCancel' | 'onClose'> {
  /** The question, with the name of the thing, in `subtitle` type: "Delete order PL-20418?". */
  title: React.ReactNode;
  /** One sentence that says what will happen: "The order and its messages are removed for good." Read out with the title. */
  description?: React.ReactNode;
  /** Rarely needed: a short list of what is affected, between the text and the buttons. */
  children?: React.ReactNode;
  /** The safe button, which repeats its own outcome: "Keep the order". Never "No" or "Cancel" alone. It comes first and takes the focus when the dialog opens. */
  cancelLabel: React.ReactNode;
  /** The action button, which repeats its own outcome: "Delete order". Never "Yes" or "OK". */
  confirmLabel: React.ReactNode;
  /** The action button's look: 'danger' (the default) when something is destroyed; 'dark' or 'primary' when nothing is. */
  confirmVariant?: 'danger' | 'dark' | 'primary';
  /** Called when the action button is clicked. The dialog then closes. */
  onConfirm?: () => void;
  /** Called when the safe button is clicked or Escape is pressed. The dialog then closes. */
  onCancel?: () => void;
  /** Whether it is open. Pass it with `onOpenChange` to control the dialog; leave it out and the dialog keeps its own state. */
  open?: boolean;
  /** Whether it starts open, when `open` is left out. Default false. */
  defaultOpen?: boolean;
  /** Called with `true` when the trigger opens it, and with `false` when either button or Escape closes it. */
  onOpenChange?: (open: boolean) => void;
  /** The button that opens it, rendered in place just before the dialog: `<Button variant="danger">Delete order</Button>`. Focus returns to it on close. */
  trigger?: React.ReactElement;
  /**
   * true (the default): opens over the page on the `scrim` veil and holds focus inside. A click on the veil never closes it.
   * false: shown in place, with no veil. Inside a `<div className="tray-stage tray-stage--scrim">` this pictures it open in a preview or a documentation page (with `defaultOpen`).
   */
  modal?: boolean;
  /** false makes Escape slower as well, when even leaving needs a choice: the first presses do nothing, and the browser closes it at the third (Chrome), as the safe choice (`onCancel`). Default true. */
  closeOnEscape?: boolean;
}

/**
 * An alert dialog stops a person before something that cannot be undone, and makes them choose.
 * Use it only for what cannot be reversed (delete, cancel a paid order, send to many people); when the action can be undone, do it and offer "Undo" in a toast instead.
 */
export const AlertDialog = React.forwardRef<HTMLDialogElement, AlertDialogProps>(function AlertDialog(
  {
    title,
    description,
    children,
    cancelLabel,
    confirmLabel,
    confirmVariant = 'danger',
    onConfirm,
    onCancel,
    open,
    defaultOpen,
    onOpenChange,
    trigger,
    modal = true,
    closeOnEscape = true,
    className,
    ...rest
  },
  ref,
) {
  const titleId = useUid('alert-title');
  const textId = useUid('alert-text');
  return (
    <DialogShell
      ref={ref}
      className={cx('tray-dialog tray-dialog--sm', className)}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={description != null ? textId : undefined}
      data-static={closeOnEscape ? undefined : ''}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      trigger={trigger}
      modal={modal}
      veil={false}
      escape={closeOnEscape}
      onDismiss={onCancel}
      {...rest}
    >
      <div className="tray-dialog__head">
        <div>
          <h2 className="subtitle" id={titleId}>
            {title}
          </h2>
          {description != null ? (
            <p className="tray-dialog__text" id={textId}>
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children != null ? <div className="tray-dialog__body">{children}</div> : null}
      <div className="tray-dialog__foot">
        <Button variant="quiet" size="md" data-close="" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} size="md" data-close="" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </DialogShell>
  );
});
AlertDialog.displayName = 'AlertDialog';
