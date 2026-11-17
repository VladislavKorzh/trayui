import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx, useBehaviour } from '../lib/util';
import { useMergedRef } from '../lib/menus';
import { Icon } from './Icon';

/** A two-line link in a panel: a title, one line under it, an icon before it. */
export interface NavigationPanelLink {
  /** The page's title: "Jars", "Gift boxes". */
  label: string;
  /** One short line under the title: "30, 50 and 100 g". */
  description?: string;
  /** An icon before the title. */
  icon?: IconSource;
  /** Where it goes. */
  href: string;
}

/** The featured card at the start of a panel: the one thing the section is about. */
export interface NavigationFeature {
  /** The card's title: "White caviar". */
  title: string;
  /** One sentence under the title. */
  description?: string;
  /** A small muted line at the end, such as a price: "From $39". */
  meta?: string;
  /** Where the card goes. */
  href: string;
}

/** The roomy panel under an entry: an optional featured card on the start side, and a list of two-line links. */
export interface NavigationPanel {
  /** The featured card. Leave it out for a panel that is the list alone. */
  feature?: NavigationFeature;
  /** The two-line links, three or four. */
  links: NavigationPanelLink[];
}

/** One entry of the strip: a link, or a button that opens a panel of links. */
export interface NavigationLink {
  /** One or two words: "Shop", "Field notes". */
  label: string;
  /** Where the link goes. Leave it out when the entry opens a `panel`. */
  href?: string;
  /** Marks the section the page belongs to, in solid ink (aria-current="page"). One at a time. */
  current?: boolean;
  /** Turns the entry into a button that opens a roomy panel under it: an optional featured card and a list of two-line links. */
  panel?: NavigationPanel;
}

export interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> {
  /** The wordmark at the start: the product's name, "Perly". */
  brand: React.ReactNode;
  /** Where the wordmark goes. Default '/'. */
  brandHref?: string;
  /** The strip of links, seven at most. */
  links: NavigationLink[];
  /** The end of the row: a theme toggle and one small primary button (`<Button size="sm">`). */
  actions?: React.ReactNode;
  /** The label of the entry whose panel is shown open at first; also holds it open in a static picture, until a click outside. */
  defaultOpen?: string;
}

/**
 * The navigation menu is the header of a site: the wordmark, a strip of links, and one small primary action.
 * A link with children opens a roomy panel on click, Enter or Space (never on hover alone); the panel is a disclosure, so Tab moves through its links and Escape closes it.
 */
export const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu(
  { brand, brandHref = '/', links, actions, defaultOpen, className, ...rest },
  forwarded,
) {
  const ref = React.useRef<HTMLElement | null>(null);
  const setRef = useMergedRef(ref, forwarded);
  // The popover behaviour owns each panel's `hidden` from here on: React only sets the first state.
  const [initiallyOpen] = React.useState(defaultOpen);
  useBehaviour(ref);

  return (
    <header ref={setRef} className={cx('tray-nav', className)} {...rest}>
      <a className="tray-wordmark" href={brandHref}>
        {brand}
      </a>
      <ul className="tray-nav__links">
        {links.map((link, i) => {
          if (!link.panel) {
            return (
              <li key={i}>
                <a className="tray-tab" href={link.href} aria-current={link.current ? 'page' : undefined}>
                  {link.label}
                </a>
              </li>
            );
          }
          const open = link.label === initiallyOpen;
          const list = (
            <div className="tray-list">
              {link.panel.links.map((l, j) => (
                <a key={j} className="tray-option tray-option--two" href={l.href}>
                  {l.icon ? <Icon name={l.icon} /> : null}
                  <span className="tray-option__text">
                    <b>{l.label}</b>
                    {l.description ? <small>{l.description}</small> : null}
                  </span>
                </a>
              ))}
            </div>
          );
          const feature = link.panel.feature;
          return (
            <li key={i} className="tray-anchor" data-tray="popover">
              <button className="tray-tab" type="button">
                {link.label}
                <Icon name="chevron-down" size="sm" />
              </button>
              <div className="tray-pop tray-pop--roomy" data-open={open ? '' : undefined} hidden={open ? undefined : true}>
                {feature ? (
                  <div className="tray-nav__panel">
                    <a className="tray-card tray-stack tray-stack--sm" href={feature.href}>
                      <p className="subtitle">{feature.title}</p>
                      {feature.description ? <p className="tray-soft">{feature.description}</p> : null}
                      {feature.meta ? <p className="caption tray-muted">{feature.meta}</p> : null}
                    </a>
                    {list}
                  </div>
                ) : (
                  list
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {actions != null ? <div className="tray-nav__actions">{actions}</div> : null}
    </header>
  );
});
NavigationMenu.displayName = 'NavigationMenu';
