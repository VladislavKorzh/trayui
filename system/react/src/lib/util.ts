import * as React from 'react';
import UI from '../runtime';

type ClassValue = string | false | null | undefined;

/** Joins class names, skipping the falsy ones. */
export function cx(...parts: ClassValue[]): string | undefined {
  const out = parts.filter(Boolean).join(' ');
  return out || undefined;
}

/** Turns a number into a CSS length (px); passes strings through. */
export function toLength(v: string | number | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

const LAZY = Symbol.for('react.lazy');
type Lazy = { $$typeof: symbol; _payload: unknown; _init: (payload: unknown) => unknown };
const isThenable = (v: unknown): v is PromiseLike<unknown> => !!v && typeof (v as { then?: unknown }).then === 'function';

/**
 * The node itself, for a component that reads or copies an element it was given (a trigger, an icon, a control).
 * An element that a Server Component passes may reach the browser as a lazy reference to it, still on its way
 * (Next.js sends large pages in parts): React draws such a reference, but cloneElement and isValidElement do not see an
 * element in it. Call it while rendering: it waits for the element as React would (React 19's `use`).
 */
export function resolveNode<T extends React.ReactNode>(node: T): T {
  if (!node || typeof node !== 'object' || (node as unknown as Lazy).$$typeof !== LAZY) return node;
  const lazy = node as unknown as Lazy;
  const use = (React as unknown as { use?: (p: PromiseLike<unknown>) => unknown }).use;
  return (use && isThenable(lazy._payload) ? use(lazy._payload) : lazy._init(lazy._payload)) as T;
}

/** An id that is safe in a CSS selector and stable between server and client. */
export function useUid(prefix = 'tray'): string {
  return prefix + '-' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
}

/** useLayoutEffect in the browser, useEffect on a server (where React 18 warns about a layout effect): for DOM work that must land before the first paint. */
export const useIsoLayoutEffect: typeof React.useLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/**
 * Wires up the system's own behaviours (the elements that carry `data-tray`) under the referenced element, once it is mounted.
 * Pass `deps` to wire again after the markup changes. Every component that has a behaviour calls it on its root; call it
 * yourself on markup written by hand, such as a block pasted into a component. Wiring twice does nothing.
 * It runs in an effect, after React has hydrated a server-rendered page, so the markup the server sent is what React finds.
 */
export function useBehaviour<T extends Element>(ref: React.RefObject<T | null>, deps: React.DependencyList = []): void {
  React.useEffect(() => {
    UI.sprite?.(); // the icon sprite, added once the runtime loads; again here if a render has taken it away
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

/**
 * The system's own functions: `init` wires the behaviours under an element (what `useBehaviour` does in an effect),
 * `chart`, `calendar`, `toast` and `formatDate`. In the browser only: on a server it is an empty object.
 */
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
