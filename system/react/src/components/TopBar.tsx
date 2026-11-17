import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { ShellContext, initialsOf, useNarrow } from '../lib/shell';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';
import { Button } from './Button';
import { Icon } from './Icon';
import { Kbd } from './Kbd';

export interface TopBarAction {
  /** The button's icon: 'bell', 'circle-help', 'message-square'. */
  icon: IconSource;
  /** Names the button for screen readers: "Notifications", "Help". With a count, ", 2 unread" is added. */
  label: string;
  /** A count of things to read, in the yellow pip on the button's corner. 0 hides the pip. Leave it out for a button that never counts. */
  count?: number;
  /** What the button does. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Makes the button a link to this address. */
  href?: string;
}

export interface TopBarUser {
  /** The person's full name, read as "Account: Oksana Franko". */
  name: string;
  /** One or two initials on the avatar: "OF". Default: from the name. */
  initials?: string;
  /** A photo for the avatar, in place of the initials. */
  src?: string;
  /** What a click on the avatar does. For the account's menu, put a UserMenu in `end` instead of `user`. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface TopBarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Where the page sits, from the top level down; the last item is the current page. Leave it out and give `title` when the page has no parent. */
  breadcrumb?: BreadcrumbItem[];
  /** The page's name in place of the breadcrumb, in semibold nav type: "Order PL-20431". */
  title?: React.ReactNode;
  /** A back arrow before the title, as an icon link; `label` is read by screen readers only: `{ label: 'Back to orders', href: '/orders' }`. */
  back?: BreadcrumbItem;
  /** More at the start edge, after the breadcrumb or title: a status Badge. */
  children?: React.ReactNode;
  /** The search button's words, "Search orders": a button that looks like a field and opens the Command panel through `onSearch`. Leave it out for no search. */
  search?: string;
  /** The key that opens the search, shown in a Kbd at the end of the button and listened for on the page (outside fields). Default '/'. Empty for none. */
  searchKey?: string;
  /** Called when the search button is pressed, or the `searchKey` is typed outside a field: open the Command panel here. */
  onSearch?: () => void;
  /** Square icon buttons at the end, before `end`, each with an optional yellow count: at most three. */
  actions?: TopBarAction[];
  /** More at the end edge, after `actions`: a NotificationCenter, a UserMenu, or the page's own small buttons when the bar sits on a card. */
  end?: React.ReactNode;
  /** The person signed in, as an avatar button at the very end. Use a UserMenu in `end` instead when the avatar opens the account's menu. */
  user?: TopBarUser;
  /** Keeps the bar at the top while the page scrolls under it, filled with the colour of its ground. */
  sticky?: boolean;
  /** Inside an AppShell: the button at the start that collapses the sidebar to a rail, and below 56rem the one that opens it in a sheet. Default true. */
  sidebarToggle?: boolean;
  /** The heading level of `title`. Default 2. */
  headingLevel?: 1 | 2 | 3;
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

/**
 * The top bar is the row above the content: where you are at the start edge; search, notifications and the account at the end edge.
 * Use it as the `topbar` of an AppShell, or at the top of a card for a page of its own; the page's primary action belongs to the PageHeader, not here.
 */
export const TopBar = React.forwardRef<HTMLElement, TopBarProps>(function TopBar(
  { breadcrumb, title, back, children, search, searchKey = '/', onSearch, actions, end, user, sticky, sidebarToggle = true, headingLevel = 2, className, ...rest },
  ref,
) {
  const shell = React.useContext(ShellContext);
  const narrow = useNarrow();
  const H = `h${headingLevel}` as 'h2';

  // The search key opens the search from anywhere on the page but a field.
  const latest = React.useRef(onSearch);
  latest.current = onSearch;
  const listen = search != null && !!onSearch && searchKey.length === 1;
  React.useEffect(() => {
    if (!listen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== searchKey || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented || isTyping(e.target)) return;
      e.preventDefault();
      latest.current?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [listen, searchKey]);

  const toggle =
    shell && sidebarToggle ? (
      <>
        <Button variant="ghost" size="xs" icon="menu" className="tray-app__menu" aria-label="Open the menu" aria-haspopup="dialog" onClick={shell.openMenu} />
        {narrow ? null : (
          <Button
            variant="ghost"
            size="xs"
            icon="panel-left"
            aria-controls={shell.sidebarId}
            aria-expanded={!shell.collapsed}
            aria-label={shell.collapsed ? 'Expand the sidebar' : 'Collapse the sidebar'}
            onClick={() => shell.setCollapsed(!shell.collapsed)}
          />
        )}
      </>
    ) : null;

  const hasEnd = search != null || !!actions?.length || end != null || !!user;

  return (
    <header ref={ref} className={cx('tray-topbar', sticky && 'tray-topbar--sticky', className)} {...rest}>
      <div className="tray-topbar__start">
        {toggle}
        {back ? (
          <a className="tray-back" href={back.href} onClick={back.onClick}>
            <Icon name="arrow-left" flip />
            <span className="tray-vh">{back.label}</span>
          </a>
        ) : null}
        {breadcrumb && breadcrumb.length ? <Breadcrumb items={breadcrumb} /> : null}
        {title != null ? (
          <H className="nav" style={{ fontWeight: 600 }}>
            {title}
          </H>
        ) : null}
        {children}
      </div>
      {hasEnd ? (
        <div className="tray-topbar__end">
          {search != null ? (
            <button className="tray-topbar__search" type="button" aria-keyshortcuts={listen ? searchKey : undefined} onClick={() => onSearch?.()}>
              <Icon name="search" />
              <span>{search}</span>
              {searchKey ? <Kbd>{searchKey}</Kbd> : null}
            </button>
          ) : null}
          {actions?.map((a, i) => (
            // Always in an anchor: it places the pip, and keeps a bare icon button from shrinking beside the search.
            <span key={i} className="tray-anchor">
              <Button
                variant="quiet"
                size="sm"
                icon={a.icon}
                href={a.href}
                aria-label={a.count ? `${a.label}, ${a.count} unread` : a.label}
                onClick={a.onClick}
              />
              {a.count !== undefined ? <span className="tray-pip" aria-hidden="true">{a.count ? a.count : null}</span> : null}
            </span>
          ))}
          {end}
          {user ? (
            <button className="tray-avatar" type="button" aria-label={`Account: ${user.name}`} onClick={user.onClick}>
              {user.src ? <img src={user.src} alt="" /> : user.initials ?? initialsOf(user.name)}
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
});
TopBar.displayName = 'TopBar';
