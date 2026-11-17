import * as React from 'react';

/**
 * For a control whose behaviour repaints on `input` (the `count` and `slider` behaviours): when its value is set from outside
 * (a controlled `value` that changed), sends a non-bubbling `input` event so the behaviour paints the new value.
 * The event does not bubble, so React's own onChange never sees it.
 */
export function useRepaint(ref: React.RefObject<HTMLElement | null>, value: unknown): void {
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (value !== undefined) ref.current?.dispatchEvent(new Event('input'));
  }, [ref, value]);
}

/**
 * For a group control inside a Field (InputOTP): the Field's label points at the first cell with `for`, but the group needs a name
 * of its own. Gives the Field's label an id (when it has none) and returns it, so the group can be aria-labelledby it.
 */
export function useFieldLabel(rootRef: React.RefObject<HTMLElement | null>, controlId: string | undefined, active: boolean): string | undefined {
  const [labelId, setLabelId] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    if (!active || !controlId) return;
    const field = rootRef.current?.closest('.tray-field');
    const label = field?.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(controlId)}"]`);
    if (!label) return;
    if (!label.id) label.id = `${controlId}-label`;
    setLabelId(label.id);
  }, [rootRef, controlId, active]);
  return labelId;
}
