import * as React from 'react';
import { useFieldControl } from '../lib/field';
import { cx } from '../lib/util';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 'md' is 56px (the default), 'sm' 48px for toolbars and table filters. */
  size?: 'md' | 'sm';
  /** Marks the value as wrong: a 2px danger ring inside the field. Inside a Field, pass `error` to the Field instead. */
  invalid?: boolean;
}

/**
 * An input takes one line of text: a grey fill, 16px corners, 56px tall, no stroke. The fill follows the ground: white on a grey card.
 * Put it in a Field, which gives it a label and its help or error.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({ size = 'md', invalid, className, id, disabled, ...rest }, ref) {
  const field = useFieldControl({ id, disabled, invalid, 'aria-describedby': rest['aria-describedby'], 'aria-invalid': rest['aria-invalid'] });
  return <input ref={ref} className={cx('tray-input', size === 'sm' && 'tray-input--sm', className)} {...rest} {...field} />;
});
Input.displayName = 'Input';
