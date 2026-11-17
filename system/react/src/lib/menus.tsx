import * as React from 'react';
import type { IconSource } from './icon';
import { Icon } from '../components/Icon';
import type { MenuItem, MenuRadioItem } from '../components/DropdownMenu';
import { cx, type TrayEventName } from './util';

/* Shared by the menus (Select, Combobox, Command, DropdownMenu, ContextMenu, Menubar, NavigationMenu, Calendar, DatePicker).
   Not exported from the package. */

/** useLayoutEffect in the browser, useEffect on a server: the DOM work here must land before the first paint. */
export const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/** One ref callback that fills our own ref and the one forwarded to us. Keeps working when the root element is replaced (a `key` change). */
export function useMergedRef<T>(own: React.MutableRefObject<T | null>, forwarded: React.ForwardedRef<T>): React.RefCallback<T> {
  return React.useCallback(
    (el: T | null) => {
      own.current = el;
      if (typeof forwarded === 'function') forwarded(el);
      else if (forwarded) forwarded.current = el;
    },
    [own, forwarded],
  );
}

/** A counter to bump after a behaviour changed the DOM, so the effects that write React's state back run again. */
export function useTick(): [number, () => void] {
  return React.useReducer((n: number) => n + 1, 0) as [number, () => void];
}

/** What the system's behaviours put in `event.detail`. */
interface TrayDetail {
  value?: string;
  complete?: boolean;
}

/**
 * Like useTrayEvent, for a root element that can be replaced: listens again whenever `key` changes.
 * The event stops at the root, so a component around it does not take it for its own.
 */
export function useTrayOn<T extends Element>(ref: React.RefObject<T | null>, name: TrayEventName, handler: ((detail: TrayDetail, event: CustomEvent) => void) | undefined, key?: unknown): void {
  const saved = React.useRef(handler);
  saved.current = handler;
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const listen = (e: Event) => {
      e.stopPropagation();
      saved.current?.(((e as CustomEvent).detail || {}) as TrayDetail, e as CustomEvent);
    };
    el.addEventListener('tray:' + name, listen);
    return () => el.removeEventListener('tray:' + name, listen);
  }, [ref, name, key]);
}

/** The open/close handle the `menu` behaviour leaves on its anchor (`anchor.__menu`). */
export interface PopHandle {
  open(): void;
  close(focusBack?: boolean): void;
  isOpen(): boolean;
}
export function menuHandle(el: Element | null | undefined): PopHandle | undefined {
  return (el as (Element & { __menu?: PopHandle }) | null | undefined)?.__menu;
}

/** The handle `UI.calendar` returns and leaves on the element (`el.__calendar`). */
export interface CalendarHandle {
  value(): string;
  set(value: string): void;
}
export function calendarHandle(el: Element | null | undefined): CalendarHandle | undefined {
  return (el as (Element & { __calendar?: CalendarHandle }) | null | undefined)?.__calendar;
}

/* ---------- Menu items: the tray-option rows of Dropdown Menu, Context Menu and Menubar ---------- */

interface MenuContext {
  /** Every item of the menu, to find the radios of a group. */
  all: MenuItem[];
  onCheckedChange?: (value: string, checked: boolean) => void;
}

function radiosOf(items: MenuItem[], group: string, out: MenuRadioItem[] = []): MenuRadioItem[] {
  for (const it of items) {
    if (it.type === 'radio' && it.group === group) out.push(it);
    else if (it.type === 'submenu') radiosOf(it.items, group, out);
  }
  return out;
}

function lead(icon: IconSource | undefined) {
  return icon ? <Icon name={icon} /> : null;
}

