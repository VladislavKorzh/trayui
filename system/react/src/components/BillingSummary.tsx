import * as React from 'react';
import { cx } from '../lib/util';
import { Badge } from './Badge';
import { Card } from './Card';

/** One fact of the next invoice: a name and its value. */
export interface BillingFact {
  /** The name, in soft ink: "Date", "Shop plan", "Two extra seats", "Paid with". */
  label: React.ReactNode;
  /** The value: "1 December 2026", "$29.00", "Card ending 4242". */
  value: React.ReactNode;
  /** Sets the value in tabular figures, for amounts. */
  numeric?: boolean;
  /** Sets the value in bold, for the total. */
  strong?: boolean;
}

export interface BillingSummaryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The plan the workspace is on, in `title` type: "Shop". */
  plan: React.ReactNode;
  /** The small line above the plan's name. Default "Current plan". */
  planLabel?: React.ReactNode;
  /**
   * The state of the subscription in a word or two: "Active", "Trial, 5 days left", "Payment failed", "Cancels on 1 December".
   * Text is drawn as a yellow Badge; pass an element to draw it yourself.
   */
  status?: React.ReactNode;
  /** The price, in `headline` size: "$29". */
  price: React.ReactNode;
  /** What the price is per, set small after it: "a month". */
  per?: React.ReactNode;
  /** When it renews or ends, with the date in full and the year: "Renews on 1 December 2026." */
  renewal?: React.ReactNode;
  /** The buttons on the ink card: `<Button size="md" href="/billing/plans">Change plan</Button>` and `<Button variant="ghost" size="md">Cancel plan</Button>`. */
  actions?: React.ReactNode;
  /** The facts of the next invoice, shown on a grey card beside the ink one: date, lines, total, card. */
  invoice?: BillingFact[];
  /** The title of the invoice card. Default "Next invoice". */
  invoiceTitle?: React.ReactNode;
  /** Small buttons under the invoice: `<Button variant="quiet" size="sm">Change the card</Button>`, `<Button variant="ghost" size="sm">All invoices</Button>`. */
  invoiceActions?: React.ReactNode;
  /** The heading level of the plan's name and the invoice title. Default 2. */
  headingLevel?: 2 | 3;
}

/**
 * The billing summary opens the billing page: the plan the workspace is on, what it costs and when it renews on an ink card, with the facts of the next invoice beside it.
 * The two cards sit side by side from 20rem each and stack below that. Put the usage of the plan in a Usage Meter, not on the ink card.
 */
export const BillingSummary = React.forwardRef<HTMLDivElement, BillingSummaryProps>(function BillingSummary(
  {
    plan,
    planLabel = 'Current plan',
    status,
    price,
    per,
    renewal,
    actions,
    invoice,
    invoiceTitle = 'Next invoice',
    invoiceActions,
    headingLevel = 2,
    className,
    ...rest
  },
  ref,
) {
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const badge = typeof status === 'string' || typeof status === 'number' ? <Badge tone="accent">{status}</Badge> : status;
  return (
    <div ref={ref} className={cx('tray-billing', className)} {...rest}>
      <Card as="section" tone="inverse" footer={actions}>
        <div className="tray-card__head">
          <div>
            <p className="tray-soft">{planLabel}</p>
            <H className="title">{plan}</H>
          </div>
          {badge}
        </div>
        {/* the HTML preview spaces the renewal line from the price by hand; a small stack does it here */}
        <div className="tray-stack tray-stack--sm">
          <p className="tray-plan__price">
            {price}
            {per != null ? <small>{per}</small> : null}
          </p>
          {renewal != null ? <p className="tray-soft">{renewal}</p> : null}
        </div>
      </Card>
      {invoice ? (
        <Card as="section" title={invoiceTitle} headingLevel={headingLevel} footer={invoiceActions}>
          <dl className="tray-dl tray-dl--plain">
            {invoice.map((fact, i) => (
              <div key={i}>
                <dt>{fact.label}</dt>
                <dd className={fact.numeric ? 'tray-num' : undefined}>{fact.strong ? <b>{fact.value}</b> : fact.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ) : null}
    </div>
  );
});
BillingSummary.displayName = 'BillingSummary';
