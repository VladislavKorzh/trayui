import * as React from 'react';
import { cx } from '../lib/util';

export type TypographyVariant =
  | 'display'
  | 'headline'
  | 'title'
  | 'subtitle'
  | 'figure'
  | 'lead'
  | 'body'
  | 'caption'
  | 'tick'
  | 'action'
  | 'control'
  | 'nav'
  | 'label'
  | 'code'
  | 'kbd';

export type TypographyElement =
  | 'p'
  | 'span'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'strong'
  | 'small'
  | 'label'
  | 'li'
  | 'dt'
  | 'dd'
  | 'figcaption'
  | 'legend'
  | 'blockquote'
  | 'cite'
  | 'time'
  | 'code'
  | 'kbd';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The type style, named after its token. Headings, weight 700 and fluid: 'display' (the page headline, once per page), 'headline' (sections),
   * 'title' (a large card, a dialog), 'subtitle' (card and chart titles, list items), 'figure' (one large numeral in a card).
   * Text, weight 400: 'lead' (the sentence under a headline), 'body' (the default: everything that explains), 'caption' (hints, dates), 'tick' (axis marks).
   * Interface, largest to smallest: 'action', 'control', 'nav', 'label'. Mono: 'code', 'kbd'.
   */
  variant?: TypographyVariant;
  /**
   * The element, chosen for meaning: the style sets the looks, so the two are independent. Default: 'h1' for display, 'h2' for headline and title,
   * 'h3' for subtitle, 'code' and 'kbd' for the mono styles, 'p' for the rest.
   */
  as?: TypographyElement;
  /** A secondary ink: 'soft' (a lead, secondary text), 'muted' (captions, dates), 'hint' (ticks, placeholders; never lighter). Default: the ink of the surface. */
  tone?: 'ink' | 'soft' | 'muted' | 'hint';
  /** With 'figure': the unit set at `title` size on the same baseline, such as "%" or "kg". */
  unit?: React.ReactNode;
}

const defaultElement: Partial<Record<TypographyVariant, TypographyElement>> = {
  display: 'h1',
  headline: 'h2',
  title: 'h2',
  subtitle: 'h3',
  code: 'code',
  kbd: 'kbd',
};

/**
 * Typography sets text in one of the system's type styles: one grotesque, Onest, weight 700 with tight tracking for anything that names,
 * weight 400 with open leading for anything that explains. Pick the element with `as` for meaning and the style with `variant` for looks.
 */
export const Typography = React.forwardRef<HTMLElement, TypographyProps>(function Typography(
  { variant = 'body', as, tone = 'ink', unit, className, children, ...rest },
  ref,
) {
  const El = (as ?? defaultElement[variant] ?? 'p') as 'p';
  const style = variant === 'figure' ? 'tray-figure' : variant;
  return (
    <El ref={ref as React.Ref<HTMLParagraphElement>} className={cx(style, tone !== 'ink' && `tray-${tone}`, className)} {...rest}>
      {children}
      {variant === 'figure' && unit != null ? <small>{unit}</small> : null}
    </El>
  );
});
Typography.displayName = 'Typography';
