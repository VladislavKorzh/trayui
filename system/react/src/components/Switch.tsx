import * as React from 'react';
import { useFieldControl } from '../lib/field';
import { cx } from '../lib/util';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> {
  /** The setting, named as a thing and not an action: "Order updates", not "Turn on order updates". */
  label?: React.ReactNode;
  /** A line of detail under the label: "A card box with a note, $12". The label then turns bold. */
  description?: React.ReactNode;
  /** 'inline' puts the switch before its label (the default). 'row' is a full-width grey row with the text first and the switch at the end, for lists of settings. */
  layout?: 'inline' | 'row';
  /** Called with the new state the moment it moves. Save it then: a switch has no submit button. `onChange` still receives the native event. */
  onCheckedChange?: (checked: boolean) => void;
  /** Classes for the outer label (the whole row is the target), for layout. Other props go to the `<input>`. */
  className?: string;
  /** Styles for the outer label. */
  style?: React.CSSProperties;
}

/**
 * A switch turns one setting on or off, and the change applies at once.
 * In a form that is sent with a button, use a Checkbox instead.
 */
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, layout = 'inline', onCheckedChange, onChange, className, style, id, disabled, ...rest },
  ref,
) {
  const field = useFieldControl({ id, disabled, 'aria-describedby': rest['aria-describedby'], 'aria-invalid': rest['aria-invalid'] });
  const row = layout === 'row';
  const input = (
    <input
      ref={ref}
      type="checkbox"
      role="switch"
      onChange={(e) => {
        onChange?.(e);
        onCheckedChange?.(e.target.checked);
      }}
      {...rest}
      {...field}
    />
  );
  const track = <span className="tray-switch__track" />;
  const text =
    row || description != null ? (
      <span className="tray-switch__text">
        <b>{label}</b>
        {description != null ? <small>{description}</small> : null}
      </span>
    ) : label != null ? (
      <span>{label}</span>
    ) : null;
  return (
    <label className={cx('tray-switch', row && 'tray-switch--row', className)} style={style}>
      {row ? (
        <>
          {text}
          {input}
          {track}
        </>
      ) : (
        <>
          {input}
          {track}
          {text}
        </>
      )}
    </label>
  );
});
Switch.displayName = 'Switch';
