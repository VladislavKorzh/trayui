'use client';
import * as React from 'react';
import { useFieldControl } from '../lib/field';
import { cx } from '../lib/util';

export interface NativeSelectOption {
  /** The value the form receives. */
  value: string;
  /** The words in the menu. Default: the value. */
  label?: string;
  /** Shows the option greyed out; it cannot be picked. */
  disabled?: boolean;
}

export interface NativeSelectGroup {
  /** The group's heading in the menu: "City", "Farm". */
  label: string;
  /** The options under that heading. */
  options: Array<string | NativeSelectOption>;
}

export interface NativeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** The options: a plain string is both value and label. A `{ label, options }` entry is a group with a heading (`<optgroup>`). Or pass `<option>` elements as children. */
  options?: Array<string | NativeSelectOption | NativeSelectGroup>;
  /** A disabled first option, shown while nothing is chosen: "Choose a point". It is never a real choice. */
  placeholder?: string;
  /** 'md' is 56px (the default), 'sm' 48px for toolbars and table footers. */
  size?: 'md' | 'sm';
  /** Marks the value as wrong: a 2px danger ring. Inside a Field, pass `error` to the Field instead. */
  invalid?: boolean;
  /** Classes for the outer wrapper (the box that draws the chevron), for width and layout. Other props go to the `<select>`. */
  className?: string;
  /** Styles for the outer wrapper, such as a width. */
  style?: React.CSSProperties;
}

function renderOption(o: string | NativeSelectOption) {
  const opt = typeof o === 'string' ? { value: o } : o;
  return (
    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
      {opt.label ?? opt.value}
    </option>
  );
}

/**
 * A native select is the browser's own menu in the system's field: the right choice on phones and in long forms.
 * Use it by default; use Select only when options need a second line or an icon, and Combobox when the list is long enough to search.
 */
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { options, placeholder, size = 'md', invalid, className, style, id, disabled, defaultValue, value, children, ...rest },
  ref,
) {
  const field = useFieldControl({ id, disabled, invalid, 'aria-describedby': rest['aria-describedby'], 'aria-invalid': rest['aria-invalid'] });
  // With a placeholder and nothing chosen, the placeholder shows.
  const initial = defaultValue ?? (placeholder != null && value === undefined ? '' : undefined);
  return (
    <span className={cx('tray-select', size === 'sm' && 'tray-select--sm', className)} style={style}>
      <select ref={ref} value={value} defaultValue={initial} {...rest} {...field}>
        {placeholder != null ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options?.map((o) =>
          typeof o === 'object' && 'options' in o ? (
            <optgroup key={'g-' + o.label} label={o.label}>
              {o.options.map(renderOption)}
            </optgroup>
          ) : (
            renderOption(o)
          ),
        )}
        {children}
      </select>
    </span>
  );
});
NativeSelect.displayName = 'NativeSelect';
