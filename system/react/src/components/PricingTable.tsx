'use client';
import * as React from 'react';
import { cx, useTrayEvent, useBehaviour, useControlled, useForwardedRef, useUid } from '../lib/util';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { Icon } from './Icon';
import { ToggleGroup } from './ToggleGroup';

/** The billing period the prices are shown for. */
export type BillingPeriod = 'monthly' | 'yearly';

/** A text that is the same for both periods ("$0", "forever"), or one text per period (`{ monthly: '$29', yearly: '$24' }`). */
export type PeriodText = string | { monthly: string; yearly: string };

/** One line of what a plan includes. */
export interface PlanFeature {
  /** The line, with the number in it: "1,000 orders a month", "Five people". */
  text: React.ReactNode;
  /** Marks something the plan lacks: a dash instead of a check, in muted ink. "No courier tracking". */
  off?: boolean;
}

/** One plan card of a pricing table. */
export interface PricingPlan {
  /** Tells the plan apart: 'shop'. It is passed to `onSelect`. */
  id: string;
  /** The plan's name: "Shop". */
  name: React.ReactNode;
  /** A short badge in ink beside the name, on the recommended plan: "Most chosen". */
  badge?: React.ReactNode;
  /** The price, the largest thing on the card: "$0", or `{ monthly: '$29', yearly: '$24' }` when it follows the period switch. */
  price: PeriodText;
  /** What the price is per, set small after it: "forever", or `{ monthly: 'a month', yearly: 'a month, billed yearly' }`. */
  per?: PeriodText;
  /** Who the plan is for, in one sentence: "For a farm that ships every day." */
  text?: React.ReactNode;
  /** The words of the plan's one button: "Start with Shop", "Start free". */
  action: React.ReactNode;
  /** Makes the button a link, such as '/signup?plan=shop'. Without it the button calls `onSelect`. */
  href?: string;
  /** What is included, one line each, the plan's limits as numbers. A plain string is an included line; `{ text, off: true }` is a line the plan lacks. */
  features: Array<string | PlanFeature>;
  /** The plan you recommend: its card is yellow and its button ink. One plan at most, and not the dearest by habit. */
  featured?: boolean;
}

export interface PricingTableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  /** The plans, two to four, cheapest first. */
  plans: PricingPlan[];
  /** The chosen period, for a controlled table. */
  period?: BillingPeriod;
  /** The period shown at first, for an uncontrolled table. Default 'monthly'. */
  defaultPeriod?: BillingPeriod;
  /** Called with the period the person chose. */
  onPeriodChange?: (period: BillingPeriod) => void;
  /** Shows the Monthly / Yearly switch above the cards. Default: on when a plan has a price per period. */
  switcher?: boolean;
  /** The words of the two segments. Default "Monthly" and "Yearly". */
  periodLabels?: { monthly?: string; yearly?: string };
  /** Names the switch for screen readers. Default "Billing period". */
  periodLabel?: string;
  /** A badge beside the switch that says what the longer period saves: "Two months free on yearly". */
  periodNote?: React.ReactNode;
  /** Called with a plan's `id` when its button is pressed and the plan has no `href`. */
  onSelect?: (id: string) => void;
  /** The heading level of the plan names. Default 3. */
  headingLevel?: 2 | 3 | 4;
}

function textFor(t: PeriodText, period: BillingPeriod): string {
  return typeof t === 'string' ? t : t[period];
}

function periodAttrs(t: PeriodText): Record<string, string> | undefined {
  return typeof t === 'string' ? undefined : { 'data-monthly': t.monthly, 'data-yearly': t.yearly };
}

/**
 * The pricing table sets the plans side by side: a card each with the name, the price as the largest thing on it, who it is for, one button, and what is included.
 * One plan is yellow. A Monthly / Yearly switch above the cards changes every price that has a text per period.
 */
