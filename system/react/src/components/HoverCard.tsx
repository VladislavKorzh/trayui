import * as React from 'react';
import { cx, useBehaviour, useForwardedRef } from '../lib/util';

export interface HoverCardProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The real link (or button) the card previews: `<a href="/people/oksana">Oksana Franko</a>`. People without a pointer follow it, so it must lead to everything the card shows. */
  trigger: React.ReactElement;
  /**
   * The card: who or what, one or two facts, at most one action. The card is a `<span>` so it can sit inside a sentence;
   * build its content from spans too (`<span className="tray-stack">`, `<span className="tray-pop__text">`) when it is inside a paragraph.
   */
  children: React.ReactNode;
  /** 'start' (the default) lines the card up with the link's start edge; 'end' with its end edge. */
  align?: 'start' | 'end';
  /** 'bottom' (the default) opens it under the link; 'top' opens it upward. */
  side?: 'bottom' | 'top';
  /** Shows the card when it first renders, for a static picture in a preview or a documentation page. It closes as soon as the pointer passes and leaves. Default false. */
  defaultOpen?: boolean;
}

/**
 * A hover card previews what is behind a link when the pointer rests on it: a person, an order, a note.
 * Use it where the same kind of link repeats (names in a table, mentions in a thread); it never opens on touch, so it holds nothing people must reach.
 */
export const HoverCard = React.forwardRef<HTMLSpanElement, HoverCardProps>(function HoverCard(
  { trigger, children, align = 'start', side = 'bottom', defaultOpen = false, className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef<HTMLSpanElement>(forwarded);
  // The behaviour owns the card's `hidden` from here on: React only sets the first state, so the card never flashes open.
  const [initiallyOpen] = React.useState(defaultOpen);
  useBehaviour(ref);
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={cx('tray-anchor', className)} data-tray="hovercard" {...rest}>
      {trigger}
      <span
        className={cx('tray-pop tray-pop--card', align === 'end' && 'tray-pop--end', side === 'top' && 'tray-pop--top')}
        data-open={initiallyOpen ? '' : undefined}
        hidden={initiallyOpen ? undefined : true}
      >
        {children}
      </span>
    </span>
  );
});
HoverCard.displayName = 'HoverCard';
