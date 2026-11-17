import * as React from 'react';
import { FieldContext, useFieldControl } from '../lib/field';
import { cx, useBehaviour, useForwardedRef } from '../lib/util';
import { useFieldLabel } from '../lib/forms';

export interface InputOTPProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'id'> {
  /** How many cells: four to eight. Default 6. */
  length?: number;
  /** Puts a short rule after this many cells, to read the code in halves: 3 splits six cells. Left out, the cells run unbroken. */
  separator?: number;
  /** The code, for a controlled field: one character per cell. Set it to '' to clear the cells after a wrong code. */
  value?: string;
  /** The code shown at first, for an uncontrolled field. */
  defaultValue?: string;
  /** Called with the whole code (empty cells left out) whenever a cell changes. */
  onChange?: (code: string) => void;
  /** Called with the code as soon as the last cell is filled: verify it then, without asking for a second tap. */
  onComplete?: (code: string) => void;
  /** Marks the code as wrong: every cell takes a 2px danger ring. Inside a Field, pass `error` to the Field instead. */
  invalid?: boolean;
  /** Dims every cell; none can be typed in. */
  disabled?: boolean;
  /** The first cell's id, so a label can point at it. Inside a Field it comes from the Field. */
  id?: string;
  /** Sends the code with a form under this name, from a hidden input. */
  name?: string;
  /** The keyboard phones show: 'numeric' (the default) for digits, 'text' for codes with letters. */
  inputMode?: 'numeric' | 'text';
  /** Puts the cursor in the first cell on mount, when the code is the only thing on the screen. */
  autoFocus?: boolean;
}

/**
 * Input OTP takes a short one-time code, one character per cell: focus moves on as digits are typed, back on Backspace,
 * and a pasted code spreads across the cells. Use it only for short codes, never for passwords or postcodes.
 */
export const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(function InputOTP(
  { length = 6, separator, value, defaultValue, onChange, onComplete, invalid, disabled, id, name, inputMode = 'numeric', autoFocus, className, ...rest },
  ref,
) {
  const own = useForwardedRef(ref);
  const inField = React.useContext(FieldContext) != null;
  const field = useFieldControl({ id, disabled, invalid, 'aria-describedby': rest['aria-describedby'], 'aria-invalid': rest['aria-invalid'] });
  const labelled = rest['aria-label'] != null || rest['aria-labelledby'] != null;
  const fieldLabel = useFieldLabel(own, field.id, inField && !labelled);
  const [initial] = React.useState(() => (value ?? defaultValue ?? '').slice(0, length));
  const [code, setCode] = React.useState(initial);
  const last = React.useRef(initial);
  const report = React.useRef<(next: string) => void>(() => {});
  report.current = (next: string) => {
    if (next === last.current) return;
    last.current = next;
    if (value === undefined) setCode(next);
    onChange?.(next);
  };

  const completed = React.useRef(onComplete);
  completed.current = onComplete;

  // The otp behaviour moves focus, steps back and spreads a paste; it fires tray:complete when every cell is filled.
  // The group is drawn again when `length` changes, so everything here is wired again with it.
  useBehaviour(own, [length]);
  React.useEffect(() => {
    const root = own.current;
    if (!root) return;
    // Read the code after the behaviour has done its work for each key, paste or step back.
    const read = () => report.current(Array.from(root.querySelectorAll('input'), (c) => c.value).join(''));
    const complete = (e: Event) => {
      e.stopPropagation();
      read(); // onChange first, then onComplete
      completed.current?.((e as CustomEvent<{ value: string }>).detail.value);
    };
    const kinds = ['input', 'paste', 'keydown'];
    kinds.forEach((k) => root.addEventListener(k, read));
    root.addEventListener('tray:complete', complete);
    return () => {
      kinds.forEach((k) => root.removeEventListener(k, read));
      root.removeEventListener('tray:complete', complete);
    };
  }, [own, length]);

  // A controlled code that changed from outside: write it into the cells.
  React.useEffect(() => {
    const root = own.current;
    if (!root || value === undefined) return;
    const cells = Array.from(root.querySelectorAll('input'));
    if (cells.map((c) => c.value).join('') === value) return;
    cells.forEach((c, i) => (c.value = value[i] ?? ''));
    last.current = value;
  }, [own, value]);

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < length; i++) {
    if (separator && i === separator) cells.push(<span key="sep" className="tray-otp__sep" />);
    cells.push(
      <input
        key={i}
        id={i === 0 ? field.id : undefined}
        defaultValue={initial[i] ?? ''}
        autoComplete={i === 0 ? 'one-time-code' : undefined}
        inputMode={inputMode}
        disabled={field.disabled}
        autoFocus={i === 0 ? autoFocus : undefined}
      />,
    );
  }
  return (
    <>
      <div
        key={length}
        ref={own as React.RefObject<HTMLDivElement>}
        className={cx('tray-otp', className)}
        data-tray="otp"
        role="group"
        aria-labelledby={labelled ? undefined : fieldLabel}
        {...rest}
        aria-describedby={field['aria-describedby']}
        aria-invalid={field['aria-invalid']}
      >
        {cells}
      </div>
      {name ? <input type="hidden" name={name} value={value ?? code} /> : null}
    </>
  );
});
InputOTP.displayName = 'InputOTP';
