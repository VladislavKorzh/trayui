import * as React from 'react';
import { cx, runtime } from '../lib/util';
import { Button } from './Button';
import { Icon } from './Icon';

/** 'neutral' (no icon), 'success' (a green check) or 'danger' (a red mark; announced at once, and a toast() of this tone stays until dismissed). */
export type ToastTone = 'neutral' | 'success' | 'danger';

/** The one button a toast may carry. "Undo" is the best action a toast can have. */
export interface ToastAction {
  /** The button's words: "Undo", "Retry", "View". */
  label: string;
  /** What it does. A toast from toast() leaves once it is clicked. */
  onClick?: () => void;
}

/** What `toast()` takes. */
export interface ToastOptions {
  /** What happened, in three or four words: "Order archived". */
  title: string;
  /** One more line, when needed: "To dana@example.com". */
  text?: string;
  /** 'neutral' (the default), 'success' or 'danger'. */
  tone?: ToastTone;
  /** One button: `{ label: 'Undo', onClick: restore }`. */
  action?: ToastAction;
  /** Milliseconds on screen. Default 5000; a danger toast stays until dismissed. 0 keeps any toast until dismissed. */
  duration?: number;
}

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** What happened, in three or four words: "Order archived". */
  title: React.ReactNode;
  /** One more line, when needed: "To dana@example.com". */
  text?: React.ReactNode;
  /** 'neutral' (the default) has no icon. 'success' adds a green check; 'danger' a red mark, and the toast is announced at once (role alert). */
  tone?: ToastTone;
  /** One ghost button before the dismiss button: `{ label: 'Undo', onClick: restore }`. */
  action?: ToastAction;
  /** Called by the dismiss button (the x at the end). */
  onDismiss?: () => void;
  /** The dismiss button's name for screen readers. Default 'Dismiss'. */
  dismissLabel?: string;
}

/**
 * A toast confirms that something just happened, in a small panel at the corner of the screen that leaves by itself.
 * Call `toast({ title })` to show one; the Toast component draws the same panel in place, for a picture or a region you manage yourself.
 * A toast needs no decision: what a person must read or act on goes in an Alert in the page, or in a Dialog.
 */
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { title, text, tone = 'neutral', action, onDismiss, dismissLabel = 'Dismiss', className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('tray-toast', tone !== 'neutral' && `tray-toast--${tone}`, className)} role={tone === 'danger' ? 'alert' : 'status'} {...rest}>
      {tone !== 'neutral' ? <Icon name={tone === 'danger' ? 'circle-alert' : 'circle-check'} /> : null}
      <div className="tray-toast__body">
        <p className="tray-toast__title">{title}</p>
        {text != null ? <p className="tray-toast__text">{text}</p> : null}
      </div>
      <div className="tray-toast__actions">
        {action ? (
          <Button variant="ghost" size="xs" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : null}
        <Button variant="ghost" size="xs" icon="x" aria-label={dismissLabel} onClick={onDismiss} />
      </div>
    </div>
  );
});
Toast.displayName = 'Toast';

/**
 * Shows a toast at the bottom end corner of the screen, in the system's `tray-toasts` region: `toast({ title: 'Order archived', action: { label: 'Undo', onClick: restore } })`.
 * It leaves after `duration` (5 s; a danger toast stays), and its timer pauses while the pointer or focus is on it. Returns `{ dismiss() }` to take it away early.
 */
export function toast(options: ToastOptions): { dismiss(): void } {
  const { tone, ...rest } = options;
  return runtime.toast({ ...rest, tone: tone === 'neutral' ? undefined : tone });
}
