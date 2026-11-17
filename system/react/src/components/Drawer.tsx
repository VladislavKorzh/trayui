import * as React from 'react';
import { DialogShell } from '../lib/overlays';
import { cx, useUid } from '../lib/util';

export interface DrawerProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'title' | 'onCancel' | 'onClose'> {
  /** The task in a few words, in `title` type: "Add to the order". It also names the drawer for screen readers. */
  title: React.ReactNode;
  /**
   * The content, placed straight under the title. Wrap it in `<div className="tray-stack" style={{ marginBlockStart: 'var(--space-5)' }}>`
   * to space it from the title and between its rows. Keep it short: a long form wants a page.
   */
  children?: React.ReactNode;
  /** The action at the bottom, full width where the thumb is: `<Button block data-close end="$118">Add to the order</Button>`. `data-close` closes the drawer when clicked. */
  footer?: React.ReactNode;
  /** Whether it is open. Pass it with `onOpenChange` to control the drawer; leave it out and the drawer keeps its own state. */
  open?: boolean;
  /** Whether it starts open, when `open` is left out. Default false. */
  defaultOpen?: boolean;
  /** Called with `true` when the trigger opens it, and with `false` when Escape, the veil or a `data-close` button closes it. */
  onOpenChange?: (open: boolean) => void;
  /** The button that opens it, rendered in place just before the drawer: `<Button icon="shopping-bag">Add to the order</Button>`. Focus returns to it on close. */
  trigger?: React.ReactElement;
  /**
   * true (the default): rises over the page on the `scrim` veil, holds focus inside, and closes on Escape and on a click on the veil.
   * false: shown in place, with no veil. Inside a `<div className="tray-stage tray-stage--scrim" style={{ minBlockSize: '28rem' }}>` this pictures an open drawer
   * in a preview or a documentation page (with `defaultOpen`).
   */
  modal?: boolean;
  /** false keeps the drawer open on a click on the veil; Escape and the buttons still close it. Default true. */
  closeOnVeil?: boolean;
}

/**
 * A drawer is a panel that rises from the bottom edge: the dialog of a phone.
 * Use it for a short task on a narrow screen, where the thumb is; on a desktop the same task is usually a Dialog (switch at 40rem).
 */
export const Drawer = React.forwardRef<HTMLDialogElement, DrawerProps>(function Drawer(
  { title, children, footer, open, defaultOpen, onOpenChange, trigger, modal = true, closeOnVeil = true, className, ...rest },
  ref,
) {
  const titleId = useUid('drawer-title');
  return (
    <DialogShell
      ref={ref}
      className={cx('tray-drawer', className)}
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
      <span className="tray-drawer__grip" aria-hidden="true" />
      <h2 className="title" id={titleId}>
        {title}
      </h2>
      {children}
      {footer != null ? <div className="tray-dialog__foot">{footer}</div> : null}
    </DialogShell>
  );
});
Drawer.displayName = 'Drawer';
