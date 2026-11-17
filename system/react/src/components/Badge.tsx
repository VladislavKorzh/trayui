import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { Icon } from './Icon';

export type BadgeTone = 'neutral' | 'accent' | 'ink' | 'off' | 'danger' | 'success';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * 'neutral' is the resting fill (the default). 'accent' is yellow, for the one thing to notice.
   * 'ink' is solid ink, for a strong state. 'off' is a quiet track grey for something not yet active.
   * 'danger' and 'success' colour the text only, and always come with a word and usually an icon.
   */
  tone?: BadgeTone;
  /** An icon before the text, such as 'circle-check' for "Paid". */
  icon?: IconSource;
  /** A small round counter (24px) for a number beside a tab or a menu item. */
  count?: boolean;
}

/**
 * A badge is a short word or a number on a small chip: a status, a tag, a count.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ tone = 'neutral', icon, count, className, children, ...rest }, ref) {
  return (
    <span ref={ref} className={cx('tray-badge', tone !== 'neutral' && `tray-badge--${tone}`, count && 'tray-badge--count', className)} {...rest}>
      {icon ? <Icon name={icon} size="sm" /> : null}
      {children}
    </span>
  );
});
Badge.displayName = 'Badge';
