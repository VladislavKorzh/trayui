import * as React from 'react';
import { cx } from '../lib/util';

export type CardTone = 'tray' | 'accent' | 'inverse' | 'leaf' | 'panel';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /**
   * 'tray' is the grey resting card (the default). 'accent' is the one yellow card in a group; it keeps the light palette in the dark theme.
   * 'inverse' is the one ink card that may anchor a group. 'leaf' is the single card about where a product comes from.
   * 'panel' is a white panel with 28px corners, to sit inside a card.
   */
  tone?: CardTone;
  /** The card's title, set in `subtitle` type in the head. */
  title?: React.ReactNode;
  /** One sentence under the title, in soft ink. */
  description?: React.ReactNode;
  /** Something at the end of the head: a small button or a badge. */
  action?: React.ReactNode;
  /** Buttons under the content. */
  footer?: React.ReactNode;
  /** Removes the padding, for a picture or a table that should reach the edges. */
  flush?: boolean;
  /** The heading level of the title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  /** The element: 'div' (the default), 'section', 'article', 'aside' or 'figure'. Use `href` for a card that is a link. */
  as?: 'div' | 'section' | 'article' | 'aside' | 'figure';
  /** Makes the whole card a link. */
  href?: string;
}

/**
 * A card is a tray: a grey surface with 40px corners that groups what belongs together. Fill alone sets it apart: no border, no shadow.
 * A card tells its children what they sit on, so inputs and quiet buttons inside it turn white by themselves.
 */
export const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
  { tone = 'tray', title, description, action, footer, flush, headingLevel = 3, as = 'div', href, className, children, ...rest },
  ref,
) {
  const classes = cx(tone === 'panel' ? 'tray-panel' : 'tray-card', tone !== 'tray' && tone !== 'panel' && `tray-card--${tone}`, flush && 'tray-card--flush', className);
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const head =
    title != null || action != null ? (
      <div className="tray-card__head">
        <div>
          {title != null ? <H className="subtitle">{title}</H> : null}
          {description != null ? <p className="tray-soft">{description}</p> : null}
        </div>
        {action}
      </div>
    ) : null;
  const body = (
    <>
      {head}
      {children}
      {footer != null ? <div className="tray-card__foot">{footer}</div> : null}
    </>
  );
  if (href !== undefined) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {body}
      </a>
    );
  }
  const El = as as 'div';
  return (
    <El ref={ref as React.Ref<HTMLDivElement>} className={classes} {...rest}>
      {body}
    </El>
  );
});
Card.displayName = 'Card';
