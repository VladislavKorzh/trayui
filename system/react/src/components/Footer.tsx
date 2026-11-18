import * as React from 'react';
import { cx } from '../lib/util';

/** One link of the footer. */
export interface FooterLink {
  /** The page's name: "Pricing", "Contact us". */
  label: React.ReactNode;
  /** Where it goes. */
  href: string;
}

/** One column of links, with its own short heading. */
export interface FooterColumn {
  /** The column's heading, one word in muted ink: "Product", "Help". It also names the column's `<nav>` for screen readers. */
  title: string;
  /** The links, two to five. */
  links: FooterLink[];
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** The product's name, set as the wordmark: "Counter". */
  brand: React.ReactNode;
  /** Where the wordmark leads. Default "/". */
  brandHref?: string;
  /** One line about the product under the wordmark: "The order desk for small farms." */
  tagline?: React.ReactNode;
  /** The link columns, up to four: the pages a visitor looks for at the end (pricing, help, contact). Not the whole navigation. */
  columns: FooterColumn[];
  /** The copyright line at the start of the bottom row: "© 2026 Counter". */
  copyright?: React.ReactNode;
  /** The legal links at the end of the bottom row: privacy, terms, cookies. */
  legal?: FooterLink[];
  /** Something more for the bottom row, after the legal links: a theme toggle or a language select. */
  extra?: React.ReactNode;
  /** Centres the footer in the page's container (`tray-container`), when it sits straight on the page. Default false. */
  contained?: boolean;
}

/**
 * The footer ends every public page: the name and a line about the product, the site's links in columns, and a last row for the legal lines.
 * It sits on the page over a hairline, never on a coloured card. From 56rem up the columns stand beside the brand; below, two columns of links under it.
 */
export const Footer = React.forwardRef<HTMLElement, FooterProps>(function Footer(
  { brand, brandHref = '/', tagline, columns, copyright, legal, extra, contained, className, ...rest },
  ref,
) {
  return (
    <footer ref={ref} className={cx('tray-footer', contained && 'tray-container', className)} {...rest}>
      <div className="tray-footer__top">
        <div className="tray-footer__brand">
          <a className="tray-wordmark" href={brandHref}>
            {brand}
          </a>
          {tagline != null ? <p>{tagline}</p> : null}
        </div>
        {columns.map((col, i) => (
          <nav key={i} className="tray-footer__col" aria-label={col.title}>
            <h3>{col.title}</h3>
            {col.links.map((l, k) => (
              <a key={k} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        ))}
      </div>
      {copyright != null || (legal && legal.length) || extra != null ? (
        <div className="tray-footer__bottom">
          {copyright != null ? <p>{copyright}</p> : null}
          {legal && legal.length ? (
            <ul className="tray-footer__legal" role="list">
              {legal.map((l, k) => (
                <li key={k}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          ) : null}
          {extra}
        </div>
      ) : null}
    </footer>
  );
});
Footer.displayName = 'Footer';
