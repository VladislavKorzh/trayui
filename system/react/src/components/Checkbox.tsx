'use client';
import * as React from 'react';
import { useFieldControl } from '../lib/field';
import { useStaticMode } from '../lib/static';
import { cx, useForwardedRef, useIsoLayoutEffect, useUid } from '../lib/util';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** What becomes true when it is checked, in plain words: "Send me the receipt". Never a negative ("Don't send me email"). */
  label?: React.ReactNode;
  /** A second line under the label, in muted type: "One email in November, nothing else." */
  description?: React.ReactNode;
  /** What to do about it, in danger type in place of the description: "Agree to the terms to place the order." It marks the box invalid. */
  error?: React.ReactNode;
  /** Shows a dash for a parent whose children are partly checked. Clicking it checks it. */
  indeterminate?: boolean;
  /** Marks it as wrong: the box's edge turns to a 2px danger line, for a consent that was not given. Prefer `error`, which also says why. */
  invalid?: boolean;
  /** Called with the new state when the person checks or unchecks it. `onChange` still receives the native event. */
  onCheckedChange?: (checked: boolean) => void;
  /** Classes for the outer label (the whole row is the target), for layout. Other props go to the `<input>`. */
  className?: string;
  /** Styles for the outer label. */
  style?: React.CSSProperties;
}

/**
 * A checkbox turns one option on or off; a group of them lets several be on at once.
 * Use it in forms that are sent with a button; for a setting that applies at once, use Switch.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, error, indeterminate, invalid, onCheckedChange, onChange, className, style, id, disabled, ...rest },
  ref,
) {
  const own = useForwardedRef(ref);
  const errorId = useUid('check-error');
  const field = useFieldControl({
    id,
    disabled,
    invalid: invalid ?? (error != null ? true : undefined),
    'aria-describedby': cx(rest['aria-describedby'], error != null && errorId),
    'aria-invalid': rest['aria-invalid'],
  });
  // indeterminate is a property, not an attribute; a click clears it, so it is set again on every render. In static mode
  // there is no render after the first: data-indeterminate asks bundle.js to set it once the page loads.
  const wired = useStaticMode();
  useIsoLayoutEffect(() => {
    if (own.current) own.current.indeterminate = !!indeterminate;
  });
  const second =
    error != null ? (
      <small className="tray-danger" id={errorId}>
        {error}
      </small>
    ) : description != null ? (
      <small>{description}</small>
    ) : null;
  return (
    <label className={cx('tray-check', className)} style={style}>
      <input
        ref={own as React.RefObject<HTMLInputElement>}
        type="checkbox"
        data-indeterminate={wired && indeterminate ? '' : undefined}
        onChange={(e) => {
          onChange?.(e);
          onCheckedChange?.(e.target.checked);
        }}
        {...rest}
        {...field}
      />
      <span className="tray-check__box">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path className="tray-check__tick" d="M4 10.5l4 4 8-9" />
          <path className="tray-check__dash" d="M5 10h10" />
        </svg>
      </span>
      {second ? (
        <span className="tray-check__text">
          {label}
          {second}
        </span>
      ) : label != null ? (
        <span>{label}</span>
      ) : null}
    </label>
  );
});
Checkbox.displayName = 'Checkbox';
