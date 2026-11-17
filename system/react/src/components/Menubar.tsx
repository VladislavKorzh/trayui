import * as React from 'react';
import { cx, useTrayEvent, useBehaviour } from '../lib/util';
import { MenuItems, useMergedRef } from '../lib/menus';
import type { MenuItem } from './DropdownMenu';

/** One menu of the bar: its name in the strip and its rows. */
export interface MenubarMenu {
  /** The menu's name in the strip, one word: "File", "Edit", "View". */
  label: string;
  /** Its rows, as in Dropdown Menu: actions with a `shortcut` wherever one exists, check and radio items, separators, labels, one level of submenus. */
  items: MenuItem[];
}

export interface MenubarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  /** The menus, left to right. */
  menus: MenubarMenu[];
  /** Names the bar for screen readers, after the tool it belongs to: "Orders". */
  'aria-label'?: string;
  /** The label of the menu shown open at first; also holds it open in a static picture, until a click outside. */
  defaultOpen?: string;
  /** Called with the item's `value` (or its label) when an action is chosen in any menu. Each item's own `onSelect` runs too. */
  onSelect?: (value: string) => void;
  /** Called with the item's `value` (or its label) and its new state when a check item is flipped, or with `true` when a radio item is chosen. */
  onCheckedChange?: (value: string, checked: boolean) => void;
}

/**
 * A menubar is the row of menus at the top of a working tool: File, Edit, View.
 * Use it only in dense tools where the same commands are used all day; site navigation is a Navigation Menu.
 */
export const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(function Menubar({ menus, defaultOpen, onSelect, onCheckedChange, className, ...rest }, forwarded) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const setRef = useMergedRef(ref, forwarded);
  // The behaviour owns each panel's `hidden` from here on: React only sets the first state.
  const [initiallyOpen] = React.useState(defaultOpen);
  useBehaviour(ref);
  useTrayEvent(ref, 'select', (detail: { value?: string }) => onSelect?.(detail.value ?? ''));

  return (
    <div ref={setRef} className={cx('tray-menubar', className)} data-tray="menubar" role="menubar" {...rest}>
      {menus.map((menu, i) => {
        const open = menu.label === initiallyOpen;
        return (
          <div key={i} className="tray-anchor" data-tray="menu">
            <button className="tray-tab" type="button" role="menuitem" aria-haspopup="menu">
              {menu.label}
            </button>
            <div className="tray-pop" role="menu" data-open={open ? '' : undefined} hidden={open ? undefined : true}>
              <div className="tray-list">
                <MenuItems items={menu.items} onCheckedChange={onCheckedChange} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
Menubar.displayName = 'Menubar';
