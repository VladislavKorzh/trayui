import * as React from 'react';
import { useFieldControl } from '../lib/field';
import { cx, useTrayEvent, useBehaviour, useForwardedRef } from '../lib/util';
import { wrongFor } from '../lib/account';
import { Icon } from './Icon';

export interface TagInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'pattern' | 'max' | 'name'> {
  /** The values, for a controlled field. Set it to `[]` to clear the chips after the form is sent. Pass it with `onChange`. */
  value?: string[];
  /** The chips shown at first, for an uncontrolled field. Default none. */
  defaultValue?: string[];
  /** Called with every value and whether all of them are right, each time a chip is added or removed. `valid` is false while a danger chip is in the field. */
  onChange?: (values: string[], valid: boolean) => void;
  /** 'email': a value that is not an email address becomes a danger chip and the field turns invalid. Left out, any word is taken. */
  pattern?: 'email';
  /** The most values it takes, such as the number of free seats. Further ones are ignored. Default: no limit. */
  max?: number;
  /** Sends the values with a form under this name, joined by commas, from a hidden input. */
  name?: string;
  /** Marks the field as wrong: `aria-invalid` on the text input and a 2px danger edge inside the tray. Inside a Field, pass `error` to the Field instead. */
  invalid?: boolean;
  /** Classes for the tray (the grey box that holds the chips), for width and layout. Other props go to the text `<input>`. */
  className?: string;
  /** Styles for the tray. */
  style?: React.CSSProperties;
}

function same(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/**
 * A tag input takes several short values in one field: each becomes a chip that can be removed, and the caret waits after the last one.
 * Use it for a handful of words or email addresses typed freely; to choose from a known list, use a Combobox or checkboxes.
 * Put it in a Field. `ref` and the native props (`placeholder`, `id`, `aria-*`) go to the text input; `className` and `style` to the tray.
 */
export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(function TagInput(
  { value, defaultValue, onChange, pattern, max, name, invalid, className, style, id, disabled, type, ...rest },
  ref,
) {
  const input = useForwardedRef(ref);
  const root = React.useRef<HTMLDivElement | null>(null);
  const field = useFieldControl({ id, disabled, invalid, 'aria-describedby': rest['aria-describedby'], 'aria-invalid': rest['aria-invalid'] });
  const ringed = !!field['aria-invalid'];

  // The taginput behaviour owns the chips once it is wired: it adds and removes them in the page.
  // React draws the chips only when the tray is (re)built: at first, when a controlled value changes from outside, or when pattern or max change.
  const known = React.useRef<string[]>(value ?? defaultValue ?? []);
  const [version, setVersion] = React.useState(0);
  const build = `${version}|${pattern ?? ''}|${max ?? ''}`;
  const drawn = React.useRef({ build: '', chips: [] as string[] });
  if (drawn.current.build !== build) drawn.current = { build, chips: known.current };

  React.useEffect(() => {
    if (value === undefined || same(value, known.current)) return;
    known.current = value;
    setVersion((v) => v + 1);
  }, [value]);

  // The behaviour sets aria-invalid on the text input from its chips (a screen reader reaches the input, not the tray);
  // a Field's error or `invalid` keeps it on as well.
  const paint = () => {
    const el = root.current;
    const box = input.current;
    if (!el || !box) return;
    if (ringed || el.querySelector('.tray-chip[data-invalid]')) box.setAttribute('aria-invalid', 'true');
    else box.removeAttribute('aria-invalid');
  };
  React.useLayoutEffect(paint);

  useTrayEvent(
    root,
    'change',
    (detail: { values: string[]; valid: boolean }) => {
      known.current = detail.values;
      paint();
      onChange?.(detail.values, detail.valid);
    },
    { own: true, deps: [build] },
  );
  useBehaviour(root, [build]);

  return (
    <div
      key={build}
      ref={root}
      className={cx('tray-tags', className)}
      style={style}
      data-tray="taginput"
      data-pattern={pattern}
      data-max={max}
    >
      {drawn.current.chips.map((v) => (
        <span key={v} className="tray-chip" data-value={v} data-invalid={wrongFor(pattern, v) ? '' : undefined}>
          {v}
          {wrongFor(pattern, v) ? (
            <span className="tray-vh" data-invalid-text="">
              , not an email address
            </span>
          ) : null}
          <button type="button" className="tray-chip__x" aria-label={`Remove ${v}`} disabled={field.disabled}>
            <Icon name="x" size="sm" />
          </button>
        </span>
      ))}
      <input ref={input} type={type ?? (pattern === 'email' ? 'email' : undefined)} {...rest} {...field} />
      <input type="hidden" name={name} defaultValue={drawn.current.chips.join(',')} />
    </div>
  );
});
TagInput.displayName = 'TagInput';
