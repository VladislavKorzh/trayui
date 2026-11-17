import * as React from 'react';
import { cx, useBehaviour, useForwardedRef } from '../lib/util';
import { useOwnBcEvent } from '../lib/nav';

export interface ResizableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The first pane: on the start side, or on top when `orientation` is 'vertical'. Usually a list. */
  start: React.ReactNode;
  /** The second pane: on the end side, or below. Usually the detail of what is chosen in the first. */
  end: React.ReactNode;
  /** 'horizontal' (the default) puts the panes side by side and drags sideways; 'vertical' stacks them and drags up and down. A vertical split needs a height. */
  orientation?: 'horizontal' | 'vertical';
  /** The first pane's share at first, in percent. Default 50. Remember the size the person chose and pass it back here. */
  defaultSize?: number;
  /** The smallest share of the first pane, in percent. Default 20. */
  min?: number;
  /** The largest share of the first pane, in percent. Default 80. */
  max?: number;
  /** Called with the first pane's new share, in percent, while the handle is dragged or moved with the keys. */
  onSizeChange?: (size: number) => void;
  /** The handle's aria-label: what it resizes. Default 'Resize the panes'. "Resize the order list". */
  handleLabel?: string;
}

/**
 * Resizable splits a box into two panes with a handle between them that can be dragged, or moved with the arrow keys.
 * Use it for a list beside its detail on a wide screen; stack the panes on a phone instead.
 */
export const Resizable = React.forwardRef<HTMLDivElement, ResizableProps>(function Resizable(
  { start, end, orientation = 'horizontal', defaultSize = 50, min = 20, max = 80, onSizeChange, handleLabel = 'Resize the panes', className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef(forwarded);
  useBehaviour(ref);
  useOwnBcEvent(ref, 'change', (d: { size: number }) => onSizeChange?.(d.size));
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cx('tray-split', orientation === 'vertical' && 'tray-split--v', className)}
      data-tray="split"
      data-size={defaultSize}
      data-min={min}
      data-max={max}
      {...rest}
    >
      <div className="tray-split__pane">{start}</div>
      <button className="tray-split__handle" type="button" aria-label={handleLabel} />
      <div className="tray-split__pane">{end}</div>
    </div>
  );
});
Resizable.displayName = 'Resizable';
