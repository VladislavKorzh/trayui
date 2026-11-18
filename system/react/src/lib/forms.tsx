import * as React from 'react';

/**
 * For a control whose behaviour repaints on `input` (the `count` and `slider` behaviours): when its value is set from outside
 * (a controlled `value` that changed), sends a non-bubbling `input` event so the behaviour paints the new value.
 * The event does not bubble, so React's own onChange never sees it.
 */
export function useRepaint(ref: React.RefObject<HTMLElement | null>, value: unknown): void {
  // The value last painted, not whether the effect ran before: StrictMode runs it twice on mount, which is no change.
  const painted = React.useRef(value);
  React.useEffect(() => {
    if (Object.is(painted.current, value)) return;
    painted.current = value;
    if (value !== undefined) ref.current?.dispatchEvent(new Event('input'));
  }, [ref, value]);
}
