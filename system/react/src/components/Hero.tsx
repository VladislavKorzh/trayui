import * as React from 'react';
import { cx } from '../lib/util';
import { Card } from './Card';

export interface HeroProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** What the product does for the person, in under eight words: "Every order, packed on time". */
  title: React.ReactNode;
  /** 'headline' (the default) for a title of five words or more; 'display', the largest type, for one of four words or fewer. */
  titleSize?: 'headline' | 'display';
  /** One sentence under the title, under twenty words: what the product is and who it is for. */
  description?: React.ReactNode;
  /** The buttons at the foot of the text card: one yellow `<Button href="/signup">Start free</Button>` and at most one quiet one. */
  actions?: React.ReactNode;
  /** A small line under the buttons that removes a doubt: "Free for 14 days. No card needed." */
  note?: React.ReactNode;
  /** Something real to look at, in the second card: a figure with its context, a screenshot, or a photograph (with `mediaFlush`). */
  media: React.ReactNode;
  /** The media card's tone. 'accent' (the default) is the yellow card of this screen; 'tray' or 'inverse' when the yellow is used elsewhere in view. */
  mediaTone?: 'accent' | 'tray' | 'inverse';
  /** Removes the media card's padding, for a picture that fills it. */
  mediaFlush?: boolean;
  /** The heading level of the title. Default 1: the hero is the top of the page. */
  headingLevel?: 1 | 2;
}

/**
 * The hero is the first screen of a product's public page: what it is in one headline, one sentence, one yellow button, and something real to look at beside them.
 * The text takes seven of the twelve columns and the media five; below 56rem they stack.
 */
export const Hero = React.forwardRef<HTMLElement, HeroProps>(function Hero(
  { title, titleSize = 'headline', description, actions, note, media, mediaTone = 'accent', mediaFlush, headingLevel = 1, className, ...rest },
  ref,
) {
  const H = `h${headingLevel}` as 'h1' | 'h2';
  return (
    <section ref={ref} className={cx('tray-hero', className)} {...rest}>
      <Card className="tray-hero__text">
        <div className="tray-hero__copy">
          <H className={titleSize}>{title}</H>
          {description != null ? <p>{description}</p> : null}
        </div>
        {actions != null || note != null ? (
          <div className="tray-stack tray-stack--sm">
            {actions != null ? <div className="tray-hero__actions">{actions}</div> : null}
            {note != null ? <p className="tray-hero__note">{note}</p> : null}
          </div>
        ) : null}
      </Card>
      <Card tone={mediaTone} flush={mediaFlush} className="tray-hero__media">
        {media}
      </Card>
    </section>
  );
});
Hero.displayName = 'Hero';
