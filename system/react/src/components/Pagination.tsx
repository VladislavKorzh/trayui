import * as React from 'react';
import { useControlled } from '../lib/util';
import { Icon } from './Icon';

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** How many pages there are. */
  pageCount: number;
  /** The current page, counted from 1. Leave it out to let the control keep its own page. */
  page?: number;
  /** The page shown at first, when `page` is not controlled. Default 1. */
  defaultPage?: number;
  /** Called with the new page when a page, Previous or Next is chosen. */
  onPageChange?: (page: number) => void;
  /**
   * The compact form: Previous, "Page 2 of 12", Next. Use it when there is no room for the numbers.
   * Default false: the numbers, showing the first page, the last, the current one and one neighbour on each side, with gaps between.
   */
  compact?: boolean;
  /** Builds the link of a page, such as `(p) => '?page=' + p`. With it the pages are links; without it they are buttons. */
  href?: (page: number) => string;
  /** The text of the step back. Default 'Previous'. In the compact form it becomes the label "Previous page". */
  previousLabel?: string;
  /** The text of the step forward. Default 'Next'. In the compact form it becomes the label "Next page". */
  nextLabel?: string;
  /** The status of the compact form. Default: "Page 2 of 12". */
  status?: (page: number, pageCount: number) => React.ReactNode;
  /** Names the control for screen readers. Default 'Pages'. */
  label?: string;
}

/** The pages to show: the first, the last, the current one and its neighbours; a gap that would hide a single page shows the page instead. */
function visible(page: number, count: number): (number | 'gap')[] {
  const keep = [...new Set([1, page - 1, page, page + 1, count])].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  keep.forEach((p, i) => {
    const before = keep[i - 1];
    if (before !== undefined && p - before === 2) out.push(p - 1);
    else if (before !== undefined && p - before > 2) out.push('gap');
    out.push(p);
  });
  return out;
}

/**
 * Pagination moves through a long list one page at a time: 44px pages, the current one in solid ink, with Previous and Next on the resting fill.
 * Use it for lists of more than about twenty items, and say near it how many there are ("1–20 of 236").
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { pageCount, page, defaultPage = 1, onPageChange, compact, href, previousLabel = 'Previous', nextLabel = 'Next', status, label = 'Pages', className, ...rest },
  ref,
) {
  const count = Math.max(1, Math.floor(pageCount));
  const [raw, setPage] = useControlled(page, defaultPage, onPageChange);
  const current = Math.min(count, Math.max(1, raw));

  const target = (to: number, className: string, content: React.ReactNode, extra: { disabled?: boolean; current?: boolean; label?: string } = {}) => {
    const a11y = { 'aria-current': extra.current ? ('page' as const) : undefined, 'aria-label': extra.label };
    const go = extra.disabled ? undefined : () => setPage(to);
    if (href) {
      return (
        <a className={className} href={extra.disabled ? undefined : href(to)} aria-disabled={extra.disabled ? true : undefined} onClick={go} {...a11y}>
          {content}
        </a>
      );
    }
    return (
      <button className={className} type="button" disabled={extra.disabled} onClick={go} {...a11y}>
        {content}
      </button>
    );
  };

  const step = (dir: -1 | 1) => {
    const to = current + dir;
    const name = dir < 0 ? previousLabel : nextLabel;
    const icon = <Icon name={dir < 0 ? 'chevron-left' : 'chevron-right'} flip />;
    const content = compact ? icon : dir < 0 ? <>{icon}{name}</> : <>{name}{icon}</>;
    return <li>{target(to, 'tray-page tray-page--step', content, { disabled: to < 1 || to > count, label: compact ? `${name} page` : undefined })}</li>;
  };

  return (
    <nav ref={ref} aria-label={label} className={className} {...rest}>
      <ul className="tray-pages">
        {step(-1)}
        {compact ? (
          <li>
            <span className="tray-pages__status">{status ? status(current, count) : `Page ${current} of ${count}`}</span>
          </li>
        ) : (
          visible(current, count).map((p, i) =>
            p === 'gap' ? (
              <li key={'gap' + i}>
                <span className="tray-page tray-page--gap" aria-hidden="true">
                  …
                </span>
              </li>
            ) : (
              <li key={p}>{target(p, 'tray-page', p, { current: p === current })}</li>
            ),
          )
        )}
        {step(1)}
      </ul>
    </nav>
  );
});
Pagination.displayName = 'Pagination';
