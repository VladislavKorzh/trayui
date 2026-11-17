import * as React from 'react';
import { cx } from '../lib/util';

export type AspectRatioPreset = 'wide' | 'photo' | 'square' | 'portrait';

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The proportion of the box. 'wide' is 16 to 9 (the default, for video and banners), 'photo' 4 to 3 (product shots),
   * 'square' 1 to 1 (thumbnails in a grid, avatars), 'portrait' 3 to 4. Any other ratio as a number: `21 / 9`.
   */
  ratio?: AspectRatioPreset | number;
  /** Words centred in the empty box while there is no media yet, in muted ink: "16 / 9", "No photo yet". */
  placeholder?: React.ReactNode;
  /** One element that fills the box and is cropped to fit, never stretched: an `<img>` with its alt text, a `<video>`, a drawing. */
  children?: React.ReactNode;
}

/**
 * Aspect ratio keeps a box in a fixed proportion while its width changes, so media never shifts the layout as it loads.
 * Put one image or video in it; it fills the box with 28px corners, a panel's, because media usually sits inside a card.
 */
export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = 'wide', placeholder, className, style, children, ...rest },
  ref,
) {
  const preset = typeof ratio === 'string' && ratio !== 'wide' ? `tray-ratio--${ratio}` : undefined;
  const custom = typeof ratio === 'number' ? ({ '--tray-ratio': String(ratio) } as React.CSSProperties) : undefined;
  return (
    <div ref={ref} className={cx('tray-ratio', preset, className)} style={custom ? { ...custom, ...style } : style} {...rest}>
      {children ?? (placeholder != null ? <span className="tray-ratio__label">{placeholder}</span> : null)}
    </div>
  );
});
AspectRatio.displayName = 'AspectRatio';
