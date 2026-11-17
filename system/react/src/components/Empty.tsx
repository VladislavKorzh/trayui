import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { Icon } from './Icon';

export interface EmptyProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The icon in the tile above the title: 'inbox' for a first use, 'search' for no results, 'circle-check' for all done. Leave it out in a small empty row of a table. */
  icon?: IconSource;
  /** What is missing, as a statement that does not blame the person: "No orders yet", "Nothing matches "truffle"". */
  title: React.ReactNode;
  /** One sentence on what will appear here, or how to get results: "When someone orders a jar it shows up here." */
  description?: React.ReactNode;
  /** One or two buttons that make the first item or clear the filter. One primary at most; none when the work is done. */
  actions?: React.ReactNode;
  /** 'md' sets the title in `subtitle` type as a heading (the default). 'sm' sets it in `control` type as a paragraph, for an empty row inside a table or a small card. */
  size?: 'md' | 'sm';
  /** The heading level of the title at size 'md'. Default 3. */
  headingLevel?: 2 | 3 | 4;
}

/**
 * An empty state fills the place where content will be: an icon tile, a title, one sentence, and the action that makes the first item.
 * Put it in the card or table it replaces, so the page does not jump when content arrives.
 */
export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { icon, title, description, actions, size = 'md', headingLevel = 3, className, children, ...rest },
  ref,
) {
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <div ref={ref} className={cx('tray-empty', className)} {...rest}>
      {icon ? (
        <span className="tray-empty__icon">
          <Icon name={icon} />
        </span>
      ) : null}
      <div className="tray-empty__text">
        {size === 'sm' ? <p className="control">{title}</p> : <H className="subtitle">{title}</H>}
        {description != null ? <p>{description}</p> : null}
      </div>
      {children}
      {actions != null ? <div className="tray-empty__actions">{actions}</div> : null}
    </div>
  );
});
Empty.displayName = 'Empty';
