'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx, useTrayEvent, useBehaviour } from '../lib/util';
import { MenuItems, menuHandle, useMergedRef, useTick } from '../lib/menus';
import { Button, type ButtonSize, type ButtonVariant } from './Button';
import { Icon } from './Icon';

/** An action: it runs something and the menu closes. */
export interface MenuActionItem {
  /** Leave it out (or 'item') for an action. */
  type?: 'item';
  /** What the item does: a verb and a noun, "Duplicate", "Copy the link". */
  label: string;
  /** What the menu's `onSelect` receives. Default: the label. */
  value?: string;
  /** An icon before the label. Give every item of a menu an icon, or none. */
  icon?: IconSource;
  /** The keyboard shortcut, in muted text at the end: "Ctrl D". */
  shortcut?: string;
  /** A destructive action, in red. Put it last, after a separator. */
  danger?: boolean;
  /** Dims the item; it cannot be chosen. */
  disabled?: boolean;
  /** Makes the item a link to this address. */
  href?: string;
  /** Runs when the item is chosen. */
  onSelect?: () => void;
}

/** An item that is on or off. A check shows at the end while it is on, and the menu stays open. */
export interface MenuCheckboxItem {
  /** 'checkbox': an item that is on or off. */
  type: 'checkbox';
  /** What it turns on: "Notify the customer", "Show the totals". */
  label: string;
  /** What `onCheckedChange` of the menu receives. Default: the label. */
  value?: string;
  /** An icon before the label. */
  icon?: IconSource;
  /** The keyboard shortcut, in muted text before the check. */
  shortcut?: string;
  /** Dims the item; it cannot be changed. */
  disabled?: boolean;
  /** On or off, held by you. Leave it out and use `defaultChecked` to let the menu hold it. */
  checked?: boolean;
  /** On or off at first, when `checked` is left out. Default false. */
  defaultChecked?: boolean;
  /** Called with the new state when the item is clicked. */
  onCheckedChange?: (checked: boolean) => void;
}

/** One of several: the items with the same `group` take one choice between them. The menu stays open. */
export interface MenuRadioItem {
  /** 'radio': one choice of several. */
  type: 'radio';
  /** The name the items of one choice share: 'density'. */
  group: string;
  /** The choice: "Comfortable", "Compact". */
  label: string;
  /** What `onCheckedChange` of the menu receives. Default: the label. */
  value?: string;
  /** An icon before the label. */
  icon?: IconSource;
  /** Dims the item; it cannot be chosen. */
  disabled?: boolean;
  /** Chosen or not, held by you. Leave it out and use `defaultChecked` to let the menu hold it. */
  checked?: boolean;
  /** Chosen at first, when `checked` is left out. Default false. */
  defaultChecked?: boolean;
  /** Runs when this item is chosen. */
  onSelect?: () => void;
}

/** A hairline between two groups of items. */
export interface MenuSeparatorItem {
  /** 'separator': a hairline between two groups. */
  type: 'separator';
}

/** A small muted heading over a group of items: "Density", "Sort by". */
export interface MenuLabelItem {
  /** 'label': a heading, not an item that can be chosen. */
  type: 'label';
  /** The heading's words, sentence case, no colon. */
  label: string;
}

/** An item that opens a second panel to the side, on hover, focus or the right arrow. One level only. */
export interface MenuSubmenuItem {
  /** 'submenu': an item that opens a second panel. */
  type: 'submenu';
  /** The item's label: "Move to", "Export". */
  label: string;
  /** An icon before the label. */
  icon?: IconSource;
  /** Dims the item. */
  disabled?: boolean;
  /** The items of the side panel: actions, check and radio items, separators, labels. */
  items: MenuItem[];
}

/** One row of a menu. Leave `type` out for an action. */
export type MenuItem = MenuActionItem | MenuCheckboxItem | MenuRadioItem | MenuSeparatorItem | MenuLabelItem | MenuSubmenuItem;

