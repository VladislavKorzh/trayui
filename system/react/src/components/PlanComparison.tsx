import * as React from 'react';
import { cx, useUid } from '../lib/util';
import { wideRegion } from '../lib/data';
import { Icon } from './Icon';

/** One column of the comparison: a plan, in the order of the pricing cards. */
export interface ComparisonPlan {
  /** The plan's name, in the head: "Shop". */
  name: React.ReactNode;
  /** The price under the name, small: "$29 a month". */
  price?: React.ReactNode;
  /** Lays a tray behind the whole column, rounded at the head and the foot: the plan you recommend, or the one the person is on. One column at most. */
  featured?: boolean;
}

/**
 * What a plan has of a feature. `true` is a check ("Included"), `false` a dash in hint ink ("Not included"),
 * a number is a limit in tabular figures (1000 reads "1,000"), and text is the limit in words: "Five", "Two years".
 */
export type ComparisonValue = boolean | number | string;

/** One row of the comparison: a feature and what each plan has of it. */
export interface ComparisonRow {
  /** The feature, as the row's head: "Orders a month", "Courier tracking". */
  feature: React.ReactNode;
  /** One value per plan, in the order of `plans`. */
  values: ComparisonValue[];
  /** Starts a group of rows under this heading, above the row: "Orders", "Team", "Data". */
  group?: React.ReactNode;
}

export interface PlanComparisonProps extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'children'> {
  /** The plans, as columns, in the order of the pricing cards. */
  plans: ComparisonPlan[];
  /** The features, as rows. Put `group` on the first row of each group. */
  rows: ComparisonRow[];
  /** The hidden head of the feature column, for screen readers. Default "Feature". */
  featureLabel?: string;
  /** The hidden word after a check. Default "Included". */
  includedLabel?: string;
  /** The hidden word after a dash. Default "Not included". */
  notIncludedLabel?: string;
  /** A BCP 47 tag for number values. Default 'en-US': "1,000". */
  locale?: string;
  /** The table's name, a `<caption>` hidden from sight that a screen reader says: "The plans compared". Or name it with `aria-label`. */
  caption?: React.ReactNode;
}

/**
 * The plan comparison is the full table under the pricing cards: every feature as a row, every plan as a column, a check, a dash or a number in each cell.
 * It sits in a wrapper that scrolls sideways on a phone, a region named as the table is; `className`, `aria-label` and the ref go to the `<table>`.
 */
export const PlanComparison = React.forwardRef<HTMLTableElement, PlanComparisonProps>(function PlanComparison(
  { plans, rows, featureLabel = 'Feature', includedLabel = 'Included', notIncludedLabel = 'Not included', locale = 'en-US', caption, className, ...rest },
  ref,
) {
  const feat = (i: number) => (plans[i]?.featured ? '' : undefined);
  const cell = (v: ComparisonValue | undefined, i: number) => {
    if (v === true || v === false) {
      return (
        <td key={i} data-off={v ? undefined : ''} data-featured={feat(i)}>
          <Icon name={v ? 'check' : 'minus'} />
          <span className="tray-vh">{v ? includedLabel : notIncludedLabel}</span>
        </td>
      );
    }
    if (typeof v === 'number') {
      return (
        <td key={i} className="tray-num" data-featured={feat(i)}>
          {v.toLocaleString(locale)}
        </td>
      );
    }
    return (
      <td key={i} data-featured={feat(i)}>
        {v}
      </td>
    );
  };
  const captionId = useUid('compare-caption');
  // A <tbody> per group: a group's heading (scope="rowgroup") then names its own rows, not every row after it.
  const sections: { start: number; rows: typeof rows }[] = [];
  rows.forEach((row, r) => {
    if (!sections.length || row.group != null) sections.push({ start: r, rows: [] });
    sections[sections.length - 1].rows.push(row);
  });
  return (
    // A comparison is wider than a phone: its wrap is a region named as the table is, which the keyboard reaches and scrolls.
    <div className="tray-table-wrap" {...wideRegion(caption != null ? captionId : undefined, rest)}>
      <table ref={ref} className={cx('tray-compare', className)} {...rest}>
        {caption != null ? (
          <caption className="tray-vh" id={captionId}>
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr>
            <th scope="col">
              <span className="tray-vh">{featureLabel}</span>
            </th>
            {plans.map((p, i) => (
              <th key={i} scope="col" data-featured={feat(i)}>
                {p.name}
                {p.price != null ? <small>{p.price}</small> : null}
              </th>
            ))}
          </tr>
        </thead>
        {sections.map((section) => (
          <tbody key={section.start}>
            {section.rows.map((row, k) => (
              <React.Fragment key={section.start + k}>
                {row.group != null ? (
                  <tr className="tray-compare__group">
                    <th scope="rowgroup">{row.group}</th>
                    {plans.map((_, i) => (
                      <td key={i} data-featured={feat(i)} />
                    ))}
                  </tr>
                ) : null}
                <tr>
                  <th scope="row">{row.feature}</th>
                  {plans.map((_, i) => cell(row.values[i], i))}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
});
PlanComparison.displayName = 'PlanComparison';
