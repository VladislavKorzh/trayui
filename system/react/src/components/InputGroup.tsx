'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { useFieldControl } from '../lib/field';
import { useMergedRef } from '../lib/menus';
import { cx } from '../lib/util';
import { Icon } from './Icon';

export interface InputGroupAction {
  /** The button's words: "Apply". With `icon`, the button shows the icon alone and these words become its aria-label: "Copy the address". */
  label: string;
  /** An icon in place of the words, such as 'copy'. */
  icon?: IconSource;
  /** Makes it the yellow action of the field, for the one thing the field is for: "Apply" beside a promo code. */
  accent?: boolean;
  /** What the button does. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** 'button' (the default) or 'submit', when the button sends the form. */
  type?: 'button' | 'submit';
  /** Dims the button; it cannot be pressed. */
  disabled?: boolean;
}

export interface InputGroupProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** A 20px icon at the start, such as 'search' or 'lock'. It decorates; the input still needs a label or an aria-label. */
  icon?: IconSource;
  /** Text at the start that is not part of the value: "https://", "$". */
  prefix?: React.ReactNode;
  /** Text at the end that is not part of the value: a unit such as "kg", or a key hint such as `<Kbd>/</Kbd>`. */
  suffix?: React.ReactNode;
  /** One small button at the end, for an action that only makes sense with this field: apply a code, copy a link. Never more than one. */
  action?: InputGroupAction;
  /**
   * For a password: a button at the end that shows and hides it. Takes the place of `action`. The field turns spell checking and
   * capitals off (they matter once it shows text), and is a password field again when its form is sent and on a page brought back by Back.
   */
  reveal?: boolean;
  /** 'md' is 56px (the default), 'sm' 48px for toolbars and table filters. */
  size?: 'md' | 'sm';
  /** Marks the value as wrong: a 2px danger ring around the group. Inside a Field, pass `error` to the Field instead. */
  invalid?: boolean;
  /** Classes for the group (the box with the fill), for width and layout. Other props go to the `<input>`. */
  className?: string;
  /** Styles for the group, such as a width. */
  style?: React.CSSProperties;
}

/**
 * An input group is one field that also holds an icon, a unit, a prefix or one small button.
 * Use it for search, for units and prefixes that are not part of the value, and for one action that belongs to the field.
 */
export const InputGroup = React.forwardRef<HTMLInputElement, InputGroupProps>(function InputGroup(
  { icon, prefix, suffix, action, reveal, size = 'md', invalid, className, style, id, disabled, type, ...rest },
  ref,
) {
  const field = useFieldControl({ id, disabled, invalid, 'aria-describedby': rest['aria-describedby'], 'aria-invalid': rest['aria-invalid'] });
  const [shown, setShown] = React.useState(false);
  const inputType = reveal ? (shown ? 'text' : 'password') : type;
  const own = React.useRef<HTMLInputElement | null>(null);
  const setRef = useMergedRef(own, ref);
  // A password shown stays a password field where it matters: as its form is sent (so the browser treats it as one, to
  // save it and not to keep it as text), and on a page brought back by Back from the browser's cache. The type changes at
  // once, before the browser reads the form; the state follows.
  React.useEffect(() => {
    const input = own.current;
    if (!reveal || !input) return;
    const conceal = () => {
      if (input.type !== 'password') input.type = 'password';
      setShown(false);
    };
    const back = (e: PageTransitionEvent) => {
      if (e.persisted) conceal();
    };
    const form = input.form;
    form?.addEventListener('submit', conceal);
    window.addEventListener('pageshow', back);
    return () => {
      form?.removeEventListener('submit', conceal);
      window.removeEventListener('pageshow', back);
    };
  }, [reveal]);
  return (
    <div className={cx('tray-input-group', size === 'sm' && 'tray-input-group--sm', className)} style={style}>
      {icon ? (
        <span className="tray-input-group__addon">
          <Icon name={icon} />
        </span>
      ) : null}
      {prefix != null ? <span className="tray-input-group__addon">{prefix}</span> : null}
      <input
        ref={setRef}
        className="tray-input"
        type={inputType}
        spellCheck={reveal ? false : undefined}
        autoCapitalize={reveal ? 'none' : undefined}
        {...rest}
        {...field}
      />
      {suffix != null ? <span className="tray-input-group__addon">{suffix}</span> : null}
      {reveal ? (
        <button
          className="tray-input-group__btn"
          type="button"
          // One name in both states: aria-pressed carries the state, or it would be read as "Hide password, pressed".
          aria-pressed={shown}
          aria-label="Show password"
          disabled={field.disabled}
          onClick={() => setShown((s) => !s)}
        >
          <Icon name={shown ? 'eye-off' : 'eye'} />
        </button>
      ) : action ? (
        <button
          className={cx('tray-input-group__btn', action.accent && 'tray-input-group__btn--accent')}
          type={action.type ?? 'button'}
          aria-label={action.icon ? action.label : undefined}
          disabled={action.disabled ?? field.disabled}
          onClick={action.onClick}
        >
          {action.icon ? <Icon name={action.icon} /> : action.label}
        </button>
      ) : null}
    </div>
  );
});
InputGroup.displayName = 'InputGroup';
