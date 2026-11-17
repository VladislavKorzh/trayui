import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { usePopAnchor } from '../lib/shell';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { ToggleGroup } from './ToggleGroup';

export interface NotificationItem {
  /** Tells the notification apart: `onRead` reports these. */
  id: string;
  /** Who did it, in bold at the start of the line: "Dana Kovalenko", "The courier", "Invoice CN-0042". */
  actor?: React.ReactNode;
  /** What they did to which thing, after the actor: "placed order PL-20431, two jars of 50 g." */
  text: React.ReactNode;
  /** When, in muted type under the line: "4 minutes ago", "Yesterday, 09:12", "12 November". */
  time?: React.ReactNode;
  /** The page of the thing it is about. Every notification should lead somewhere. */
  href?: string;
  /** The actor's initials on the tile: "DK". */
  initials?: string;
  /** An icon on the tile in place of initials, for the product or a thing: 'truck', 'credit-card'. */
  icon?: IconSource;
  /** A photo on the tile. */
  src?: string;
  /** Not read yet: full-ink text, an ink dot at the end, the hidden word "Unread", and one more on the bell's count. */
  unread?: boolean;
  /** Called when the notification is opened, before its link is followed. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface NotificationCenterProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'title' | 'children'> {
  /** The notifications, newest first: a screenful at most, with a link to the full history in `footer`. */
  items: NotificationItem[];
  /** Called with the ids just marked read: the one opened, or every unread one on "Mark all as read". Save the state on the server here. */
  onRead?: (ids: string[]) => void;
  /** The panel's heading, also the bell's name for screen readers ("Notifications, 2 unread"). Default 'Notifications'. */
  title?: string;
  /** The button in the head that marks everything read. Default 'Mark all as read'. */
  readAllLabel?: string;
  /** The All / Unread switch under the head. Default true. */
  filter?: boolean;
  /** Shown when the list is empty, or nothing is unread under "Unread". Default 'Nothing unread.' */
  emptyText?: React.ReactNode;
  /** The panel's foot, under a hairline: a link to the settings or the full history, `<Button variant="link" href="/settings/notifications">Notification settings</Button>`. */
  footer?: React.ReactNode;
  /** 'end' (the default) lines the panel up with the bell's end edge, for the end of the top bar; 'start' with its start edge. */
  align?: 'start' | 'end';
  /** Opens or closes the panel from outside. The bell, a click outside and Escape still work and report through `onOpenChange`. */
  open?: boolean;
  /** Whether it starts open: also holds it open in a static picture, until a click outside. Default false. */
  defaultOpen?: boolean;
  /** Called with `true` when the panel opens and `false` when it closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * The notification centre is the panel behind the bell: what happened while you were away, newest first, unread ones marked and counted on the bell.
 * Put it in the TopBar's `end`. Write each line as who did what to which thing, and never notify people about their own actions.
 */
export const NotificationCenter = React.forwardRef<HTMLSpanElement, NotificationCenterProps>(function NotificationCenter(
  {
    items,
    onRead,
    title = 'Notifications',
    readAllLabel = 'Mark all as read',
    filter = true,
    emptyText = 'Nothing unread.',
    footer,
    align = 'end',
    open,
    defaultOpen,
    onOpenChange,
    className,
    ...rest
  },
  forwarded,
) {
  const { setRef, initiallyOpen } = usePopAnchor<HTMLSpanElement>('popover', forwarded, { open, defaultOpen, onOpenChange });
  // What was read here, until the items say so themselves.
  const [read, setRead] = React.useState<ReadonlySet<string>>(() => new Set());
  const [view, setView] = React.useState('all');

  const isUnread = (n: NotificationItem) => !!n.unread && !read.has(n.id);
  const unread = items.filter(isUnread);
  const shown = view === 'unread' ? unread : items;

  const markRead = (ids: string[]) => {
    if (!ids.length) return;
    setRead((prev) => new Set([...prev, ...ids]));
    onRead?.(ids);
  };

  return (
    <span ref={setRef} className={cx('tray-anchor', className)} data-tray="popover" {...rest}>
      <Button variant="quiet" size="sm" icon="bell" aria-label={unread.length ? `${title}, ${unread.length} unread` : title} />
      <span className="tray-pip">{unread.length ? unread.length : null}</span>
      <div
        className={cx('tray-pop', align === 'end' && 'tray-pop--end', 'tray-notices')}
        data-open={initiallyOpen ? '' : undefined}
        hidden={initiallyOpen ? undefined : true}
      >
        <div className="tray-notices__head">
          <h2>{title}</h2>
          <Button variant="ghost" size="xs" disabled={!unread.length} onClick={() => markRead(unread.map((n) => n.id))}>
            {readAllLabel}
          </Button>
        </div>
        {filter ? (
          <div className="tray-notices__bar">
            <ToggleGroup
              size="sm"
              aria-label="Show"
              value={view}
              onChange={setView}
              items={[
                { value: 'all', label: 'All' },
                { value: 'unread', label: 'Unread' },
              ]}
            />
          </div>
        ) : null}
        {shown.length ? (
          <ul className="tray-notices__list">
            {shown.map((n) => {
              const on = isUnread(n);
              const body = (
                <>
                  <Avatar size="sm" initials={n.initials} icon={n.icon} src={n.src} />
                  <span className="tray-notice__body">
                    <span>
                      {n.actor != null ? (
                        <>
                          <b>{n.actor}</b>{' '}
                        </>
                      ) : null}
                      {n.text}
                    </span>
                    {n.time != null ? <span className="tray-notice__meta">{n.time}</span> : null}
                  </span>
                  <span className="tray-notice__mark">{on ? <span className="tray-vh">Unread</span> : null}</span>
                </>
              );
              const props = {
                className: 'tray-notice',
                'data-unread': on ? '' : undefined,
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                  n.onClick?.(e);
                  if (on) markRead([n.id]);
                },
              };
              return (
                <li key={n.id}>
                  {n.href !== undefined ? (
                    <a href={n.href} {...props}>
                      {body}
                    </a>
                  ) : (
                    <button type="button" {...props}>
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="tray-list__empty">{emptyText}</p>
        )}
        {footer != null ? <div className="tray-notices__foot">{footer}</div> : null}
      </div>
    </span>
  );
});
NotificationCenter.displayName = 'NotificationCenter';
