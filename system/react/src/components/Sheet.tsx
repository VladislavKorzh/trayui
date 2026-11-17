import * as React from 'react';
import { DialogShell } from '../lib/overlays';
import { cx, useUid } from '../lib/util';
import { Button } from './Button';

export interface SheetProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'title' | 'onCancel' | 'onClose'> {
  /** The panel's name, in `title` type: "Filters", "Order PL-20431". It also names the sheet for screen readers. */
  title: React.ReactNode;
  /** One sentence under the title, in soft ink. */
  description?: React.ReactNode;
  /** The body: filters, the details of a row, a cart. Laid out as a grid with 16px gaps; the sheet scrolls when it is long. */
  children?: React.ReactNode;
  /**
   * Buttons under the body, the main one last: "Clear" and "Show 8 orders". Give a button `data-close` to close the sheet when clicked.
   * Leave it out when filters apply as they change.
   */
  footer?: React.ReactNode;
  /** 'end' (the default) for everything about the current page: filters, details, a cart. 'start' for navigation, such as the sidebar on a phone. */
  side?: 'end' | 'start';
  /** Whether it is open. Pass it with `onOpenChange` to control the sheet; leave it out and the sheet keeps its own state. */
  open?: boolean;
  /** Whether it starts open, when `open` is left out. Default false. */
  defaultOpen?: boolean;
  /** Called with `true` when the trigger opens it, and with `false` when Escape, the veil, the close button or a `data-close` button closes it. */
  onOpenChange?: (open: boolean) => void;
  /** The button that opens it, rendered in place just before the sheet: `<Button variant="quiet" icon="filter">Filters</Button>`. Focus returns to it on close. */
  trigger?: React.ReactElement;
  /**
   * true (the default): slides over the page on the `scrim` veil, holds focus inside, and closes on Escape and on a click on the veil.
   * false: shown in place, with no veil. Inside a `<div className="tray-stage tray-stage--scrim" style={{ minBlockSize: '34rem' }}>` this pictures an open sheet
   * in a preview or a documentation page (with `defaultOpen`).
   */
  modal?: boolean;
  /** Shows the round close button (an x) in the corner of the head. Default true. */
  closeButton?: boolean;
  /** The close button's name for screen readers. Default 'Close'. */
  closeLabel?: string;
  /** false keeps the sheet open on a click on the veil; Escape and the buttons still close it. Default true. */
  closeOnVeil?: boolean;
}

/**
 * A sheet is a panel that slides in from the side and keeps the page in view beside it.
 * Use it for filters, the details of a row or a cart; for a yes or no question use AlertDialog, and for anything wider than half the screen make a page.
 */
export const Sheet = React.forwardRef<HTMLDialogElement, SheetProps>(function Sheet(
  {
    title,
    description,
    children,
    footer,
    side = 'end',
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
  const titleId = useUid('sheet-title');
  return (
    <DialogShell
      ref={ref}
      className={cx('tray-sheet', side === 'start' && 'tray-sheet--start', className)}
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
Sheet.displayName = 'Sheet';
