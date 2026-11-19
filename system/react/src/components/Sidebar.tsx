'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { useStaticMode } from '../lib/static';
import { cx, useControlled, useUid } from '../lib/util';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Icon } from './Icon';

export interface SidebarItem {
  /** What the item says: one or two words. "Orders", "Field notes". It is also the item's name in the collapsed rail. */
  label: string;
  /** Names the item for `value`, `defaultValue` and `onChange`. Default: its label. */
  value?: string;
  /** The icon before the label. Give every top-level item one, so the collapsed rail still works. Second-level items take none. */
  icon?: IconSource;
  /** Where the item leads. Without it the item is a button. */
  href?: string;
  /** A number in a small round badge at the end of the row, such as 12 orders waiting. */
  count?: React.ReactNode;
  /** A second level under the item, indented and without icons. Two levels at most. */
  items?: SidebarItem[];
  /** Called when the item is clicked, before it becomes current: for a router that handles links itself. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface SidebarGroup {
  /** The group's name in small muted type, such as "Shop" or "Farm". Leave it out for the first group of a short sidebar. */
  label?: React.ReactNode;
  /** The group's items, the most used first. */
  items: SidebarItem[];
}

export interface SidebarUser {
  /** The person's name. */
  name: React.ReactNode;
  /** One line under the name: their role or e-mail. "Farm manager". */
  role?: React.ReactNode;
  /** One or two initials for the avatar: "OF". */
  initials?: string;
  /** A photo for the avatar, in place of the initials. */
  src?: string;
}

export interface SidebarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'defaultValue'> {
  /** The groups of items, from top to bottom. */
  groups: SidebarGroup[];
  /** The top row: usually the wordmark, `<a className="tray-wordmark" href="/">Perly</a>`, or a workspace switcher. It hides in the collapsed rail. */
  head?: React.ReactNode;
  /** Removes the head's side padding, for a workspace switcher that should reach the edges of the tray. */
  flushHead?: boolean;
  /** The person signed in, shown at the foot with an avatar, their name and a line under it. It hides in the collapsed rail. */
  user?: SidebarUser;
  /** More content at the foot, after `user`: a usage meter, a link to the plan. */
  foot?: React.ReactNode;
  /** The current item, by `value` (an item's label unless it sets its own). It is drawn in solid ink and marked `aria-current="page"`. Leave it out to let the sidebar keep its own. */
  value?: string;
  /** The item current at first, when `value` is not controlled. */
  defaultValue?: string;
  /** Called with the item's value when an item is clicked. */
  onChange?: (value: string) => void;
  /** Adds a button at the end of the head that collapses the sidebar to a rail of icons and back. */
  collapsible?: boolean;
  /** Whether the sidebar is collapsed to a rail of icons. Control it to collapse from elsewhere, such as a button in the top bar. */
  collapsed?: boolean;
  /** Whether it starts collapsed, when `collapsed` is not controlled. Default false. */
  defaultCollapsed?: boolean;
  /** Called with the new state when the sidebar collapses or expands. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Names the navigation for screen readers. Default 'Main'. */
  label?: string;
}

/**
 * A sidebar is the navigation of an application: a tray down the side with groups of links, and the person's account at its foot.
 * Use it for an app with many destinations; it collapses to a rail of icons. For a site with a few pages, use a header navigation instead.
 */
export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { groups, head, flushHead, user, foot, value, defaultValue, onChange, collapsible, collapsed, defaultCollapsed = false, onCollapsedChange, label = 'Main', id, className, ...rest },
  ref,
) {
  const auto = useUid('sidebar');
  const sideId = id ?? auto;
  const [current, setCurrent] = useControlled<string | undefined>(value, defaultValue, onChange as ((v: string | undefined) => void) | undefined);
  const [rail, setRail] = useControlled(collapsed, defaultCollapsed, onCollapsedChange);
  // static mode: bundle.js's sidebar-toggle behaviour collapses it (data-collapsed) and renames the button, in place of the state above
  const wired = useStaticMode();

  const item = (it: SidebarItem, sub: boolean) => {
    const v = it.value ?? it.label;
    const props = {
      className: 'tray-sidebar__item',
      'aria-current': v === current ? ('page' as const) : undefined,
      // in the rail the label and the count are hidden from sight only, so the item keeps its name from them ("Orders 12")
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        it.onClick?.(e);
        setCurrent(v);
      },
    };
    const body = sub ? (
      it.label
    ) : (
      <>
        {it.icon ? <Icon name={it.icon} /> : null}
        <span>{it.label}</span>
        {it.count != null ? <Badge count>{it.count}</Badge> : null}
      </>
    );
    return it.href !== undefined ? (
      <a href={it.href} {...props}>
        {body}
      </a>
    ) : (
      <button type="button" {...props}>
        {body}
      </button>
    );
  };

  return (
    <nav ref={ref} id={sideId} className={cx('tray-sidebar', className)} aria-label={label} data-collapsed={rail ? '' : undefined} {...rest}>
      {head != null || collapsible ? (
        <div className="tray-sidebar__head" style={flushHead ? { padding: 0 } : undefined}>
          {head}
          {collapsible ? (
            <Button
              variant="ghost"
              size="xs"
              icon="panel-left"
              aria-label={rail ? 'Expand the sidebar' : 'Collapse the sidebar'}
              aria-controls={sideId}
              aria-expanded={!rail}
              data-tray={wired ? 'sidebar-toggle' : undefined}
              onClick={() => setRail(!rail)}
            />
          ) : null}
        </div>
      ) : null}
      {groups.map((g, gi) => (
        <div key={gi} className="tray-sidebar__group">
          {g.label != null ? <p className="tray-sidebar__label">{g.label}</p> : null}
          {g.items.map((it, i) => (
            <React.Fragment key={(it.value ?? it.label) + i}>
              {item(it, false)}
              {it.items && it.items.length ? (
                <ul className="tray-sidebar__sub">
                  {it.items.map((s, si) => (
                    <li key={(s.value ?? s.label) + si}>{item(s, true)}</li>
                  ))}
                </ul>
              ) : null}
            </React.Fragment>
          ))}
        </div>
      ))}
      {user || foot != null ? (
        <div className="tray-sidebar__foot">
          {user ? (
            <div className="tray-sidebar__user">
              <Avatar size="sm" initials={user.initials} src={user.src} />
              <div>
                <p className="label">{user.name}</p>
                {user.role != null ? <p className="caption tray-muted">{user.role}</p> : null}
              </div>
            </div>
          ) : null}
          {foot}
        </div>
      ) : null}
    </nav>
  );
});
Sidebar.displayName = 'Sidebar';
