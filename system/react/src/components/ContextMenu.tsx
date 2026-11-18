'use client';
import * as React from 'react';
import { cx, useTrayEvent, useBehaviour } from '../lib/util';
import { MenuItems, useMergedRef } from '../lib/menus';
import type { MenuActionItem, MenuLabelItem, MenuSeparatorItem } from './DropdownMenu';

/** One row of a context menu: an action (leave `type` out), `{ type: 'separator' }` or `{ type: 'label' }`. */
export type ContextMenuItem = MenuActionItem | MenuSeparatorItem | MenuLabelItem;

export interface ContextMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /**
   * The actions for the thing that was right-clicked, in the same order as its Dropdown Menu: `{ label, icon, shortcut, onSelect }`,
   * `{ type: 'separator' }`, `{ type: 'label' }`. A danger item goes last, after a separator.
   */
  items: ContextMenuItem[];
  /** The region's content: what can be right-clicked. */
  children?: React.ReactNode;
  /** Names the region for screen readers, after what it holds: "Order PL-20418". */
  'aria-label'?: string;
  /** Shows the menu open at first, near the region's top start corner; also holds it open in a static picture. Default false. */
  defaultOpen?: boolean;
  /** Called with the item's `value` (or its label) when an action is chosen. Each item's own `onSelect` runs too. */
  onSelect?: (value: string) => void;
}

/**
 * A context menu opens where something is right-clicked and offers the actions for that thing.
 * It is a shortcut in dense working tools (tables, file lists, canvases): every action in it must also be reachable another way, such as a "more" button.
 */
export const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  { items, children, defaultOpen = false, onSelect, className, tabIndex = 0, ...rest },
  forwarded,
) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const setRef = useMergedRef(ref, forwarded);
  // The behaviour owns the panel's `hidden` and position from here on; React only sets the first state.
  const [initiallyOpen] = React.useState(defaultOpen);
  useBehaviour(ref);
  useTrayEvent(ref, 'select', (detail: { value?: string }) => onSelect?.(detail.value ?? ''));

  return (
    <div ref={setRef} className={cx('tray-context', className)} data-tray="contextmenu" role="group" tabIndex={tabIndex} {...rest}>
      {children}
      <div
        className="tray-pop"
        role="menu"
        data-open={initiallyOpen ? '' : undefined}
        hidden={initiallyOpen ? undefined : true}
        style={initiallyOpen ? { insetInlineStart: '3rem', insetBlockStart: '1.5rem' } : undefined}
      >
        <div className="tray-list">
          <MenuItems items={items} />
        </div>
      </div>
    </div>
  );
});
ContextMenu.displayName = 'ContextMenu';
