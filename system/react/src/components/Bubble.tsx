'use client';
import * as React from 'react';
import { MessageContext } from '../lib/chat';
import { cx, useBehaviour, useUid } from '../lib/util';

export type BubbleVariant = 'fill' | 'own' | 'plain';

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 'fill' is someone else's message: the resting fill of the ground. 'own' is yours: solid ink.
   * 'plain' has no surface at all: an assistant's long answer, set as prose (put each paragraph in a `<p>`).
   * Inside a Message it follows the Message's variant by itself (fill, own, or plain for the assistant), so leave it out there.
   * Outside a Message the default is 'fill'.
   */
  variant?: BubbleVariant;
  /**
   * Clamps a long message to three lines and puts a "Show more" link under the bubble that opens it (and then reads "Show less").
   * The text is wrapped in `tray-bubble__text` for you. A clamped bubble stands alone: it is not grouped with the bubbles beside it.
   * Default false.
   */
  clamp?: boolean;
}

/**
 * A bubble is the surface of a message: a soft block of fill around what was said.
 * Put it inside a Message, which sets its variant, the small corner beside the speaker, and groups several bubbles in a row.
 */
export const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(function Bubble({ variant, clamp, className, id, children, ...rest }, ref) {
  const message = React.useContext(MessageContext);
  const v = variant ?? message?.bubble ?? 'fill';
  const auto = useUid('bubble');
  const bubbleId = id ?? auto;
  const more = React.useRef<HTMLButtonElement>(null);
  useBehaviour(more, [clamp]);
  const classes = cx('tray-bubble', v !== 'fill' && `tray-bubble--${v}`, className);
  if (!clamp) {
    return (
      <div ref={ref} id={id} className={classes} {...rest}>
        {children}
      </div>
    );
  }
  return (
    <>
      <div ref={ref} id={bubbleId} className={classes} data-clamp="" {...rest}>
        <span className="tray-bubble__text">{children}</span>
      </div>
      <button ref={more} className="tray-btn tray-btn--link" type="button" data-tray="more" aria-controls={bubbleId}>
        Show more
      </button>
    </>
  );
});
Bubble.displayName = 'Bubble';
