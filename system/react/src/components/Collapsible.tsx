import * as React from 'react';
import { cx, useControlled } from '../lib/util';
import { PlusTile, summaryClick } from '../lib/nav';

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDetailsElement> {
  /** The short trigger: "Show the figures", "3 more recipients". Keep the same words open and closed; the tile shows the state. */
  summary: React.ReactNode;
  /** Whether the detail is shown. Leave it out to let the collapsible keep its own state. */
  open?: boolean;
  /** Whether it starts open, when `open` is not controlled. Default false. */
  defaultOpen?: boolean;
  /** Called with the new state when it opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** The optional detail it hides: a table behind a chart, the rest of a list, the technical part of an error. */
  children?: React.ReactNode;
}

/**
 * A collapsible shows and hides one block of detail under a short trigger, with a 44px plus tile that turns into a cross while open.
 * Use it for one block of optional detail; a set of sibling questions is an Accordion.
 */
export const Collapsible = React.forwardRef<HTMLDetailsElement, CollapsibleProps>(function Collapsible(
  { summary, open, defaultOpen = false, onOpenChange, className, children, ...rest },
  ref,
) {
  const [isOpen, setOpen] = useControlled(open, defaultOpen, onOpenChange);
  return (
    <details
      ref={ref}
      className={cx('tray-collapsible', className)}
      open={isOpen}
      // the browser may open it by itself (find-in-page): take its word for it
      onToggle={(e) => {
        if (e.currentTarget.open !== isOpen) setOpen(e.currentTarget.open);
      }}
      {...rest}
    >
      <summary onClick={summaryClick(isOpen, setOpen)}>
        <span>{summary}</span>
        <PlusTile />
      </summary>
      <div className="tray-collapsible__body">{children}</div>
    </details>
  );
});
Collapsible.displayName = 'Collapsible';
