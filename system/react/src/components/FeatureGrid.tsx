import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { Card } from './Card';
import { Icon } from './Icon';

/** One feature card: an icon tile, a title, two lines, and perhaps a piece of the product. */
export interface FeatureItem {
  /** The icon in the small tile at the top: 'inbox', 'truck', 'receipt-text', 'package', 'users'. */
  icon: IconSource;
  /** What the person can do, as a title: "One list for every order". */
  title: React.ReactNode;
  /** Two lines at most that say how: "From the shop, the phone and the market stall, in the order they must leave." */
  text: React.ReactNode;
  /** How many of the twelve columns the card takes from 56rem up: 4, 5, 6, 7 or 8. Make each row add up to 12, and give the most important feature the room. Default 6. */
  span?: 4 | 5 | 6 | 7 | 8;
  /** 'tray' (the default) or 'inverse', the one ink card that gives the grid its rhythm. Yellow stays with the page's call to action. */
  tone?: 'tray' | 'inverse';
  /** A small piece of the product at the bottom of the card, such as two rows of a list. Give it to the largest card only. */
  end?: React.ReactNode;
}

export interface FeatureGridProps extends React.HTMLAttributes<HTMLElement> {
  /** The features, three to six, the most important first. */
  features: FeatureItem[];
  /** The heading level of each card's title. Default 3, under the section's own heading. */
  headingLevel?: 2 | 3 | 4;
}

/**
 * The feature grid tells what the product does in a few cards of unequal size: each one a small icon tile, a title, and two lines.
 * It is the Bento grid with Cards; below 56rem every card takes the full width.
 */
export const FeatureGrid = React.forwardRef<HTMLElement, FeatureGridProps>(function FeatureGrid(
  { features, headingLevel = 3, className, ...rest },
  ref,
) {
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <section ref={ref} className={cx('tray-bento', className)} {...rest}>
      {features.map((f, i) => (
        <Card key={i} as="article" tone={f.tone === 'inverse' ? 'inverse' : 'tray'} className={`tray-feature tray-span-${f.span ?? 6}`}>
          <span className="tray-feature__icon">
            <Icon name={f.icon} />
          </span>
          <H className="subtitle">{f.title}</H>
          <p>{f.text}</p>
          {f.end != null ? <div className="tray-feature__end">{f.end}</div> : null}
        </Card>
      ))}
    </section>
  );
});
FeatureGrid.displayName = 'FeatureGrid';
