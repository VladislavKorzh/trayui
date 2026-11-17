import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { Icon } from './Icon';

export type MarkerVariant = 'event' | 'separator' | 'row';

export interface MarkerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 'event' (the default) is a quiet line with an icon: "The courier picked up the order".
   * 'separator' is a label between two hairlines: a date, "New messages", "Conversation shortened".
   * 'row' is a filled row for an event that deserves weight, with a time or a button at its end.
   */
  variant?: MarkerVariant;
  /** The icon before the text, for 'event' and 'row': 'truck', 'search', 'circle-check'. Separators take none. */
  icon?: IconSource;
  /** Something in progress: a Spinner takes the icon's place and the text pulses gently. Announced as a status. Default false. */
  busy?: boolean;
  /** With variant 'row': a time or a small button at the end of the row. */
  end?: React.ReactNode;
  /** The words: a plain past-tense sentence without a full stop, or the present while busy ("Checking the address"). */
  children?: React.ReactNode;
}

/**
 * A marker is a line in a conversation that is not a message: a date, a status, something the system did.
 * It sits in the thread between Messages, quieter than a message and never in a bubble.
 */
export const Marker = React.forwardRef<HTMLDivElement, MarkerProps>(function Marker({ variant = 'event', icon, busy, end, className, children, ...rest }, ref) {
  if (variant === 'separator') {
    return (
      <div ref={ref} className={cx('tray-marker tray-marker--separator', className)} {...rest}>
        {children}
      </div>
    );
  }
  const status = busy ? { role: 'status', 'aria-busy': true as const } : {};
  return (
    <div ref={ref} className={cx('tray-marker', variant === 'row' && 'tray-marker--row', className)} {...status} {...rest}>
      {busy ? (
        <span className="tray-marker__icon">
          <span className="tray-spinner tray-spinner--sm" aria-hidden="true" />
        </span>
      ) : icon ? (
        <span className="tray-marker__icon">
          <Icon name={icon} />
        </span>
      ) : null}
      <span className="tray-marker__text">{children}</span>
      {variant === 'row' && end != null ? <span className="tray-marker__end caption tray-muted">{end}</span> : null}
    </div>
  );
});
Marker.displayName = 'Marker';
