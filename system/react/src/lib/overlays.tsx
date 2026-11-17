import * as React from 'react';
import { useControlled, useForwardedRef } from './util';

/* Shared by the overlays: the native <dialog> under Dialog, AlertDialog, Sheet and Drawer. Not exported from the package. */

interface DialogShellProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'onCancel' | 'onClose' | 'title'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** true: showModal(), over the page with the veil. false: shown in place with the open attribute. */
  modal?: boolean;
  /** A button that opens the dialog; rendered just before it. */
  trigger?: React.ReactElement;
  /** Closes on a click on the veil. */
  veil: boolean;
  /** Closes on Escape. */
  escape: boolean;
  /** Called when Escape or the veil closes it (not a button). */
  onDismiss?: () => void;
}

/**
 * The browser's own <dialog>, held by React state: showModal() in an effect, Escape and the veil close it,
 * any `[data-close]` control inside closes it (unless its click handler called preventDefault), focus goes back to the trigger.
 */
export const DialogShell = React.forwardRef<HTMLDialogElement, DialogShellProps>(function DialogShell(
  { open: openProp, defaultOpen = false, onOpenChange, modal = true, trigger, veil, escape, onDismiss, onClick, children, ...rest },
  forwarded,
) {
  const ref = useForwardedRef(forwarded);
  const [open, setOpen] = useControlled(openProp, defaultOpen, onOpenChange);
  const latest = React.useRef({ open, setOpen, onDismiss, escape });
  latest.current = { open, setOpen, onDismiss, escape };
  const returnTo = React.useRef<HTMLElement | null>(null);

  const giveFocusBack = React.useCallback(() => {
    const el = returnTo.current;
    returnTo.current = null;
    const d = ref.current;
    const active = document.activeElement;
    if (el && el.isConnected && (!active || active === document.body || (d && d.contains(active)))) el.focus();
  }, [ref]);

  // Modal: open and close with the dialog's own methods, so the browser traps focus and draws the veil.
  React.useEffect(() => {
    const d = ref.current;
    if (!d || !modal) return;
    if (open && !d.open) {
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
      giveFocusBack();
    }
  }, [open, modal, ref, giveFocusBack]);

  // Removed while open (its parent stopped rendering it): give focus back once it is gone.
  React.useEffect(() => {
    const d = ref.current;
    return () => {
      const el = returnTo.current;
      if (!el) return;
      queueMicrotask(() => {
        const active = document.activeElement;
        if (d && !d.isConnected && el.isConnected && (!active || active === document.body)) {
          returnTo.current = null;
          el.focus();
        }
      });
    };
  }, [ref]);

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    // Escape: React state decides, so a controlled dialog stays open until its owner says otherwise.
    e.preventDefault();
    if (!latest.current.escape || !latest.current.open) return;
    latest.current.onDismiss?.();
    latest.current.setOpen(false);
  };

  const handleClose = () => {
    // Closed by the browser itself (a form with method="dialog", or a second Escape it would not let us cancel).
    const d = ref.current;
    if (d && d.open) return;
    if (latest.current.open) {
      latest.current.onDismiss?.();
      latest.current.setOpen(false);
    }
    giveFocusBack();
  };

  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    onClick?.(e);
    const d = ref.current;
    if (!d || !latest.current.open) return;
    const target = e.target as Element;
    const closer = target.closest('[data-close]');
    if (closer && closer.closest('dialog') === d) {
      if (!e.defaultPrevented) setOpen(false);
      return;
    }
    if (target === d && modal && veil) {
      const b = d.getBoundingClientRect();
      if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) {
        onDismiss?.();
        setOpen(false);
      }
    }
  };

  const opener = trigger
    ? React.cloneElement(trigger, {
        'aria-haspopup': 'dialog',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(e);
          if (!e.defaultPrevented) setOpen(true);
        },
      })
    : null;

  const dialog = (
    <dialog {...rest} ref={ref as React.RefObject<HTMLDialogElement>} open={modal ? undefined : open} onCancel={handleCancel} onClose={handleClose} onClick={handleClick}>
      {children}
    </dialog>
  );

  return opener ? (
    <>
      {opener}
      {dialog}
    </>
  ) : (
    dialog
  );
});
