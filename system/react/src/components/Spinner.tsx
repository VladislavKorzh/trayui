import * as React from 'react';
import { cx } from '../lib/util';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 'sm' 16px, 'md' 20px (the default), 'lg' 32px. */
  size?: 'sm' | 'md' | 'lg';
  /** What is happening, in words: "Sending the order". Shown beside the ring, and announced to screen readers. */
  label?: React.ReactNode;
  /** Keeps the label for screen readers only, when the words are already on screen nearby. */
  hideLabel?: boolean;
}

/**
 * A spinner says that something is in progress and its length is unknown: an open ring in the text colour, always with words.
 * Switch to Progress once the length is known.
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner({ size = 'md', label = 'Loading', hideLabel, className, ...rest }, ref) {
  return (
    <span ref={ref} role="status" className={cx('tray-loading', className)} {...rest}>
      <span className={cx('tray-spinner', size !== 'md' && `tray-spinner--${size}`)} aria-hidden="true" />
      <span className={hideLabel ? 'tray-vh' : undefined}>{label}</span>
    </span>
  );
});
Spinner.displayName = 'Spinner';
