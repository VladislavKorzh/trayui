import * as React from 'react';

export interface DirectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'dir' | 'lang'> {
  /**
   * The reading direction of everything inside. 'rtl' (the default) mirrors the layout for Arabic, Hebrew, Persian and Urdu;
   * 'ltr' sets it back to left to right inside a right-to-left page; 'auto' lets the browser decide from the text, for user-written content.
   */
  dir?: 'rtl' | 'ltr' | 'auto';
  /** The language of the content, such as 'ar' or 'he'. Set it with `dir` so screen readers and fonts read the text correctly. */
  lang?: string;
  /** The region to mirror: a whole screen, a panel or one card. */
  children?: React.ReactNode;
}

/**
 * Direction sets the reading direction of a region: with `dir="rtl"` every component inside mirrors, because the styles
 * use logical properties throughout. Wrap a screen in it for a right-to-left language; for a whole app, set `dir` on `<html>` instead.
 */
export const Direction = React.forwardRef<HTMLDivElement, DirectionProps>(function Direction({ dir = 'rtl', lang, children, ...rest }, ref) {
  return (
    <div ref={ref} dir={dir} lang={lang} {...rest}>
      {children}
    </div>
  );
});
Direction.displayName = 'Direction';
