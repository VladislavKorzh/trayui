import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

/** One event of an activity feed: who did what, and when. */
export interface ActivityEvent {
  /** Tells the event apart, for React keys. Default: its position. */
  id?: string;
  /**
   * The event as one sentence in the past tense, actor first. Set the actor and the object in bold or as links; the rest stays soft:
   * `<><b>Oksana Franko</b> changed the delivery day of <a href="/orders/PL-20418">PL-20418</a> to Tuesday.</>`
   */
  text: React.ReactNode;
  /** When it happened, as shown: the hour for today ("10:42"), the date for older days ("13 November, 19:47"). */
  time: React.ReactNode;
  /** The machine-readable time, "2026-11-15T10:42": the time is then written as a `<time>` element. Give it whenever you have it. */
  dateTime?: string;
  /** A person did it: their initials on a 32px Avatar, "OF". */
  initials?: string;
  /** The system did it: an icon on a small tile, such as 'credit-card' for a payment, 'truck', 'key', 'user-plus'. Used when there are no initials. */
  icon?: IconSource;
  /** What changed, on a small fill under the time: an amount, a quoted note, the old and new values. */
  detail?: React.ReactNode;
  /** Starts a new day with this heading above the event: "Today", "Yesterday", "13 November". */
  day?: React.ReactNode;
}

export interface ActivityFeedProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'children'> {
  /** The events, newest first. Put `day` on the first event of each day. */
  items: ActivityEvent[];
}

/**
 * An activity feed is the record of who did what, newest first: a mark, one sentence and the time for each event, joined by a hairline.
 * Use it for the history of a workspace or of one order. A conversation is a Message list; steps a machine took are a Trace.
 */
export const ActivityFeed = React.forwardRef<HTMLOListElement, ActivityFeedProps>(function ActivityFeed({ items, className, ...rest }, ref) {
  return (
    <ol ref={ref} className={cx('tray-feed', className)} role="list" {...rest}>
      {items.map((ev, i) => {
        const key = ev.id ?? String(i);
        return (
          <React.Fragment key={key}>
            {ev.day != null ? <li className="tray-feed__day">{ev.day}</li> : null}
            <li>
              {ev.initials ? (
                <Avatar size="xs" initials={ev.initials} />
              ) : (
                <span className="tray-feed__mark">
                  <Icon name={ev.icon ?? 'circle'} size="sm" />
                </span>
              )}
              <div className="tray-feed__body">
                <p>{ev.text}</p>
                <p className="tray-feed__meta">{ev.dateTime ? <time dateTime={ev.dateTime}>{ev.time}</time> : ev.time}</p>
                {ev.detail != null ? <p className="tray-feed__detail">{ev.detail}</p> : null}
              </div>
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
});
ActivityFeed.displayName = 'ActivityFeed';
