import * as React from 'react';
import { useTrayEvent, useBehaviour } from './util';
import { useMergedRef, useTick } from './menus';

/* Shared by the app shell (AppShell, TopBar, WorkspaceSwitcher, UserMenu, NotificationCenter). Not exported from the package. */

/** What an AppShell tells the TopBar inside it: which sidebar to collapse, its state, and how to open the navigation on a phone. */
export interface ShellState {
  sidebarId: string;
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
  openMenu: () => void;
}

export const ShellContext = React.createContext<ShellState | null>(null);

/* The width below which the app shell hides its sidebar (`@media (max-width: 56rem)` in 80-saas.css). */
const NARROW = '(max-width: 56rem)';

function watchNarrow(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia(NARROW);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** True while the window is narrow enough for the app shell to hide its sidebar. False on a server. */
export function useNarrow(): boolean {
  return React.useSyncExternalStore(
    watchNarrow,
    () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(NARROW).matches,
    () => false,
  );
}

/** One or two capitals from a name: "Perly Farm" gives "PF", "Oksana" gives "O". */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

interface PopHandle {
  open(): void;
  close(focusBack?: boolean): void;
  isOpen(): boolean;
}

type Anchor = HTMLElement & { __menu?: PopHandle; __popover?: PopHandle };

interface PopAnchorOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The `menu` behaviour's tray:select, with the chosen item's value. */
  onSelect?: (value: string) => void;
}

/**
 * The anchor of a `menu` or `popover` behaviour (a trigger and a `.tray-pop` as its children), with the open state of DropdownMenu and Popover:
 * `open` follows from outside, `defaultOpen` holds it open in a static picture, `onOpenChange` reports the trigger, a click outside and Escape.
 * The behaviour owns the panel's `hidden`: render it with `initiallyOpen` only (`data-open` and `hidden`), so the two never fight.
 */
export function usePopAnchor<T extends HTMLElement>(kind: 'menu' | 'popover', forwarded: React.ForwardedRef<T>, options: PopAnchorOptions) {
  const { open, defaultOpen = false, onOpenChange, onSelect } = options;
  const ref = React.useRef<T | null>(null);
  const setRef = useMergedRef(ref, forwarded);
  const [initiallyOpen] = React.useState(() => open ?? defaultOpen);
  const [tick, bump] = useTick();

  const report = (next: boolean) => (_detail: unknown, event: CustomEvent) => {
    if ((event.target as Element).parentElement !== ref.current) return;
    bump();
    onOpenChange?.(next);
  };
  useTrayEvent(ref, 'open', report(true));
  useTrayEvent(ref, 'close', report(false));
  useTrayEvent(ref, 'select', (detail: { value?: string } | undefined) => onSelect?.(detail?.value ?? ''));
  useBehaviour(ref);

  const handle = React.useCallback((): PopHandle | undefined => {
    const el = ref.current as Anchor | null;
    return kind === 'menu' ? el?.__menu : el?.__popover;
  }, [kind]);

  // Controlled: follow `open`, also after the panel opened or closed itself and the owner did not agree.
  React.useEffect(() => {
    const pop = handle();
    if (open === undefined || !pop || pop.isOpen() === open) return;
    if (open) pop.open();
    else pop.close();
  }, [open, tick, handle]);

  return { ref, setRef, initiallyOpen, handle };
}
