'use client';
import * as React from 'react';
import { cx, useBehaviour, useForwardedRef, useUid } from '../lib/util';
import { Icon } from './Icon';

export interface LightboxPicture {
  /** The full picture: what the lightbox shows, and where the thumbnail links without script. */
  src: string;
  /** A smaller file for the gallery. Default: `src`. */
  thumb?: string;
  /** What the picture shows. It is the text of the thumbnail and of the picture in the lightbox. */
  alt: string;
  /** A line under the picture in the lightbox. */
  caption?: string;
  /** The thumbnail's width and height in pixels, so the gallery keeps its shape while it loads. */
  width?: number;
  height?: number;
}

export interface LightboxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Names the gallery and the lightbox for screen readers: "The farm in pictures". */
  label: string;
  /** The pictures, in order. */
  pictures: LightboxPicture[];
  /** Makes the first thumbnail twice the size. With three to a row, a lead and five more fill three rows. */
  lead?: boolean;
  /** The least width of a thumbnail, any CSS length. Default '11rem'; the row takes as many as fit. */
  thumbWidth?: string;
  /** The name of the strip of pictures inside the open dialog. Default 'Pictures'. */
  trackLabel?: string;
  /** The aria-label of the close button. Default 'Close'. */
  closeLabel?: string;
  /** The aria-label of the button that goes back. Default 'Previous picture'. */
  previousLabel?: string;
  /** The aria-label of the button that goes on. Default 'Next picture'. */
  nextLabel?: string;
  /** The word between the numbers in "2 of 6", in the page's language. Default 'of'. */
  of?: string;
}

/**
 * A lightbox shows the pictures of a gallery one at a time, as large as the window allows, over the whole page.
 * The thumbnails are links to the full pictures, so the gallery works without script too.
 */
export const Lightbox = React.forwardRef<HTMLDivElement, LightboxProps>(function Lightbox(
  { label, pictures, lead, thumbWidth, trackLabel = 'Pictures', closeLabel = 'Close', previousLabel = 'Previous picture', nextLabel = 'Next picture', of = 'of', className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef(forwarded);
  const id = useUid('lightbox');
  // the behaviour reads the links when it starts: new pictures make a new gallery and a new lightbox for it
  const sig = pictures.map((p) => p.src).join('\n');
  useBehaviour(ref, [sig]);
  const style = thumbWidth ? ({ '--tray-thumb': thumbWidth } as React.CSSProperties) : undefined;
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className} {...rest}>
      <ul key={`g${sig}`} className={cx('tray-gallery', lead && 'tray-gallery--lead')} data-tray="lightbox" data-target={`#${id}`} role="list" aria-label={label} style={style}>
        {pictures.map((p) => (
          <li key={p.src}>
            <a className="tray-gallery__item" href={p.src} data-caption={p.caption}>
              <img src={p.thumb ?? p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" decoding="async" />
            </a>
          </li>
        ))}
      </ul>
      <dialog key={`d${sig}`} className="tray-lightbox" id={id} data-tray="dialog" aria-label={label} data-of={of}>
        <div className="tray-lightbox__bar">
          <span className="tray-lightbox__count" aria-hidden="true">
            1 / {pictures.length}
          </span>
          <button className="tray-btn tray-btn--quiet tray-btn--icon" type="button" data-close="" aria-label={closeLabel}>
            <Icon name="x" />
          </button>
        </div>
        <div className="tray-lightbox__nav">
          <button className="tray-btn tray-btn--icon" type="button" data-prev="" aria-label={previousLabel}>
            <Icon name="chevron-left" flip />
          </button>
          <button className="tray-btn tray-btn--icon" type="button" data-next="" aria-label={nextLabel}>
            <Icon name="chevron-right" flip />
          </button>
        </div>
        <ul className="tray-lightbox__track" role="list" aria-label={trackLabel} />
        <p className="tray-vh" role="status" />
      </dialog>
    </div>
  );
});
Lightbox.displayName = 'Lightbox';