export interface DropdownMenuProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onSelect' | 'children'> {
  /**
   * The rows, top to bottom: actions (`{ label, icon, shortcut, onSelect }`), `{ type: 'checkbox' }`, `{ type: 'radio', group }`,
   * `{ type: 'separator' }`, `{ type: 'label' }` and `{ type: 'submenu', items }`. About eight at most; a danger item goes last, after a separator.
   */
  items: MenuItem[];
  /** The trigger's text, followed by a small chevron: "Actions", "Export". */
  label?: React.ReactNode;
  /** An icon before the label. With no label the trigger is the icon alone, such as 'ellipsis' at the end of a row or 'ellipsis-vertical' on a card (the default): name it with `aria-label`. */
  icon?: IconSource;
  /** Names the trigger for screen readers. Required with an icon-only trigger: "More actions". */
  'aria-label'?: string;
  /** The trigger's look. Default 'quiet' with a label, 'ghost' with an icon only. */
  variant?: ButtonVariant;
  /** The trigger's size. Default 'sm' (48px), the size of headers and toolbars; 'xs' in table rows. */
  size?: ButtonSize;
  /** Your own trigger instead of the button: a `<Button>`, a `<button>` or a link, never wrapped in anything else. `label`, `icon`, `variant` and `size` are then ignored. */
  trigger?: React.ReactElement;
  /** 'start' (the default) lines the panel up with the trigger's start edge; 'end' with its end edge, for a "more" button at the end of a row. */
  align?: 'start' | 'end';
  /** 'bottom' (the default) opens the panel under the trigger; 'top' above it, for a trigger near the bottom of the screen. */
  side?: 'bottom' | 'top';
  /** Opens or closes the menu from outside. The trigger, a click outside and Escape still work and report through `onOpenChange`. */
  open?: boolean;
  /** Whether it starts open: also holds it open in a static picture, until a click outside. Default false. */
  defaultOpen?: boolean;
  /** Called with `true` when the menu opens and `false` when it closes. */
  onOpenChange?: (open: boolean) => void;
  /** Called with the item's `value` (or its label) when an action is chosen. Each item's own `onSelect` runs too. */
  onSelect?: (value: string) => void;
  /** Called with the item's `value` (or its label) and its new state when a check item is flipped, or with `true` when a radio item is chosen. */
  onCheckedChange?: (value: string, checked: boolean) => void;
}

/**
 * A dropdown menu is a short list of actions that opens from a button.
 * Use it for the actions on a thing (an order, a row, a card) that do not deserve their own buttons; to choose a value for a form, use Select.
 */
export const DropdownMenu = React.forwardRef<HTMLSpanElement, DropdownMenuProps>(function DropdownMenu(
  {
    items,
    label,
    icon,
    'aria-label': ariaLabel,
    variant,
    size = 'sm',
    trigger,
    align = 'start',
    side = 'bottom',
    open,
    defaultOpen = false,
    onOpenChange,
    onSelect,
    onCheckedChange,
    className,
    ...rest
  },
  forwarded,
) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const setRef = useMergedRef(ref, forwarded);
  // The behaviour owns the panel's `hidden` from here on: React only sets the first state, so the panel never flashes open.
  const [initiallyOpen] = React.useState(() => open ?? defaultOpen);
  const [tick, bump] = useTick();
  useBehaviour(ref);

  const report = (next: boolean) => (_detail: unknown, event: CustomEvent) => {
    if ((event.target as Element).parentElement !== ref.current) return;
    bump();
    onOpenChange?.(next);
  };
  useTrayEvent(ref, 'open', report(true));
  useTrayEvent(ref, 'close', report(false));
  useTrayEvent(ref, 'select', (detail: { value?: string }) => onSelect?.(detail.value ?? ''));

  // Controlled: follow `open`, also after the menu opened or closed itself and the parent did not agree.
  React.useEffect(() => {
    const pop = menuHandle(ref.current);
    if (open === undefined || !pop || pop.isOpen() === open) return;
    if (open) pop.open();
    else pop.close();
  }, [open, tick, ref]);

  const button =
    trigger ??
    (label != null ? (
      <Button variant={variant ?? 'quiet'} size={size} icon={icon} aria-haspopup="menu" aria-label={ariaLabel}>
        {label}
        <Icon name="chevron-down" size="sm" />
      </Button>
    ) : (
      <Button variant={variant ?? 'ghost'} size={size} icon={icon ?? 'ellipsis'} aria-haspopup="menu" aria-label={ariaLabel} />
    ));

  return (
    <span ref={setRef} className={cx('tray-anchor', className)} data-tray="menu" {...rest}>
      {button}
      <div
        className={cx('tray-pop', align === 'end' && 'tray-pop--end', side === 'top' && 'tray-pop--top')}
        role="menu"
        data-open={initiallyOpen ? '' : undefined}
        hidden={initiallyOpen ? undefined : true}
      >
        <div className="tray-list">
          <MenuItems items={items} onCheckedChange={onCheckedChange} />
        </div>
      </div>
    </span>
  );
});
DropdownMenu.displayName = 'DropdownMenu';
