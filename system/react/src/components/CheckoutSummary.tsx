'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx, useControlled, useUid } from '../lib/util';
import { Button } from './Button';
import { Card } from './Card';
import { Field } from './Field';
import { Icon } from './Icon';
import { InputGroup } from './InputGroup';

/** One line of what is being bought. */
export interface SummaryLine {
  /** The name at the start edge: "Shop plan", "Promo code AUTUMN", "VAT 20%". */
  label: React.ReactNode;
  /** A small line under the name that explains it: "12 months at $24, billed yearly". */
  detail?: React.ReactNode;
  /** The amount at the end edge, in tabular figures: "$288.00", "−$38.40" for a discount. */
  amount: React.ReactNode;
}

export interface CheckoutSummaryProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** 'card' is the grey card beside a payment form, with its title, the promo field and the pay button (the default). 'plain' is the lines and the total alone, for a single item. */
  variant?: 'card' | 'plain';
  /** The card's title, in `subtitle` type; it names the card for screen readers: "Your plan". */
  title?: React.ReactNode;
  /** The heading level of the title. Default 2. */
  headingLevel?: 2 | 3;
  /** What is being bought, line by line. Show tax and discounts as their own lines, so the total can be checked by adding. */
  lines: SummaryLine[];
  /** The total, in `subtitle` size over a hairline: "$414.72". */
  total: React.ReactNode;
  /** The words before the total. Default "Total today". */
  totalLabel?: React.ReactNode;
  /** Shows the promo code field: an Input Group with an "Apply" button. Hide it when few people have a code. */
  promo?: boolean;
  /** The promo code, for a controlled field. */
  promoCode?: string;
  /** The code the field starts with, for an uncontrolled field. */
  defaultPromoCode?: string;
  /** Called with the code as it is typed. */
  onPromoCodeChange?: (code: string) => void;
  /** Called with the code when "Apply" is pressed. */
  onApplyPromo?: (code: string) => void;
  /** The label over the promo field. Default "Promo code". */
  promoLabel?: string;
  /** The words of the button in the promo field. Default "Apply". */
  applyLabel?: string;
  /** The words of the pay button, which repeat the amount: "Pay $414.72". Without it there is no button. */
  payLabel?: React.ReactNode;
  /** Called when the pay button is pressed. */
  onPay?: () => void;
  /** 'button' (the default) or 'submit', when the pay button sends the payment form it belongs to. */
  payType?: 'button' | 'submit';
  /** With `payType="submit"`: the id of the form the pay button sends, when the summary sits outside it. */
  payForm?: string;
  /** Shows a spinner on the pay button while the payment runs. */
  paying?: boolean;
  /** One line under the button, centred and small: when the next charge comes, "Cancel any time". */
  note?: React.ReactNode;
  /** The icon before the note. Default 'lock'. */
  noteIcon?: IconSource;
}

/**
 * The checkout summary is the card beside a payment form: what is being bought, line by line, a place for a promo code, the total in the largest type, and the button that pays.
 * Its pay button is the one yellow button on the page.
 */
export const CheckoutSummary = React.forwardRef<HTMLElement, CheckoutSummaryProps>(function CheckoutSummary(
  {
    variant = 'card',
    title,
    headingLevel = 2,
    lines,
    total,
    totalLabel = 'Total today',
    promo,
    promoCode,
    defaultPromoCode = '',
    onPromoCodeChange,
    onApplyPromo,
    promoLabel = 'Promo code',
    applyLabel = 'Apply',
    payLabel,
    onPay,
    payType = 'button',
    payForm,
    paying,
    note,
    noteIcon = 'lock',
    className,
    ...rest
  },
  ref,
) {
  const titleId = useUid('summary');
  const [code, setCode] = useControlled(promoCode, defaultPromoCode, onPromoCodeChange);
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const body = (
    <>
      {title != null ? (
        <H className="subtitle" id={titleId}>
          {title}
        </H>
      ) : null}
      <ul className="tray-summary__lines" role="list">
        {lines.map((line, i) => (
          <li key={i} className="tray-summary__line">
            <span>
              {line.label}
              {line.detail != null ? <small>{line.detail}</small> : null}
            </span>
            <span>{line.amount}</span>
          </li>
        ))}
      </ul>
      {promo ? (
        // A visible label: a placeholder alone would name the field only while it is empty.
        <Field label={promoLabel}>
          <InputGroup
            size="sm"
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            action={{ label: applyLabel, onClick: () => onApplyPromo?.(code.trim()) }}
          />
        </Field>
      ) : null}
      <p className="tray-summary__total">
        <span>{totalLabel}</span>
        <span>{total}</span>
      </p>
      {payLabel != null ? (
        <Button block type={payType} form={payForm} busy={paying} onClick={onPay}>
          {payLabel}
        </Button>
      ) : null}
      {note != null ? (
        <p className="tray-summary__note">
          <Icon name={noteIcon} size="sm" />
          {note}
        </p>
      ) : null}
    </>
  );
  if (variant === 'plain') {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} className={cx('tray-summary', className)} {...rest}>
        {body}
      </div>
    );
  }
  return (
    <Card ref={ref} as="aside" className={cx('tray-summary', className)} aria-labelledby={title != null ? titleId : undefined} {...rest}>
      {body}
    </Card>
  );
});
CheckoutSummary.displayName = 'CheckoutSummary';
