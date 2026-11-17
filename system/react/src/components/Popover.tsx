import * as React from 'react';
import { cx, useTrayEvent, useBehaviour, useForwardedRef, useUid } from '../lib/util';

type PopoverAnchor = HTMLSpanElement & { __popover?: { open(): void; close(focusBack?: boolean): void; isOpen(): boolean } };

export interface PopoverProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'title'> {
  /** The button that opens and closes it: a `<Button>` or a link, never wrapped in anything else. `<Button variant="quiet" size="sm" icon="share">Share</Button>`. */
  trigger: React.ReactElement;
  /** A short title at the top, in 20px bold. Give one when the panel has more than two controls. */
  title?: React.ReactNode;
  /** One or two sentences under the title, in soft ink: what the panel does, or the explanation itself. */
  description?: React.ReactNode;
  /** The few controls of the panel: a link to copy, a switch, two buttons. Laid out under the title with 16px gaps. A button with `data-close` closes the popover. */
  children?: React.ReactNode;
  /** 'card' (the default) is a 22rem panel with 28px corners and room for text. 'roomy' keeps the content's natural width. 'list' is the tight 20px-cornered panel menus use. */
  variant?: 'card' | 'roomy' | 'list';
  /** 'start' (the default) lines the panel up with the trigger's start edge; 'end' with its end edge, for a trigger near the end of a row. */
  align?: 'start' | 'end';
  /** 'bottom' (the default) opens it under the trigger; 'top' opens it upward, for a trigger near the bottom of the screen. */
  side?: 'bottom' | 'top';
  /** Opens or closes it from outside. A click on the trigger, a click outside and Escape still work, and report through `onOpenChange`. */
  open?: boolean;
  /** Whether it starts open: also holds it open in a static picture, until a click outside. Default false. */
  defaultOpen?: boolean;
  /** Called with `true` when it opens and `false` when it closes: the trigger, a click outside, Escape or a `data-close` button. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * A popover is a small panel that opens beside the button that asked for it, for a few controls or a short explanation.
 * Use it for one small job (share, pick a colour, explain a term) that should not block the page; one line naming a control is a Tooltip, and a task that blocks the page is a Dialog.
 */
export const Popover = React.forwardRef<HTMLSpanElement, PopoverProps>(function Popover(
  { trigger, title, description, children, variant = 'card', align = 'start', side = 'bottom', open, defaultOpen = false, onOpenChange, className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef<HTMLSpanElement>(forwarded);
  const panelId = useUid('popover');
  // The behaviour owns the panel's `hidden` from here on: React only sets the first state, so the panel never flashes open.
  const [initiallyOpen] = React.useState(() => open ?? defaultOpen);
  useBehaviour(ref);

  const report = (next: boolean) => (_detail: unknown, event: CustomEvent) => {
    if ((event.target as Element).parentElement === ref.current) onOpenChange?.(next);
  };
  useTrayEvent(ref, 'open', report(true));
  useTrayEvent(ref, 'close', report(false));

  React.useEffect(() => {
    const pop = (ref.current as PopoverAnchor | null)?.__popover;
    if (open === undefined || !pop || pop.isOpen() === open) return;
    if (open) pop.open();
    else pop.close();
  }, [open, ref]);

  const head =
    title != null || description != null ? (
      <div className="tray-stack tray-stack--sm">
        {title != null ? <p className="tray-pop__title">{title}</p> : null}
        {description != null ? <p className="tray-pop__text">{description}</p> : null}
      </div>
    ) : null;

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={cx('tray-anchor', className)} data-tray="popover" {...rest}>
      {trigger}
      <div
        className={cx(
          'tray-pop',
          variant === 'card' && 'tray-pop--card',
          variant === 'roomy' && 'tray-pop--roomy',
          align === 'end' && 'tray-pop--end',
          side === 'top' && 'tray-pop--top',
        )}
        id={panelId}
        data-open={initiallyOpen ? '' : undefined}
        hidden={initiallyOpen ? undefined : true}
      >
        {head && children != null ? (
          <div className="tray-stack">
            {head}
            {children}
          </div>
        ) : (
          head ?? children
        )}
      </div>
    </span>
  );
});
Popover.displayName = 'Popover';
