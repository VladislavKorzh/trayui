import * as React from 'react';
import { Icon } from '../components/Icon';

/** The 44px plus tile at the end of an accordion or collapsible summary; it turns into a cross while the details are open (CSS). */
export function PlusTile() {
  return (
    <span className="tray-tile" aria-hidden="true">
      <Icon name="plus" />
    </span>
  );
}

/**
 * Like `useTrayEvent` from util, but only for the events the referenced element fires itself: an event that bubbles up from a behaviour
 * inside it (a strip or a table in a pane) is left alone. Pass `enabled = false` to listen to nothing.
 */
export function useOwnBcEvent<T extends Element, D>(ref: React.RefObject<T | null>, name: 'change', handler: ((detail: D) => void) | undefined, enabled = true): void {
  const saved = React.useRef(handler);
  saved.current = handler;
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const listen = (e: Event) => {
      if (e.target !== el) return;
      e.stopPropagation();
      saved.current?.((e as CustomEvent<D>).detail);
    };
    el.addEventListener('tray:' + name, listen);
    return () => el.removeEventListener('tray:' + name, listen);
  }, [ref, name, enabled]);
}

/**
 * A summary click handler that leaves the `open` attribute to React: it stops the browser's own toggle and asks for the next state.
 * Enter and Space on a focused summary arrive here as a click too.
 */
export function summaryClick(open: boolean, set: (next: boolean) => void) {
  return (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    set(!open);
  };
}
