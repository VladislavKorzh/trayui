'use client';
import * as React from 'react';
import { cx, useBehaviour, useForwardedRef } from '../lib/util';

export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The words: one line, a few words, no full stop. "Copy the link", "Collapse the sidebar". Usually the same as the control's aria-label. */
  tip: string;
  /** A keyboard shortcut shown as key caps after the words, one cap per key: ['Ctrl', 'K']. */
  keys?: string[];
  /** 'top' (the default) puts the bubble above the control; 'bottom' puts it under. */
  side?: 'top' | 'bottom';
  /** Holds the tooltip open, for a static picture in a preview or a walkthrough. Leave it out to let hover and focus show it. Default false. */
  open?: boolean;
  /** The one control it names: a Button (usually icon-only, with its own aria-label), a link or an input. It must be able to take focus. */
  children: React.ReactNode;
}

/**
 * A tooltip is one short line that names a control when the pointer or the keyboard is on it.
 * Give one to every icon-only button, with its shortcut when it has one; never to a button that already shows its label, and never with anything to click inside (that is a Popover).
 */
export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip({ tip, keys, side = 'top', open = false, className, children, ...rest }, forwarded) {
  const ref = useForwardedRef<HTMLSpanElement>(forwarded);
  const keyText = keys && keys.length ? keys.join(' ') : undefined;
  // The behaviour builds the bubble, and rebuilds it whenever data-tip, data-keys or data-side change ("Copy the link" -> "Copied").
  useBehaviour(ref);

  // Holding it open is read by the behaviour from data-open; letting go hides the bubble unless the pointer or focus is still on the control.
  React.useEffect(() => {
    const root = ref.current;
    const bubble = root?.querySelector<HTMLElement>(':scope > .tray-tooltip');
    if (!root || !bubble) return;
    bubble.hidden = !open && !root.matches(':hover') && !root.contains(document.activeElement);
  }, [open, ref]);

  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={cx('tray-anchor', className)}
      data-tray="tooltip"
      data-tip={tip}
      data-keys={keyText}
      data-side={side === 'bottom' ? 'bottom' : undefined}
      data-open={open ? '' : undefined}
      {...rest}
    >
      {children}
    </span>
  );
});
Tooltip.displayName = 'Tooltip';
