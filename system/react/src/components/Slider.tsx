import * as React from 'react';
import { useFieldControl } from '../lib/field';
import { cx, useBehaviour, useForwardedRef, useUid } from '../lib/util';
import { useRepaint } from '../lib/forms';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'size'> {
  /** The label, at the start of the head with the value at its end: "Jars per month". Leave it out inside a Field, which draws its own. */
  label?: React.ReactNode;
  /** The lowest value. Default 0. */
  min?: number;
  /** The highest value. Default 100. */
  max?: number;
  /** The distance between values: 10 for a radius in tens of kilometres. Default 1. */
  step?: number;
  /** The value, for a controlled slider. */
  value?: number;
  /** The value at first, for an uncontrolled slider. Default: half way. */
  defaultValue?: number;
  /** Called with the new number while the knob moves. `onChange` still receives the native event. */
  onValueChange?: (value: number) => void;
  /** Written after the value in the head: " km" (with its space), "%". */
  unit?: string;
  /** The scale under the track, in tick type: `true` prints the two ends, an array prints each mark ([0, 10, 20, 30, 40, 50]). Default none. */
  scale?: boolean | React.ReactNode[];
  /** Classes for the outer slider field (head, track and scale), for layout. Other props go to the `<input type="range">`. */
  className?: string;
  /** Styles for the outer slider field. */
  style?: React.CSSProperties;
}

/**
 * A slider picks a number from a range by dragging, when the feel of the value matters more than its digits: a budget, a radius.
 * Its value is always printed beside it. For an exact number, such as a quantity, use a stepper or an input.
 */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { label, min = 0, max = 100, step, value, defaultValue, onValueChange, onChange, unit, scale, className, style, id, disabled, ...rest },
  ref,
) {
  const own = useForwardedRef(ref);
  const field = useFieldControl({ id, disabled, 'aria-describedby': rest['aria-describedby'], 'aria-invalid': rest['aria-invalid'] });
  const auto = useUid('slider');
  const controlId = field.id ?? auto;
  // The slider behaviour fills the track up to the knob and writes the value, with its unit, into the <output>.
  useBehaviour(own);
  useRepaint(own, value);

  const marks = scale === true ? [min, max] : Array.isArray(scale) ? scale : null;
  return (
    <div className={cx('tray-slider-field', className)} style={style}>
      <div className="tray-slider-field__head">
        {label != null ? (
          <label className="tray-label tray-label--inline" htmlFor={controlId}>
            {label}
          </label>
        ) : (
          // Inside a Field the label sits above; the empty start keeps the value at the end of the head.
          <span />
        )}
        <output htmlFor={controlId} />
      </div>
      <input
        ref={own as React.RefObject<HTMLInputElement>}
        className="tray-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        data-unit={unit}
        data-tray="slider"
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(Number(e.target.value));
        }}
        {...rest}
        {...field}
        id={controlId}
      />
      {marks ? (
        <div className="tray-slider-field__scale">
          {marks.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
});
Slider.displayName = 'Slider';