function renderItem(item: MenuItem, i: number, ctx: MenuContext): React.ReactNode {
  switch (item.type) {
    case 'separator':
      return <hr key={i} className="tray-list__rule" />;
    case 'label':
      return (
        <div key={i} className="tray-list__label">
          {item.label}
        </div>
      );
    case 'submenu':
      return (
        <div key={i} className="tray-submenu">
          <button type="button" className="tray-option" role="menuitem" aria-haspopup="menu" tabIndex={-1} aria-disabled={item.disabled || undefined}>
            {lead(item.icon)}
            <span className="tray-option__text">{item.label}</span>
            <Icon name="chevron-right" size="sm" flip />
          </button>
          <div className="tray-pop tray-pop--side" role="menu">
            <div className="tray-list">{item.items.map((sub, j) => renderItem(sub, j, ctx))}</div>
          </div>
        </div>
      );
    case 'checkbox': {
      const value = item.value ?? item.label;
      // The behaviour flips aria-checked before this runs (its listener sits on the panel, React's on the root).
      const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (item.disabled) return;
        const el = e.currentTarget;
        let next = el.getAttribute('aria-checked') === 'true';
        if (item.checked !== undefined) {
          // Controlled: React owns the mark, so undo the behaviour's flip and ask for the change instead.
          el.setAttribute('aria-checked', String(item.checked));
          next = !item.checked;
        }
        item.onCheckedChange?.(next);
        ctx.onCheckedChange?.(value, next);
      };
      return (
        <button
          key={i}
          type="button"
          className="tray-option"
          role="menuitemcheckbox"
          aria-checked={item.checked ?? item.defaultChecked ?? false}
          aria-disabled={item.disabled || undefined}
          tabIndex={-1}
          data-value={value}
          onClick={onClick}
        >
          {lead(item.icon)}
          <span className="tray-option__text">{item.label}</span>
          {item.shortcut ? <span className="tray-option__meta">{item.shortcut}</span> : null}
          <Icon name="check" className="tray-option__check" />
        </button>
      );
    }
    case 'radio': {
      const value = item.value ?? item.label;
      const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (item.disabled) return;
        const radios = radiosOf(ctx.all, item.group);
        if (radios.some((r) => r.checked !== undefined)) {
          // Controlled radios: put back the marks React holds; the new choice arrives through the props.
          const panel = e.currentTarget.closest('[role="menu"]');
          const nodes = panel ? panel.querySelectorAll('[role="menuitemradio"]') : [];
          const inGroup = Array.prototype.filter.call(nodes, (n: Element) => n.getAttribute('data-group') === item.group) as Element[];
          radios.forEach((r, k) => {
            if (r.checked !== undefined && inGroup[k]) inGroup[k].setAttribute('aria-checked', String(r.checked));
          });
        }
        item.onSelect?.();
        ctx.onCheckedChange?.(value, true);
      };
      return (
        <button
          key={i}
          type="button"
          className="tray-option"
          role="menuitemradio"
          aria-checked={item.checked ?? item.defaultChecked ?? false}
          aria-disabled={item.disabled || undefined}
          data-group={item.group}
          tabIndex={-1}
          data-value={value}
          onClick={onClick}
        >
          {lead(item.icon)}
          <span className="tray-option__text">{item.label}</span>
          <Icon name="check" className="tray-option__check" />
        </button>
      );
    }
    default: {
      const body = (
        <>
          {lead(item.icon)}
          <span className="tray-option__text">{item.label}</span>
          {item.shortcut ? <span className="tray-option__meta">{item.shortcut}</span> : null}
        </>
      );
      const common = {
        className: cx('tray-option', item.danger && 'tray-option--danger'),
        role: 'menuitem',
        tabIndex: -1,
        'aria-disabled': item.disabled || undefined,
        'data-value': item.value ?? item.label,
        // The behaviour has already reported tray:select and closed the menu when this runs.
        onClick: () => {
          if (!item.disabled) item.onSelect?.();
        },
      };
      return item.href !== undefined ? (
        <a key={i} href={item.disabled ? undefined : item.href} {...common}>
          {body}
        </a>
      ) : (
        <button key={i} type="button" {...common}>
          {body}
        </button>
      );
    }
  }
}

/** The rows of a menu panel, in the system's markup: options, check and radio items, rules, labels and one level of submenus. */
export function MenuItems({ items, onCheckedChange }: { items: MenuItem[]; onCheckedChange?: (value: string, checked: boolean) => void }) {
  const ctx: MenuContext = { all: items, onCheckedChange };
  return <>{items.map((item, i) => renderItem(item, i, ctx))}</>;
}

/* ---------- Options: the tray-option rows of Select and Combobox ---------- */

interface ListOptionData {
  value: string;
  label: string;
  description?: string;
  icon?: IconSource;
  disabled?: boolean;
}

/** One option of a listbox. A second line makes it `tray-option--two`, with `data-label` so the field shows the name alone. */
export function ListOption({ option, selected, id }: { option: ListOptionData; selected: boolean; id?: string }) {
  const two = option.description != null;
  return (
    <button
      type="button"
      id={id}
      className={cx('tray-option', two && 'tray-option--two')}
      role="option"
      data-value={option.value}
      data-label={two ? option.label : undefined}
      aria-selected={selected}
      aria-disabled={option.disabled || undefined}
      tabIndex={-1}
    >
      {lead(option.icon)}
      <span className="tray-option__text">
        {two ? (
          <>
            <b>{option.label}</b>
            <small>{option.description}</small>
          </>
        ) : (
          option.label
        )}
      </span>
      <Icon name="check" className="tray-option__check" />
    </button>
  );
}
