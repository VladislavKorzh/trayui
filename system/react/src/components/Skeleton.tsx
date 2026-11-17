import * as React from 'react';
import { cx } from '../lib/util';

export type SkeletonShape = 'block' | 'text' | 'avatar' | 'card';
export type SkeletonRadius = 'button' | 'input' | 'control' | 'chip' | 'pill';

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * 'block' is a plain grey shape with 12px corners (the default). 'text' is a line of text with 4px corners, 0.8em tall unless `height` says otherwise.
   * 'avatar' is a 48px tile. 'card' has a card's 40px corners.
   */
  shape?: SkeletonShape;
  /** The width: a number of pixels or any CSS length ('60%', '9rem'). Default: the full width of its container (an avatar is 48px). Vary it between lines. */
  width?: number | string;
  /** The height: a number of pixels or any CSS length. Match the content that will arrive: 16 for a title line, 56 for an input, 48 for a small button. */
  height?: number | string;
  /** The corners of the control it stands in for: 'input' (16px) for a field, 'control' (14px) for a small button, 'button' (20px), 'chip' (12px), 'pill' (round). Default: the shape's own corners. */
  radius?: SkeletonRadius;
}

/**
 * A skeleton holds the place of content that is loading, in the shape of what will arrive: a grey shape with a slow pulse.
 * Build it from the same layout as the loaded content, and wrap the group in an element with `aria-busy="true"` and a hidden label.
 */
export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton({ shape = 'block', width, height, radius, className, style, ...rest }, ref) {
  const size: React.CSSProperties = {};
  if (width !== undefined) size.inlineSize = width;
  if (height !== undefined) size.blockSize = height;
  if (radius) size.borderRadius = `var(--radius-${radius})`;
  return (
    <span
      ref={ref}
      className={cx('tray-skeleton', shape !== 'block' && `tray-skeleton--${shape}`, className)}
      aria-hidden="true"
      style={Object.keys(size).length ? { ...size, ...style } : style}
      {...rest}
    />
  );
});
Skeleton.displayName = 'Skeleton';