export const PricingTable = React.forwardRef<HTMLDivElement, PricingTableProps>(function PricingTable(
  {
    plans,
    period: periodProp,
    defaultPeriod = 'monthly',
    onPeriodChange,
    switcher,
    periodLabels,
    periodLabel = 'Billing period',
    periodNote,
    onSelect,
    headingLevel = 3,
    className,
    ...rest
  },
  forwarded,
) {
  const ref = useForwardedRef(forwarded);
  const name = useUid('period');
  const [period, setPeriod] = useControlled<BillingPeriod>(periodProp, defaultPeriod, onPeriodChange);
  // React writes the texts of the period it first rendered; from then on the pricing behaviour owns them
  const first = React.useRef(period).current;
  const texts = JSON.stringify(plans.map((p) => [p.price, p.per ?? null]));
  // the behaviour reports the period too (tray:change); onPeriodChange comes from the switch, so the event is only kept from bubbling
  useTrayEvent(ref, 'change', undefined, { own: true });
  useBehaviour(ref);
  // a period set from outside, or new prices: the behaviour repaints on a change event from the checked radio. What was
  // last painted is kept, not whether the effect ran before: StrictMode runs it twice on mount, which is no change.
  const painted = React.useRef({ period, texts });
  React.useEffect(() => {
    if (painted.current.period === period && painted.current.texts === texts) return;
    painted.current = { period, texts };
    ref.current?.querySelector<HTMLInputElement>(`input[type="radio"][name="${name}"]:checked`)?.dispatchEvent(new Event('change', { bubbles: true }));
  }, [ref, name, period, texts]);
  const showSwitch = switcher ?? plans.some((p) => typeof p.price !== 'string' || (p.per != null && typeof p.per !== 'string'));
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <div ref={ref} className={cx(className)} data-tray="pricing" data-name={name} {...rest}>
      {showSwitch ? (
        <div className="tray-plans__bar">
          <ToggleGroup
            aria-label={periodLabel}
            name={name}
            value={period}
            onChange={(v) => {
              // the switch's own change event has already repainted the prices (and said them): nothing to send again
              painted.current = { period: v as BillingPeriod, texts };
              setPeriod(v as BillingPeriod);
            }}
            items={[
              { value: 'monthly', label: periodLabels?.monthly ?? 'Monthly' },
              { value: 'yearly', label: periodLabels?.yearly ?? 'Yearly' },
            ]}
          />
          {periodNote != null ? <Badge>{periodNote}</Badge> : null}
        </div>
      ) : null}
      <div className="tray-plans">
        {plans.map((plan) => (
          <Card key={plan.id} as="article" tone={plan.featured ? 'accent' : 'tray'} className="tray-plan">
            <div className="tray-plan__head">
              <H className="tray-plan__name">
                {plan.name}
                {plan.badge != null ? (
                  <>
                    {' '}
                    <Badge tone="ink">{plan.badge}</Badge>
                  </>
                ) : null}
              </H>
              <p className="tray-plan__price">
                <span key={JSON.stringify(plan.price)} {...periodAttrs(plan.price)}>
                  {textFor(plan.price, first)}
                </span>
                {plan.per != null ? (
                  <small key={JSON.stringify(plan.per)} {...periodAttrs(plan.per)}>
                    {textFor(plan.per, first)}
                  </small>
                ) : null}
              </p>
              {plan.text != null ? <p className="tray-plan__text">{plan.text}</p> : null}
            </div>
            <Button
              variant={plan.featured ? 'dark' : 'quiet'}
              size="md"
              href={plan.href}
              onClick={plan.href === undefined && onSelect ? () => onSelect(plan.id) : undefined}
            >
              {plan.action}
            </Button>
            <ul className="tray-ticks" role="list">
              {plan.features.map((f, i) => {
                const feat = typeof f === 'string' ? { text: f } : f;
                return (
                  <li key={i} data-off={feat.off ? '' : undefined}>
                    <Icon name={feat.off ? 'minus' : 'check'} />
                    {feat.text}
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
});
PricingTable.displayName = 'PricingTable';
