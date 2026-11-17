import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { useFieldControl } from '../lib/field';
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
  /** For a password: a button at the end that shows and hides it. Takes the place of `action`. */
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
  return (
    <div className={cx('tray-input-group', size === 'sm' && 'tray-input-group--sm', className)} style={style}>
      {icon ? (
        <span className="tray-input-group__addon">
          <Icon name={icon} />
        </span>
      ) : null}
      {prefix != null ? <span className="tray-input-group__addon">{prefix}</span> : null}
      <input ref={ref} className="tray-input" type={inputType} {...rest} {...field} />
      {suffix != null ? <span className="tray-input-group__addon">{suffix}</span> : null}
      {reveal ? (
        <button
          className="tray-input-group__btn"
          type="button"
          aria-pressed={shown}
          aria-label={shown ? 'Hide password' : 'Show password'}
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
