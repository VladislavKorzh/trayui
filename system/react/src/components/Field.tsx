'use client';
import * as React from 'react';
import { FieldContext } from '../lib/field';
import { cx, useUid } from '../lib/util';

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The label: two or three words in sentence case, no colon. "Delivery address", "Phone". */
  label: React.ReactNode;
  /** One line of help under the control, only when it prevents a mistake. */
  hint?: React.ReactNode;
  /** What to do about a wrong value: "Enter the phone number with its area code." It replaces the hint and marks the control invalid. */
  error?: React.ReactNode;
  /** Marks a field that may be left empty. Fields without it read as required, so no asterisks are needed. `true` writes "(optional)". */
  optional?: boolean | string;
  /** The control's id. One is made up when it is left out. */
  controlId?: string;
  /** 'stack' puts the label above the control (the default); 'row' puts it beside the control, for settings pages. */
  layout?: 'stack' | 'row';
  /** Inside a two-column `tray-fields` grid, spans both columns. */
  full?: boolean;
  /** Dims the label and disables the control. */
  disabled?: boolean;
  /** Hides the label visually and keeps it for screen readers, when an icon already says it (a search field). */
  hideLabel?: boolean;
  /** One control: Input, Textarea, NativeSelect, Select, Combobox, DatePicker, InputGroup, InputOTP or Slider. It picks up the id, the help and the error by itself. */
  children: React.ReactNode;
}

/**
 * A field is one question in a form: a label, its control, and one line of help or error beneath.
 * The control inside it is linked to the label and the message by itself.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, hint, error, optional, controlId, layout = 'stack', full, disabled, hideLabel, className, children, ...rest },
  ref,
) {
  const auto = useUid('field');
  const id = controlId ?? auto;
  const messageId = error != null || hint != null ? `${id}-msg` : undefined;
  const labelId = `${id}-label`;
  const ctx = React.useMemo(() => ({ id, labelId, describedBy: messageId, invalid: error != null, disabled }), [id, labelId, messageId, error, disabled]);
  // A control that is a group of inputs (Input OTP) is named by the label through aria-labelledby: a <label for> would
  // point at its first input, which has a name of its own, and so name nothing. The label is then a span.
  const group = React.Children.toArray(children).some((c) => React.isValidElement(c) && (c.type as { trayGroup?: boolean } | null)?.trayGroup === true);
  const words = (
    <>
      {label}
      {optional ? <span className="tray-label__opt"> {optional === true ? '(optional)' : optional}</span> : null}
    </>
  );
  const labelEl = group ? (
    <span className={cx('tray-label', hideLabel && 'tray-vh')} id={labelId}>
      {words}
    </span>
  ) : (
    <label className={cx('tray-label', hideLabel && 'tray-vh')} htmlFor={id} id={labelId}>
      {words}
    </label>
  );
  const message =
    error != null ? (
      <p className="tray-field__error" id={messageId}>
        {error}
      </p>
    ) : hint != null ? (
      <p className="tray-field__hint" id={messageId}>
        {hint}
      </p>
    ) : null;
  return (
    <FieldContext.Provider value={ctx}>
      <div ref={ref} className={cx('tray-field', layout === 'row' && 'tray-field--row', full && 'tray-field--full', className)} data-disabled={disabled || undefined} {...rest}>
        {labelEl}
        {layout === 'row' ? (
          <div>
            {children}
            {message}
          </div>
        ) : (
          <>
            {children}
            {message}
          </>
        )}
      </div>
    </FieldContext.Provider>
  );
});
Field.displayName = 'Field';
