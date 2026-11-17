import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { Icon } from './Icon';

export interface ItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The row's name, on one line: "Order PL-20418", "Oksana Franko". */
  title: React.ReactNode;
  /** One line of detail under the title, in muted ink: "Two jars of 50 g, out for delivery". */
  text?: React.ReactNode;
  /** An icon in a 48px tile at the start (36px at size 'sm'): 'truck', 'file', 'bell'. */
  icon?: IconSource;
  /** Something else at the start instead of the icon tile, as it is: an Avatar, or a picture in `<span className="tray-item__media">`. */
  media?: React.ReactNode;
  /** One thing at the end: a value ("$9", set in tabular figures when it is plain text), a Badge, a switch, a small ghost button, or a 'chevron-right' Icon when the row goes somewhere. */
  end?: React.ReactNode;
  /** 'md' (the default) or 'sm', the compact row for short lists in a side panel. */
  size?: 'md' | 'sm';
  /** Makes the whole row a link. It darkens slightly on hover. */
  href?: string;
  /** With `href`: where to open the link. */
  target?: string;
  /** With `href`: the link's relation, such as 'noopener'. */
  rel?: string;
  /**
   * The element that holds the row. 'li' (the default) for a row inside `<ul className="tray-items">` (filled rows, 8px apart)
   * or `<ul className="tray-items tray-items--ruled">` (no fill, hairlines between rows). 'div' for a single row on its own.
   */
  as?: 'li' | 'div';
}

/**
 * An item is one row of a list: a media tile, a title with a line of detail, and something at the end.
 * Put items in `<ul className="tray-items">` for grey rows, or `<ul className="tray-items tray-items--ruled">` for hairline rows in a long list on the page.
 * With `href` or `onClick` the whole row is a link or a button.
 */
export const Item = React.forwardRef<HTMLElement, ItemProps>(function Item(
  { title, text, icon, media, end, size = 'md', href, target, rel, as = 'li', className, onClick, ...rest },
  ref,
) {
  const classes = cx('tray-item', size === 'sm' && 'tray-item--sm', className);
  const body = (
    <>
      {media ??
        (icon ? (
          <span className="tray-item__media">
            <Icon name={icon} />
          </span>
        ) : null)}
      <span className="tray-item__body">
        <span className="tray-item__title">{title}</span>
        {text != null ? <span className="tray-item__text">{text}</span> : null}
      </span>
      {end != null ? <span className={cx('tray-item__end', (typeof end === 'string' || typeof end === 'number') && 'tray-num')}>{end}</span> : null}
    </>
  );
  let row: React.ReactElement;
  if (href !== undefined) {
    row = (
      <a ref={ref as React.Ref<HTMLAnchorElement>} className={classes} href={href} target={target} rel={rel} onClick={onClick} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {body}
      </a>
    );
  } else if (onClick) {
    row = (
      <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={classes} onClick={onClick} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {body}
      </button>
    );
  } else {
    const El = as as 'li';
    return (
      <El ref={ref as React.Ref<HTMLLIElement>} className={classes} {...rest}>
        {body}
      </El>
    );
  }
  return as === 'li' ? <li>{row}</li> : row;
});
Item.displayName = 'Item';
