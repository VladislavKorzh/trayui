import * as React from 'react';
import { cx, useBehaviour, useForwardedRef } from '../lib/util';
import { toLength } from '../lib/chat';
import { Button } from './Button';
import { Icon } from './Icon';

export interface MessageScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Names the conversation for screen readers: "Conversation with the farm". Required: the message list is a focusable log region. */
  label: string;
  /** The scroller's height: a CSS length such as '22rem', or a number of pixels. Default '24rem'. */
  height?: string | number;
  /** 'end' opens at the newest message (the default); 'top' opens at the first, for a transcript that is read from the start. */
  start?: 'end' | 'top';
  /** The words on the button that appears when the reader has scrolled back. Default 'Latest'. */
  jumpLabel?: React.ReactNode;
  /**
   * Shows the composer under the scroller: a field-shaped tray with a text field and a yellow send button.
   * Default true when `onSend` is given, otherwise false.
   */
  composer?: boolean;
  /** Called with the trimmed text when the person sends a message (the send button, or Enter; Shift+Enter starts a new line). The field then clears. */
  onSend?: (text: string) => void;
  /** The composer's placeholder. Default 'Write a message'. */
  placeholder?: string;
  /** The name of the composer's text field for screen readers. Default 'Message'. */
  composerLabel?: string;
  /** The name of the send button for screen readers. Default 'Send'. */
  sendLabel?: string;
  /** Disables the send button, for example while an answer is being written. Typing still works. Default false. */
  sendDisabled?: boolean;
  /** The conversation: Messages, with Markers between them. They are stacked in a `tray-thread` for you. */
  children?: React.ReactNode;
}

type ScrollerEl = HTMLDivElement & { __pinned?: boolean; __scroller?: { toEnd(smooth: boolean): void } };

/**
 * The message scroller is the window a conversation lives in: it keeps the newest message in view, and steps aside when the reader scrolls back.
 * Once the reader has scrolled up, new messages are counted on a "Latest" button instead of moving the view. The composer sits under it.
 */
export const MessageScroller = React.forwardRef<HTMLDivElement, MessageScrollerProps>(function MessageScroller(
  {
    label,
    height,
    start = 'end',
    jumpLabel = 'Latest',
    composer,
    onSend,
    placeholder = 'Write a message',
    composerLabel = 'Message',
    sendLabel = 'Send',
    sendDisabled,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const own = useForwardedRef(ref);
  const thread = React.useRef<HTMLDivElement>(null);
  const field = React.useRef<HTMLTextAreaElement>(null);
  useBehaviour(own);

  // Follow text that grows inside the last message (a streamed answer) while the reader is at the end.
  React.useEffect(() => {
    const root = own.current as ScrollerEl | null;
    const list = thread.current;
    if (!root || !list || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (root.__pinned && root.__scroller) root.__scroller.toEnd(false);
    });
    ro.observe(list);
    return () => ro.disconnect();
  }, [own]);

  const send = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const area = field.current;
    if (!area || sendDisabled) return;
    const text = area.value.trim();
    if (!text) return;
    onSend?.(text);
    area.value = '';
  };
  const keys = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const vars = height !== undefined ? ({ '--tray-scroller': toLength(height) } as React.CSSProperties) : undefined;
  const scroller = (
    <div
      ref={own as React.RefObject<HTMLDivElement>}
      className={cx('tray-scroller', className)}
      data-tray="scroller"
      data-start={start === 'top' ? 'top' : undefined}
      style={vars || style ? { ...vars, ...style } : undefined}
      {...rest}
    >
      <div className="tray-scroller__viewport" aria-label={label} role="log" tabIndex={0}>
        <div className="tray-thread" ref={thread}>
          {children}
        </div>
      </div>
      <button className="tray-btn tray-btn--quiet tray-btn--xs tray-scroller__jump" type="button" hidden={start !== 'top'}>
        <Icon name="arrow-down" size="sm" />
        {jumpLabel}
        <span className="tray-badge tray-badge--count tray-badge--ink" data-count="" hidden />
      </button>
    </div>
  );
  if (!(composer ?? onSend !== undefined)) return scroller;
  return (
    <>
      {scroller}
      <form className="tray-composer" onSubmit={send}>
        <textarea ref={field} rows={1} placeholder={placeholder} aria-label={composerLabel} onKeyDown={keys} />
        <Button size="sm" icon="arrow-up" type="submit" aria-label={sendLabel} disabled={sendDisabled} />
      </form>
    </>
  );
});
MessageScroller.displayName = 'MessageScroller';
