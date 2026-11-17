import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';
import { Icon } from './Icon';
import { Tabs, type TabItem } from './Tabs';

export interface PageHeaderMeta {
  /** One fact, a few words: "Customer since March 2025", "14 orders", "Kyiv". */
  label: React.ReactNode;
  /** A small icon before it: 'calendar', 'inbox', 'map-pin'. */
  icon?: IconSource;
}

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The page's name, in `title` type: the name of the thing, "Orders", "Dana Kovalenko". Never "Manage your orders". */
  title: React.ReactNode;
  /** One line about the page, in soft ink under the title. */
  description?: React.ReactNode;
  /** Something beside the title, such as a Badge with the thing's status: `<Badge>Regular</Badge>`. */
  badge?: React.ReactNode;
  /** A back link above the title, with a left arrow: `{ label: 'Customers', href: '/customers' }`. Give it or `breadcrumb`, never both. */
  back?: BreadcrumbItem;
  /** A Breadcrumb above the title, from the top level down. Give it or `back`, never both, and do not repeat it in the TopBar. */
  breadcrumb?: BreadcrumbItem[];
  /** The page's buttons at the end edge, small (`size="sm"`), the one yellow button last. More than three go into a DropdownMenu. */
  actions?: React.ReactNode;
  /** One line of facts under the row, in muted caption type, each with an optional small icon. */
  meta?: PageHeaderMeta[];
  /** Tabs for the page's sections under the header, as links: `{ value, label, href, count }`. */
  tabs?: TabItem[];
  /** The current tab, by `value`. Leave it out to let the tabs keep their own. */
  tab?: string;
  /** The tab current at first, when `tab` is left out. Default: the first. */
  defaultTab?: string;
  /** Called with the tab's `value` when a tab is clicked. */
  onTabChange?: (value: string) => void;
  /** Names the tabs for screen readers. Default: the title, when it is text. */
  tabsLabel?: string;
  /** The heading level of the title. Default 1: it is the page's heading. */
  headingLevel?: 1 | 2 | 3;
}

/**
 * The page header names the page: its title in `title` type, one line about it, the page's actions at the end edge, and tabs for its sections underneath.
 * Put it first in the page, in an AppShell's content column; the page's one yellow button lives here, not in the top bar.
 */
export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(function PageHeader(
  { title, description, badge, back, breadcrumb, actions, meta, tabs, tab, defaultTab, onTabChange, tabsLabel, headingLevel = 1, className, ...rest },
  ref,
) {
  const H = `h${headingLevel}` as 'h1';
  const heading = <H className="title">{title}</H>;
  return (
    <div ref={ref} className={cx('tray-pagehead', className)} {...rest}>
      {back ? (
        <a className="tray-back" href={back.href} onClick={back.onClick}>
          <Icon name="arrow-left" flip />
          {back.label}
        </a>
      ) : breadcrumb && breadcrumb.length ? (
        <Breadcrumb items={breadcrumb} />
      ) : null}
      <div className="tray-pagehead__row">
        <div className="tray-pagehead__text">
          {badge != null ? (
            <div className="tray-pagehead__title">
              {heading}
              {badge}
            </div>
          ) : (
            heading
          )}
          {description != null ? <p>{description}</p> : null}
        </div>
        {actions != null ? <div className="tray-pagehead__actions">{actions}</div> : null}
      </div>
      {meta && meta.length ? (
        <p className="tray-pagehead__meta">
          {meta.map((m, i) => (
            <span key={i}>
              {m.icon ? <Icon name={m.icon} size="sm" /> : null}
              {m.label}
            </span>
          ))}
        </p>
      ) : null}
      {tabs && tabs.length ? (
        <Tabs
          mode="navigation"
          items={tabs}
          value={tab}
          defaultValue={defaultTab}
          onChange={onTabChange}
          label={tabsLabel ?? (typeof title === 'string' ? title : undefined)}
        />
      ) : null}
    </div>
  );
});
PageHeader.displayName = 'PageHeader';
