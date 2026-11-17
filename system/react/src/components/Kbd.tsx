import * as React from 'react';
import { cx } from '../lib/util';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** A combination, one cap per key, as printed on the keyboard: ['Ctrl', 'K']. No plus signs. Use children instead for a single key. */
  keys?: string[];
}

/**
 * Kbd shows a key of the keyboard as a small cap in the mono face: beside a menu item, in a tooltip, in a search field, in help text.
 */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd({ keys, className, children, ...rest }, ref) {
  if (keys && keys.length) {
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} className={cx('tray-keys', className)} {...rest}>
        {keys.map((k, i) => (
          <kbd key={i} className="tray-kbd">
            {k}
          </kbd>
        ))}
      </span>
    );
  }
  return (
    <kbd ref={ref} className={cx('tray-kbd', className)} {...rest}>
      {children}
    </kbd>
  );
});
Kbd.displayName = 'Kbd';
