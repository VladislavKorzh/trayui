'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx, useBehaviour, useForwardedRef } from '../lib/util';
import { Icon } from './Icon';

/** How a service is doing now. */
export type UptimeState = 'working' | 'slow' | 'down';

/** A day that was not normal: 'degraded' draws a short ink bar, 'down' a full ink bar. */
export type UptimeDay = 'degraded' | 'down';

/** The words of the key under the bars. */
export interface UptimeLegend {
  /** Default "A normal day". */
  normal?: string;
  /** Default "Slow for part of the day". */
  degraded?: string;
  /** Default "Down for part of the day". */
  down?: string;
}

export interface UptimeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The service: "Order API", "Courier tracking". */
  name: React.ReactNode;
  /** How it is doing now, with an icon and a word: 'working' ('circle-check', in success green, the default), 'slow' ('circle-alert') or 'down' ('circle-x', in danger red). */
  state?: UptimeState;
  /** The state in words when it needs more than one: "Slow since 09:40". Default "Working", "Slow" or "Down". */
  stateText?: React.ReactNode;
  /** How many days the bars cover, one bar per day, oldest first. Default 90. Show the same number for every service on the page. */
  days?: number;
  /** The days that were not normal, by how many days ago (0 is today): `{ 12: 'degraded', 47: 'down' }`. */
  incidents?: Record<number, UptimeDay>;
  /** The share of time it was up, in the middle of the foot: "99.94% up". Never round 99.94% up to 100%. */
  share?: React.ReactNode;
  /** The start of the foot. Default "90 days ago" (from `days`). */
  from?: React.ReactNode;
  /** The end of the foot. Default "Today". */
  to?: React.ReactNode;
  /** Adds the key under the foot: what a grey, a short and a full bar mean. Show it once, under the last service. Pass words to change its labels. */
  legend?: boolean | UptimeLegend;
}

const STATES: Record<UptimeState, { icon: IconSource; text: string; className?: string }> = {
  working: { icon: 'circle-check', text: 'Working', className: 'tray-success' },
  slow: { icon: 'circle-alert', text: 'Slow' },
  down: { icon: 'circle-x', text: 'Down', className: 'tray-danger' },
};

/**
 * Uptime shows whether a service is working now and how it did over the last 90 days: its state in words, a bar per day, and the share of time it was up.
 * Stack one per service on a status page and list the incidents under them; the bars are hidden from screen readers, so the words carry the state.
 */
export const Uptime = React.forwardRef<HTMLDivElement, UptimeProps>(function Uptime(
  { name, state = 'working', stateText, days = 90, incidents, share, from, to = 'Today', legend, className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef(forwarded);
  const marks = JSON.stringify(incidents ?? {});
  const bars = `${days}:${marks}`;
  // the uptime behaviour draws the bars once per element: other days or incidents get a new element (the key) and are drawn again
  useBehaviour(ref, [bars]);
  const s = STATES[state];
  const words = typeof legend === 'object' ? legend : {};
  return (
    <div ref={ref} className={cx('tray-uptime', className)} {...rest}>
      <div className="tray-uptime__head">
        <span>{name}</span>
        <span className={cx('tray-uptime__state', s.className)}>
          <Icon name={s.icon} size="sm" />
          {stateText ?? s.text}
        </span>
      </div>
      <div key={bars} className="tray-uptime__bars" data-tray="uptime" data-days={days} data-incidents={marks} />
      <div className="tray-uptime__foot">
        <span>{from ?? `${days} days ago`}</span>
        {share != null ? <span>{share}</span> : null}
        <span>{to}</span>
      </div>
      {legend ? (
        <ul className="tray-uptime__key" role="list">
          <li>
            <i />
            {words.normal ?? 'A normal day'}
          </li>
          <li>
            <i data-s="degraded" />
            {words.degraded ?? 'Slow for part of the day'}
          </li>
          <li>
            <i data-s="down" />
            {words.down ?? 'Down for part of the day'}
          </li>
        </ul>
      ) : null}
    </div>
  );
});
Uptime.displayName = 'Uptime';
