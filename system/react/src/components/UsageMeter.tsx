import * as React from 'react';
import { cx } from '../lib/util';
import { Icon } from './Icon';

/** One allowance of a plan: what is counted, how much is used, and the limit. */
export interface UsageLimit {
  /** What is counted, in a few words: "Orders this month", "Team seats". It also names the meter for screen readers. */
  label: string;
  /** The meter's name for screen readers when the label is shortened, as in the sidebar: "Orders this month" for "Orders". Default: `label`. */
  ariaLabel?: string;
  /** How much is used: 842. Default 0. */
  used?: number;
  /** The plan's limit: 1000. Leave it out for an allowance without a limit: the row then shows `valueText` in words and no bar. */
  limit?: number;
  /** The unit after the numbers, with no space needed: "GB" gives "1.2 of 5 GB". */
  unit?: string;
  /** The value at the end of the row. Default: both numbers, "842 of 1,000"; "Unlimited on this plan" without a limit. Always print both numbers, never only a percentage. */
  valueText?: React.ReactNode;
  /**
   * Marks a limit that is near: the value turns danger and the note takes a 'circle-alert' icon. The bar stays ink.
   * Default: on from 90% of the limit.
   */
  high?: boolean;
  /** One line under the bar. When the limit is near, say so in words and what to do: "Every seat is taken. Add seats to invite more people." */
  note?: React.ReactNode;
}

export interface UsageMeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The allowances, one row each, in the order of the plan. Show only the limits the plan has. */
  items: UsageLimit[];
  /** 'md' (the default) is the block for a billing page or a Card; 'sm' is the compact block for the foot of the sidebar: one limit and a link to upgrade. */
  size?: 'md' | 'sm';
  /** With size 'sm': what comes under the meter, usually `<Button variant="link" href="/billing/plans">Upgrade the plan</Button>`. */
  action?: React.ReactNode;
  /** A BCP 47 tag for the numbers in the default value text. Default 'en-US': "1,000". */
  locale?: string;
}

/**
 * A usage meter shows how much of a plan's allowance is used: a Progress bar per limit with `role="meter"`, the numbers in words, and a note once a limit is near.
 * Put it in a Card with the plan's name and when the count starts again; the compact size sits in the foot of the sidebar.
 */
export const UsageMeter = React.forwardRef<HTMLDivElement, UsageMeterProps>(function UsageMeter(
  { items, size = 'md', action, locale = 'en-US', className, ...rest },
  ref,
) {
  const fmt = (n: number) => n.toLocaleString(locale);
  return (
    <div ref={ref} className={cx('tray-usage', size === 'sm' && 'tray-usage--sm', className)} {...rest}>
      {items.map((item, i) => {
        if (item.limit === undefined) {
          return (
            <div key={i} className="tray-row tray-row--between">
              <span className="nav">{item.label}</span>
              <span className="tray-soft" style={{ fontSize: '1rem' }}>
                {item.valueText ?? 'Unlimited on this plan'}
              </span>
            </div>
          );
        }
        const limit = item.limit;
        const used = item.used ?? 0;
        const share = limit > 0 ? Math.max(0, Math.min(1, used / limit)) : 1;
        const high = item.high ?? share >= 0.9;
        const text = item.valueText ?? `${fmt(used)} of ${fmt(limit)}${item.unit ? ' ' + item.unit : ''}`;
        return (
          <div key={i} className="tray-progress" data-level={high ? 'high' : undefined}>
            <span className="tray-progress__name">{item.label}</span>
            <span className="tray-progress__value">{text}</span>
            <span
              className="tray-progress__bar"
              role="meter"
              aria-label={item.ariaLabel ?? item.label}
              aria-valuemin={0}
              aria-valuemax={limit}
              aria-valuenow={used}
              aria-valuetext={typeof text === 'string' ? text : undefined}
              style={{ '--tray-v': Math.round(share * 100) } as React.CSSProperties}
            />
            {item.note != null ? (
              <span className="tray-progress__note">
                {high ? <Icon name="circle-alert" size="sm" /> : null}
                {item.note}
              </span>
            ) : null}
          </div>
        );
      })}
      {action}
    </div>
  );
});
UsageMeter.displayName = 'UsageMeter';
