'use client';
import * as React from 'react';
import { cx, useControlled, useUid } from '../lib/util';

export interface RadioOption {
  /** The value this option stands for. */
  value: string;
  /** The option in a few words: "Card, on delivery". On a choice card it is the bold title: "Courier". */
  label: React.ReactNode;
  /** Choice cards only: a line of detail under the title, "Chilled box, the same day". */
  description?: React.ReactNode;
  /** Choice cards only: a value at the end of the card, such as a price: "$9", "Free". */
  end?: React.ReactNode;
  /** Dims the option; it cannot be picked. Say why in its label: "Cash, not for chilled orders". */
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'defaultValue'> {
  /** The options, two to five. More belong in a Select. */
  options: RadioOption[];
  /** The question, drawn as the group's legend: "Payment", "Delivery". Without it, give the group an aria-label. */
  label?: React.ReactNode;
  /** 'radio' is plain radios, a 22px ring and a label, for short lists in a form (the default). 'choice' makes each option a grey card with a title, a line of detail and a value at the end; the chosen card takes an ink ring. */
  variant?: 'radio' | 'choice';
  /** 'column' stacks the options (the default). 'row' sets plain radios side by side, and choice cards in two columns from 40rem. */
  layout?: 'column' | 'row';
  /** The chosen option's value, for a controlled group. */
  value?: string;
  /** The option chosen at first, for an uncontrolled group. Preselect the safest or most common one. */
  defaultValue?: string;
  /** Called with the chosen option's value. */
  onChange?: (value: string) => void;
  /** The form name of the radios. One is made up when it is left out. */
  name?: string;
  /** Dims every option. */
  disabled?: boolean;
  /** Asks the form to refuse submission until an option is chosen. */
  required?: boolean;
}

/**
 * A radio group picks exactly one option from a few that are all shown: plain radios for short lists,
 * or choice cards for choices that need explaining, such as a delivery method or a plan.
 */
export const RadioGroup = React.forwardRef<HTMLElement, RadioGroupProps>(function RadioGroup(
  { options, label, variant = 'radio', layout = 'column', value, defaultValue, onChange, name, disabled, required, className, ...rest },
  ref,
) {
  const auto = useUid('radio');
  const [current, setCurrent] = useControlled(value, defaultValue ?? '', onChange);
  const choice = variant === 'choice';
  const listClass = choice ? cx('tray-choices', layout === 'row' && 'tray-choices--two') : cx('tray-radio-group', layout === 'row' && 'tray-radio-group--row');
  const items = options.map((o) => (
    <label key={o.value} className={choice ? 'tray-choice' : 'tray-radio'}>
      <input
        type="radio"
        name={name ?? auto}
        value={o.value}
        checked={current === o.value}
        disabled={disabled || o.disabled}
        required={required}
        onChange={() => setCurrent(o.value)}
      />
      <span className="tray-radio__ring" />
      {choice ? (
        <>
          <span className="tray-choice__text">
            <b>{o.label}</b>
            {o.description != null ? <span>{o.description}</span> : null}
          </span>
          {o.end != null ? <span className="tray-choice__end">{o.end}</span> : null}
        </>
      ) : (
        <span>{o.label}</span>
      )}
    </label>
  ));
  if (label != null) {
    return (
      <fieldset ref={ref as React.Ref<HTMLFieldSetElement>} className={className} {...rest}>
        <legend className="tray-label">{label}</legend>
        <div className={listClass}>{items}</div>
      </fieldset>
    );
  }
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} role="radiogroup" className={cx(listClass, className)} {...rest}>
      {items}
    </div>
  );
});
RadioGroup.displayName = 'RadioGroup';
