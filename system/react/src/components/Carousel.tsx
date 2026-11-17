import * as React from 'react';
import { cx, useBehaviour, useForwardedRef } from '../lib/util';
import { Icon } from './Icon';

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Names the row for screen readers: "Field notes". */
  label: string;
  /** The slides, one child each: usually cards. Each is wrapped in a snapping slide. */
  children?: React.ReactNode;
  /** The width of a slide, any CSS length: '18rem', '45%'. Default: 78% of the row, at most 22rem, so the next slide always peeks in. */
  slideWidth?: string;
  /** The aria-label of the button that scrolls back. Default 'Previous'. */
  previousLabel?: string;
  /** The aria-label of the button that scrolls on. Default 'Next'. */
  nextLabel?: string;
}

/**
 * A carousel is one row of cards that scrolls sideways and snaps to each card, with previous and next buttons and a "2 / 5" count.
 * Use it for browsing more cards than fit; prefer a bento of cards when everything fits. It never moves on its own.
 */
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  { label, children, slideWidth, previousLabel = 'Previous', nextLabel = 'Next', className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef(forwarded);
  useBehaviour(ref);
  const slides = React.Children.toArray(children);
  // the behaviour repaints the count and the buttons on scroll: ask it to when the number of slides changes
  React.useEffect(() => {
    ref.current?.querySelector('.tray-carousel__track')?.dispatchEvent(new Event('scroll'));
  }, [ref, slides.length]);
  const trackStyle = slideWidth ? ({ '--tray-slide': slideWidth } as React.CSSProperties) : undefined;
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={cx('tray-carousel', className)} data-tray="carousel" {...rest}>
      <ul className="tray-carousel__track" aria-label={label} style={trackStyle}>
        {slides.map((s, i) => (
          <li key={React.isValidElement(s) && s.key != null ? s.key : i} className="tray-carousel__slide">
            {s}
          </li>
        ))}
      </ul>
      <div className="tray-carousel__bar">
        <span className="tray-carousel__count" />
        <div className="tray-row tray-row--sm">
          <button className="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" data-prev="" aria-label={previousLabel}>
            <Icon name="arrow-left" flip />
          </button>
          <button className="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" data-next="" aria-label={nextLabel}>
            <Icon name="arrow-right" flip />
          </button>
        </div>
      </div>
    </div>
  );
});
Carousel.displayName = 'Carousel';
