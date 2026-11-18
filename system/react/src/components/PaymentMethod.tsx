'use client';
import * as React from 'react';
import { cx, useBehaviour, useForwardedRef, useUid } from '../lib/util';
import { Badge } from './Badge';
import { Button } from './Button';
import { Field } from './Field';
import { Input } from './Input';
import { InputGroup } from './InputGroup';
import { RadioGroup } from './RadioGroup';

/** A card on file, shown as one choice. */
export interface SavedCard {
  /** Tells the card apart; it is the choice's value: 'card_4242'. */
  id: string;
  /** The last four digits: "4242". Never more. */
  last4: string;
  /** The expiry date as MM/YY: "08/27". */
  expires: string;
  /** The card network in words: "Visa". The title then reads "Visa ending 4242". Never draw a logo you do not hold. */
  brand?: string;
  /** Marks the card that is charged by default, with a "Default" badge at the end. */
  isDefault?: boolean;
  /** Marks a card past its date: its second line reads "Expired in 03/26" and it cannot be chosen. */
  expired?: boolean;
  /** Replaces the second line, to say what else is wrong with the card: "Declined on 1 October". */
  note?: React.ReactNode;
  /** Dims the choice; it cannot be picked. Say why in `note`. */
  disabled?: boolean;
}

/** What the new card form sends: the fields as typed, the number grouped in fours. */
export interface NewCardValues {
  /** "4242 4242 4242 4242" */
  number: string;
  /** "08/27" */
  expiry: string;
  /** "123" */
  cvc: string;
}

export interface PaymentMethodProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'defaultValue' | 'onSubmit' | 'title'> {
  /**
   * 'saved' lists the cards on file as Radio Group choices and marks the one that is charged (the default).
   * 'new' is the form that takes a new card in three fields, on a grey card.
   */
  mode?: 'saved' | 'new';
  /** With 'saved': the cards on file. */
  cards?: SavedCard[];
  /** With 'saved': the question above the cards. Default "Pay with". */
  label?: React.ReactNode;
  /** With 'saved': the chosen card's `id`, for a controlled list. */
  value?: string;
  /** With 'saved': the card chosen at first. Default: the card marked `isDefault`. */
  defaultValue?: string;
  /** With 'saved': called with the chosen card's `id`. */
  onChange?: (id: string) => void;
  /** With 'saved': small buttons under the cards: `<Button variant="quiet" size="sm" icon="plus">Add a card</Button>`. */
  actions?: React.ReactNode;
  /** The form name of the radios ('saved') or the form's name ('new'). */
  name?: string;
  /** With 'new': the title of the form. Default "New card". */
  title?: React.ReactNode;
  /** With 'new': values the fields start with. */
  defaultValues?: Partial<NewCardValues>;
  /** With 'new': the line under the fields. Default "The three digits on the back of the card." */
  hint?: React.ReactNode;
  /** With 'new': the words of the button that sends the form. Default "Save the card". */
  submitLabel?: React.ReactNode;
  /** With 'new': called with the three fields when the form is sent. Check the number on the server: the fields only format it. */
  onSave?: (card: NewCardValues) => void;
  /** With 'new': adds a ghost button beside the save button, and calls this when it is pressed. */
  onCancel?: () => void;
  /** With 'new': the words of the ghost button. Default "Cancel". */
  cancelLabel?: React.ReactNode;
  /** With 'new': shows a spinner on the save button while the card is checked. */
  saving?: boolean;
}

/**
 * Payment method lists the cards on file as choices, marks the one that is charged, and takes a new card in three fields.
 * Use mode 'saved' for the list and mode 'new' for the form; on a billing page they usually sit side by side.
 */
export const PaymentMethod = React.forwardRef<HTMLElement, PaymentMethodProps>(function PaymentMethod(
  {
    mode = 'saved',
    cards = [],
    label = 'Pay with',
    value,
    defaultValue,
    onChange,
    actions,
    name,
    title = 'New card',
    defaultValues,
    hint = 'The three digits on the back of the card.',
    submitLabel = 'Save the card',
    onSave,
    onCancel,
    cancelLabel = 'Cancel',
    saving,
    className,
    ...rest
  },
  forwarded,
) {
  const ref = useForwardedRef<HTMLElement>(forwarded);
  const hintId = useUid('card-hint');
  // the mask behaviour formats the number and the expiry date as they are typed
  useBehaviour(ref, [mode]);

  if (mode === 'new') {
    const submit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const f = e.currentTarget.elements;
      const read = (n: string) => (f.namedItem(n) as HTMLInputElement | null)?.value ?? '';
      onSave?.({ number: read('cc-number'), expiry: read('cc-exp'), cvc: read('cc-csc') });
    };
    return (
      <form
        ref={ref as React.RefObject<HTMLFormElement>}
        className={cx('tray-card', className)}
        name={name}
        onSubmit={submit}
        {...(rest as React.FormHTMLAttributes<HTMLFormElement>)}
      >
        <div className="tray-card__head">
          <div>
            <h3 className="subtitle">{title}</h3>
          </div>
        </div>
        <div className="tray-fields">
          <Field label="Card number" full>
            <InputGroup
              icon="credit-card"
              name="cc-number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              defaultValue={defaultValues?.number}
              data-tray="mask"
              data-mask="card"
            />
          </Field>
          <Field label="Expires">
            <Input name="cc-exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" defaultValue={defaultValues?.expiry} data-tray="mask" data-mask="expiry" />
          </Field>
          <Field label="Security code">
            <Input name="cc-csc" inputMode="numeric" autoComplete="cc-csc" placeholder="3 digits" defaultValue={defaultValues?.cvc} aria-describedby={hint != null ? hintId : undefined} />
          </Field>
        </div>
        {hint != null ? (
          <p className="tray-field__hint" id={hintId}>
            {hint}
          </p>
        ) : null}
        <div className="tray-card__foot">
          <Button size="md" type="submit" busy={saving}>
            {submitLabel}
          </Button>
          {onCancel ? (
            <Button variant="ghost" size="md" onClick={onCancel}>
              {cancelLabel}
            </Button>
          ) : null}
        </div>
      </form>
    );
  }

  const chosen = defaultValue ?? cards.find((c) => c.isDefault && !c.expired && !c.disabled)?.id ?? cards.find((c) => !c.expired && !c.disabled)?.id;
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={cx('tray-stack', className)} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
      <RadioGroup
        label={label}
        variant="choice"
        name={name}
        value={value}
        defaultValue={chosen}
        onChange={onChange}
        options={cards.map((c) => ({
          value: c.id,
          label: `${c.brand ?? 'Card'} ending ${c.last4}`,
          description: c.note ?? (c.expired ? <span className="tray-danger">Expired in {c.expires}</span> : `Expires ${c.expires}`),
          end: c.isDefault ? <Badge>Default</Badge> : undefined,
          disabled: c.expired || c.disabled,
        }))}
      />
      {actions != null ? <div className="tray-row tray-row--sm">{actions}</div> : null}
    </div>
  );
});
PaymentMethod.displayName = 'PaymentMethod';
