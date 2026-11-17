import * as React from 'react';
import { cx } from '../lib/util';

export interface SeparatorProps extends React.HTMLAttributes<HTMLElement> {
  /** 'horizontal' (the default) runs across; 'vertical' stands inside a row and stretches to its height. */
  orientation?: 'horizontal' | 'vertical';
  /** A few words in the middle of the line, such as "or". */
  label?: React.ReactNode;
}

/**
 * A separator is the one rule in the system: a 1px line in `hairline`. Prefer space, then fill, then a rule.
 */
export const Separator = React.forwardRef<HTMLElement, SeparatorProps>(function Separator({ orientation = 'horizontal', label, className, ...rest }, ref) {
  if (label != null) {
    return (
      <p ref={ref as React.Ref<HTMLParagraphElement>} className={cx('tray-rule tray-rule--label', className)} {...rest}>
        {label}
      </p>
    );
  }
  if (orientation === 'vertical') {
    return <span ref={ref as React.Ref<HTMLSpanElement>} role="separator" aria-orientation="vertical" className={cx('tray-rule tray-rule--v', className)} {...rest} />;
  }
  return <hr ref={ref as React.Ref<HTMLHRElement>} className={cx('tray-rule', className)} {...rest} />;
});
Separator.displayName = 'Separator';
