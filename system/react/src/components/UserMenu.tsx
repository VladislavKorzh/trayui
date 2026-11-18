'use client';
import * as React from 'react';
import { cx } from '../lib/util';
import { MenuItems } from '../lib/menus';
import { initialsOf, usePopAnchor } from '../lib/shell';
import { Avatar } from './Avatar';
import type { MenuItem } from './DropdownMenu';

export interface UserMenuProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onSelect' | 'children'> {
  /** The person signed in: "Oksana Franko". It heads the menu in bold and names the avatar button, "Account: Oksana Franko, OF". */
  name: string;
  /** The line under the name: their e-mail, so a person with two accounts can tell them apart. */
  email?: React.ReactNode;
  /** One or two initials on the avatar: "OF". Default: from the name. */
  initials?: string;
  /** A photo for the avatar, in place of the initials. */
  src?: string;
  /**
   * The rows under the person, the DropdownMenu's items: their pages (`{ label: 'Profile', icon: 'user', href }`), preferences
   * (`{ type: 'checkbox', label: 'Dark theme', icon: 'moon' }`), `{ type: 'separator' }`, help, and "Sign out" last, never red.
   * An item's `shortcut` also takes a short muted note at its end, such as the plan beside "Billing".
   */
  items: MenuItem[];
  /** Called with the item's `value` (or its label) when an action is chosen; the menu closes. Each item's own `onSelect` runs too. */
  onSelect?: (value: string) => void;
  /** Called with the item's `value` (or its label) and its new state when a check item, such as "Dark theme", is flipped. */
  onCheckedChange?: (value: string, checked: boolean) => void;
  /** 'end' (the default) lines the panel up with the avatar's end edge, for the end of the top bar; 'start' with its start edge. */
  align?: 'start' | 'end';
  /** Opens or closes the menu from outside. The avatar, a click outside and Escape still work and report through `onOpenChange`. */
  open?: boolean;
  /** Whether it starts open: also holds it open in a static picture, until a click outside. Default false. */
  defaultOpen?: boolean;
  /** Called with `true` when the menu opens and `false` when it closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * The user menu opens from the avatar at the end of the top bar: who is signed in, then the account's pages, the theme, help and signing out.
 * Put it in the TopBar's `end`; workspace settings belong to the sidebar, and switching workspaces to the WorkspaceSwitcher.
 */
export const UserMenu = React.forwardRef<HTMLSpanElement, UserMenuProps>(function UserMenu(
  { name, email, initials, src, items, onSelect, onCheckedChange, align = 'end', open, defaultOpen, onOpenChange, className, ...rest },
  forwarded,
) {
  const { setRef, initiallyOpen } = usePopAnchor<HTMLSpanElement>('menu', forwarded, { open, defaultOpen, onOpenChange, onSelect });
  const letters = initials ?? initialsOf(name);
  return (
    <span ref={setRef} className={cx('tray-anchor', className)} data-tray="menu" {...rest}>
      {/* The name ends with the initials it shows, so the words on the button are in its name (WCAG 2.5.3). */}
      <button className="tray-avatar" type="button" aria-haspopup="menu" aria-label={src ? `Account: ${name}` : `Account: ${name}, ${letters}`}>
        {src ? <img src={src} alt="" /> : letters}
      </button>
      <div
        className={cx('tray-pop', align === 'end' && 'tray-pop--end')}
        role="menu"
        data-open={initiallyOpen ? '' : undefined}
        hidden={initiallyOpen ? undefined : true}
      >
        <div className="tray-pop__head">
          <Avatar initials={letters} src={src} />
          <span className="tray-person__text">
            <b>{name}</b>
            {email != null ? <small>{email}</small> : null}
          </span>
        </div>
        <div className="tray-list">
          <hr className="tray-list__rule" />
          <MenuItems items={items} onCheckedChange={onCheckedChange} />
        </div>
      </div>
    </span>
  );
});
UserMenu.displayName = 'UserMenu';
