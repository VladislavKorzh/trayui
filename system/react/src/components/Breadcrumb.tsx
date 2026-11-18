'use client';
import * as React from 'react';
import { cx, useBehaviour, useForwardedRef } from '../lib/util';
import { Button } from './Button';
import { Icon } from './Icon';

export interface BreadcrumbItem {
  /** The level's name: the page title, shortened if needed. "Orders", "PL-20418". */
  label: React.ReactNode;
  /** Where the level leads. The last item is the current page and is never a link. */
  href?: string;
  /** Called when the level's link is clicked, for a router that handles links itself. */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** The levels from the top down. The last one is the current page. */
  items: BreadcrumbItem[];
  /**
   * Shortens a long trail: with more items than this, it keeps the first level and the last two,
   * and puts the levels between behind one "more" button that opens a menu of them. Default: no limit.
   */
  maxItems?: number;
  /** Shows only the parent level, as a back link with a left chevron: the form for a phone. */
  back?: boolean;
  /** Names the trail for screen readers. Default 'Breadcrumb'. */
  label?: string;
  /** The aria-label of the "more" button of a shortened trail. Default 'Show the levels between'. */
  moreLabel?: string;
  /** Below 48rem only the current page is shown, so a top bar fits a phone; the other levels stay in the trail for a screen reader. */
  fold?: boolean;
}

/**
 * A breadcrumb shows where a page sits and leads back up, one level per link.
 * Use it on pages below the top level; it shows hierarchy, never the steps of a flow or history.
 */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, maxItems, back, label = 'Breadcrumb', moreLabel = 'Show the levels between', fold, className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef(forwarded);
  const shorten = maxItems !== undefined && items.length > Math.max(maxItems, 3);
  const hidden = shorten ? items.slice(1, -2) : [];
  useBehaviour(ref, [hidden.length, back]);

  if (back) {
    const parent = items.length > 1 ? items[items.length - 2] : items[0];
    return (
      <a ref={ref as React.RefObject<HTMLAnchorElement>} className={cx('tray-back', className)} href={parent?.href} onClick={parent?.onClick} {...(rest as React.HTMLAttributes<HTMLAnchorElement>)}>
        <Icon name="chevron-left" flip />
        {parent?.label}
      </a>
    );
  }

  const level = (it: BreadcrumbItem, i: number, last: boolean) => (
    <li key={i}>
      {last ? (
        <span aria-current="page">{it.label}</span>
      ) : (
        <a href={it.href} onClick={it.onClick}>
          {it.label}
        </a>
      )}
    </li>
  );

  return (
    <nav ref={ref as React.RefObject<HTMLElement>} aria-label={label} className={className} {...rest}>
      <ol className={cx('tray-crumbs', fold && 'tray-crumbs--fold')}>
        {shorten ? (
          <>
            {level(items[0], 0, false)}
            <li>
              <span className="tray-anchor" data-tray="menu">
                <Button variant="ghost" size="xs" icon="ellipsis" aria-label={moreLabel} />
                <div className="tray-pop">
                  <div className="tray-list">
                    {hidden.map((it, i) => (
                      <a key={i} className="tray-option" role="menuitem" href={it.href} onClick={it.onClick}>
                        <span className="tray-option__text">{it.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </span>
            </li>
            {items.slice(-2).map((it, i) => level(it, items.length - 2 + i, i === 1))}
          </>
        ) : (
          items.map((it, i) => level(it, i, i === items.length - 1))
        )}
      </ol>
    </nav>
  );
});
Breadcrumb.displayName = 'Breadcrumb';
