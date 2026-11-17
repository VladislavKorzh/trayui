import * as React from 'react';
import UI from '../runtime';

type ClassValue = string | false | null | undefined;

/** Joins class names, skipping the falsy ones. */
export function cx(...parts: ClassValue[]): string | undefined {
  const out = parts.filter(Boolean).join(' ');
  return out || undefined;
}

/** An id that is safe in a CSS selector and stable between server and client. */
export function useUid(prefix = 'tray'): string {
  return prefix + '-' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Wires up the system's own behaviours (the elements that carry `data-tray`) under the referenced element, once it is mounted.
 * Pass `deps` to wire again after the markup changes.
 */
export function useBehaviour<T extends Element>(ref: React.RefObject<T | null>, deps: React.DependencyList = []): void {
  React.useEffect(() => {
    if (ref.current) UI.init(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export type TrayEventName = 'change' | 'select' | 'open' | 'close' | 'complete';

interface TrayEventOptions {
  /** Only events fired by the referenced element itself, not those bubbling up from behaviours nested inside it. */
  own?: boolean;
  /** Listen again when these change, for a root element that React replaces. */
  deps?: React.DependencyList;
}

/**
 * Listens for one of the behaviours' events (`tray:change`, `tray:select`, `tray:open`, `tray:close`, `tray:complete`) on the referenced element
 * and passes its detail to the handler. The event stops there, so it is not mistaken for the same event of a component around it.
 * Call it BEFORE `useBehaviour` in the component: a behaviour may report its first state as soon as it is wired up.
 */
export function useTrayEvent<T extends Element>(
  ref: React.RefObject<T | null>,
  name: TrayEventName,
  handler?: (detail: any, event: CustomEvent) => void,
  options: TrayEventOptions = {},
): void {
  const saved = React.useRef(handler);
  saved.current = handler;
  const own = !!options.own;
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const listen = (e: Event) => {
      if (own && e.target !== el) return;
      e.stopPropagation();
      saved.current?.((e as CustomEvent).detail, e as CustomEvent);
    };
    el.addEventListener('tray:' + name, listen);
    return () => el.removeEventListener('tray:' + name, listen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, name, own, ...(options.deps ?? [])]);
}

/** Calls one of the system's functions: `chart`, `calendar`, `toast`, `formatDate`. */
export const runtime: {
  init(root?: Element | Document): void;
  chart(el: Element, config: unknown): { update(config: unknown): void };
  calendar(el: Element, options?: unknown): { value(): unknown; set(value: unknown): void };
  toast(options: unknown): { dismiss(): void };
  formatDate(value: unknown, locale?: string): string;
} = UI;

/** Uses the given ref when there is one, otherwise a ref of its own. The result can go straight onto an element's `ref`. */
export function useForwardedRef<T>(forwarded: React.ForwardedRef<T>): React.MutableRefObject<T | null> {
  const own = React.useRef<T | null>(null);
  React.useImperativeHandle(forwarded, () => own.current as T, []);
  return own;
}

/** A value that is controlled when `value` is given, and kept here otherwise. */
export function useControlled<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void): [T, (next: T) => void] {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value !== undefined ? value : inner;
  const set = React.useCallback(
    (next: T) => {
      if (value === undefined) setInner(next);
      onChange?.(next);
    },
    [value, onChange],
  );
  return [current, set];
}
