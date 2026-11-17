import * as React from 'react';
import { cx } from '../lib/util';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Marks a control that may be left empty. `true` writes "(optional)"; a string writes that instead. */
  optional?: boolean | string;
  /** Removes the space under the label, for a label beside its control in a row. */
  inline?: boolean;
}

/**
 * A label names a control in plain words, above it, in `label` type. A Field draws one for you; use Label on its own for a control outside a Field.
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(function Label({ optional, inline, className, children, ...rest }, ref) {
  return (
    <label ref={ref} className={cx('tray-label', inline && 'tray-label--inline', className)} {...rest}>
      {children}
      {optional ? <span className="tray-label__opt"> {optional === true ? '(optional)' : optional}</span> : null}
    </label>
  );
});
Label.displayName = 'Label';
