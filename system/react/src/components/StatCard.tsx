'use client';
import * as React from 'react';
import { cx, useBehaviour, useForwardedRef } from '../lib/util';
import { Icon } from './Icon';

/** How a figure moved since the period it is compared with. */
export interface StatTrend {
  /** The change in a few characters: "+14%", "−2", "+4 min", "+3 points". */
  value: React.ReactNode;
  /** Which way it moved: 'up' draws the 'trending-up' icon, 'down' the 'trending-down' icon. The icon carries the direction, never the colour alone. */
  direction: 'up' | 'down';
  /**
   * Whether that direction is welcome: 'good' colours the change in success green, 'bad' in danger red.
   * Leave it out when it is neither. Refunds going down are 'good'; time to pack going up is 'bad'.
   */
  tone?: 'good' | 'bad';
}

export interface StatCardProps extends React.HTMLAttributes<HTMLElement> {
  /** What the figure counts, in a few words: "Revenue this month", "Refunds". */
  label: React.ReactNode;
  /** The figure, in `title` size with tabular numerals: "$18,240", "842", "61%". */
  value: React.ReactNode;
  /** A unit set small after the figure: "min", "kg". */
  unit?: React.ReactNode;
  /** How the figure moved: `{ value: '+14%', direction: 'up', tone: 'good' }`. Shown at the start of the foot, with its icon. */
  trend?: StatTrend;
  /** The rest of the foot: what the change is compared with ("than in October"), or one short sentence when there is no trend. */
  foot?: React.ReactNode;
  /** The figures of the last weeks, oldest first: `[9, 11, 10, 13, 12, 15, 14, 18]`. Draws a small line under the foot. It is decoration: the figure and the trend carry the meaning. */
  spark?: number[];
  /**
   * 'tray' sits on the fill of its ground, grey on the page (the default). 'island' is the single yellow card of a row;
   * 'inverse' an ink one. A trend on either keeps the colour of the card's text.
   */
  tone?: 'tray' | 'island' | 'inverse';
  /** Makes the whole card a link to its report; an 'arrow-up-right' icon then sits at the end of the label. */
  href?: string;
}

/**
 * A stat card shows one number that matters: what it counts, the figure, how it moved, and optionally the line of its last weeks.
 * Set several side by side in `<div className="tray-stats">`, four at most in a row; they share the width and wrap.
 */
export const StatCard = React.forwardRef<HTMLElement, StatCardProps>(function StatCard(
  { label, value, unit, trend, foot, spark, tone = 'tray', href, className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef<HTMLElement>(forwarded);
  const points = spark && spark.length > 1 ? spark.join(',') : undefined;
  // the spark behaviour draws once per element: a new set of points gets a new element (the key) and is wired again
  useBehaviour(ref, [points]);
  const classes = cx('tray-stat', tone === 'island' && 'tray-island', tone === 'inverse' && 'tray-inverse', className);
  const body = (
    <>
      <p className="tray-stat__label">
        {label}
        {href !== undefined ? <Icon name="arrow-up-right" size="sm" /> : null}
      </p>
      <p className="tray-stat__value">
        {value}
        {unit != null ? <small>{unit}</small> : null}
      </p>
      {trend || foot != null ? (
        <p className="tray-stat__foot">
          {trend ? (
            <span className="tray-trend" data-tone={trend.tone}>
              <Icon name={trend.direction === 'down' ? 'trending-down' : 'trending-up'} size="sm" />
              {trend.value}
            </span>
          ) : null}
          {foot}
        </p>
      ) : null}
      {points ? <div key={points} data-tray="spark" data-points={points} /> : null}
    </>
  );
  if (href !== undefined) {
    const { style, ...anchorRest } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a ref={ref as React.RefObject<HTMLAnchorElement>} className={classes} href={href} style={{ textDecoration: 'none', ...style }} {...anchorRest}>
        {body}
      </a>
    );
  }
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={classes} {...rest}>
      {body}
    </div>
  );
});
StatCard.displayName = 'StatCard';
