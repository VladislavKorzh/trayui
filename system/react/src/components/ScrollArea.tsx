import * as React from 'react';
import { cx } from '../lib/util';
import { toLength } from '../lib/chat';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Names the area for screen readers: "Pickup points", "Filters". Required: the area is a focusable region the keyboard can scroll. */
  label: string;
  /**
   * 'vertical' (the default) scrolls a long list inside a box of at most `maxHeight`.
   * 'horizontal' scrolls sideways and lays its one child out on a single line: a row of chips, a tab strip, a wide table.
   */
  orientation?: 'vertical' | 'horizontal';
  /** With 'vertical': the tallest the area grows before it scrolls, a CSS length such as '13rem' or a number of pixels. Default '16rem'. */
  maxHeight?: string | number;
  /** The content. Leave the last item partly visible, so it is clear there is more. */
  children?: React.ReactNode;
}

/**
 * A scroll area keeps a long list or a wide row inside a fixed box, with a thin scrollbar in the system's rule colour.
 * It is the browser's own scrolling, so touch, wheel, keyboard and find-in-page all work.
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { label, orientation = 'vertical', maxHeight, className, style, children, ...rest },
  ref,
) {
  const vars = maxHeight !== undefined && orientation === 'vertical' ? ({ '--tray-scroll': toLength(maxHeight) } as React.CSSProperties) : undefined;
  return (
    <div
      ref={ref}
      className={cx('tray-scroll', orientation === 'horizontal' && 'tray-scroll--x', className)}
      style={vars || style ? { ...vars, ...style } : undefined}
      tabIndex={0}
      role="region"
      aria-label={label}
      {...rest}
    >
      {children}
    </div>
  );
});
ScrollArea.displayName = 'ScrollArea';
