import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { MessageContext, type ChatBubbleVariant } from '../lib/chat';
import { cx, useBehaviour, useForwardedRef } from '../lib/util';
import { Avatar } from './Avatar';
import { Bubble, type BubbleProps } from './Bubble';
import { Button } from './Button';
import { Icon } from './Icon';

export type MessageVariant = 'other' | 'own' | 'assistant';

/** One reaction under a message: an icon and how many people chose it. */
export interface MessageReaction {
  /** The reaction's icon, such as 'thumbs-up' or 'heart'. */
  icon: IconSource;
  /** What it means, read by screen readers: "Thumbs up", "Heart". */
  label: string;
  /** How many people reacted this way so far, yourself included. */
  count: number;
  /** Whether you are one of them: your own reaction is solid ink. Default false. */
  pressed?: boolean;
}

/** One ghost icon button under an answer: copy, rate, retry. */
export interface MessageAction {
  /** The icon, such as 'copy', 'thumbs-up' or 'rotate-cw'. */
  icon: IconSource;
  /** What the button does, read by screen readers: "Copy the answer". */
  label: string;
  /** Called when it is pressed. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Who speaks. 'other' (the default) is someone else, at the start edge, in fill bubbles.
   * 'own' is you: at the end edge, in ink bubbles, usually with no avatar or name.
   * 'assistant' is the product's assistant: plain bubbles set as prose, the yellow sparkle avatar, aligned to the top of the answer.
   */
  variant?: MessageVariant;
  /** The speaker's name, in bold in the head. Skip it on the second message in a row from the same person. */
  author?: React.ReactNode;
  /** The time as the person's clock shows it: "14:02". Shown in the head after the name. */
  time?: React.ReactNode;
  /**
   * The avatar beside the message. A string is taken as initials ("OF"); or pass an `<Avatar size="sm" />` of your own.
   * Leave it out for your own messages and in one-to-one chats. With variant 'assistant' the sparkle avatar is drawn
   * unless you pass another one, or `null` for none.
   */
  avatar?: React.ReactNode;
  /** Where the avatar sits: 'bottom' beside the last line (the default), or 'top' beside the head, for long answers. Default 'top' for the assistant. */
  avatarAlign?: 'bottom' | 'top';
  /**
   * Reactions under the bubbles, as icon and count chips. They are the starting state: pressing one toggles it and moves its count
   * by itself (the `reaction` behaviour), and `onReact` reports the new state.
   */
  reactions?: MessageReaction[];
  /** Called after a reaction is pressed, with its new state (`pressed`, `count`) and its index. */
  onReact?: (reaction: MessageReaction, index: number) => void;
  /** A line under the message in caption type: the delivery state or an edit note. `<><Icon name="check" size="sm" />Delivered</>`. */
  footer?: React.ReactNode;
  /** Ghost icon buttons under an answer: copy, rate, retry. Three or fewer; for more, use a menu. */
  actions?: MessageAction[];
  /**
   * What was said. Text and plain elements (`<p>`, `<a>`, `<b>`) are put in one Bubble for you.
   * Pass Bubbles yourself for several in a row (they are grouped 4px apart) or for a clamped one;
   * Attachments, a CodeBlock or a Trace sit in the same column, outside the bubble.
   */
  children?: React.ReactNode;
}

const bubbleFor: Record<MessageVariant, ChatBubbleVariant> = { other: 'fill', own: 'own', assistant: 'plain' };

/** Is this child bubble content: text, or an HTML element that is not itself a system part? */
function isBubbleContent(child: React.ReactNode): boolean {
  if (typeof child === 'string') return child.trim() !== '';
  if (typeof child === 'number') return true;
  if (!React.isValidElement(child) || typeof child.type !== 'string') return false;
  const cls = (child.props as { className?: string }).className;
  return !(cls && /(^|\s)tray-/.test(cls));
}

function isGroupable(child: React.ReactNode): child is React.ReactElement<BubbleProps> {
  return React.isValidElement(child) && child.type === Bubble && !(child.props as BubbleProps).clamp;
}

/** Puts loose text in a Bubble and groups Bubbles that follow each other. */
function arrange(children: React.ReactNode): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let loose: React.ReactNode[] = [];
  let run: React.ReactElement[] = [];
  const flushLoose = () => {
    if (loose.length) run.push(<Bubble key={`text-${out.length}-${run.length}`}>{loose}</Bubble>);
    loose = [];
  };
  const flushRun = () => {
    flushLoose();
    if (run.length > 1) {
      out.push(
        <div className="tray-bubble-group" key={`group-${out.length}`}>
          {run}
        </div>,
      );
    } else out.push(...run);
    run = [];
  };
  React.Children.toArray(children).forEach((child) => {
    if (isBubbleContent(child)) loose.push(child);
    else if (typeof child === 'string') {
      if (loose.length) loose.push(child); // a space between two pieces of text
    } else if (isGroupable(child)) {
      flushLoose();
      run.push(child);
    } else {
      flushRun();
      out.push(child);
    }
  });
  flushRun();
  return out;
}

/**
 * A message is one row of a conversation: who spoke, what they said, and what happened to it.
 * Stack messages in a `<div className="tray-thread">` (or a MessageScroller), with Markers between them for dates and events.
 */
export const Message = React.forwardRef<HTMLDivElement, MessageProps>(function Message(
  { variant = 'other', author, time, avatar, avatarAlign, reactions, onReact, footer, actions, className, children, ...rest },
  ref,
) {
  const own = useForwardedRef(ref);
  useBehaviour(own, [reactions?.length ?? 0]);
  const ctx = React.useMemo(() => ({ bubble: bubbleFor[variant] }), [variant]);
  const top = (avatarAlign ?? (variant === 'assistant' ? 'top' : 'bottom')) === 'top';
  const avatarEl =
    avatar === undefined ? (
      variant === 'assistant' ? (
        <Avatar size="sm" tone="accent" icon="sparkle" label="Assistant" />
      ) : null
    ) : typeof avatar === 'string' ? (
      <Avatar size="sm" initials={avatar} />
    ) : (
      avatar
    );
  const react = (r: MessageReaction, i: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onReact) return;
    const btn = e.currentTarget;
    const count = Number(btn.querySelector('[data-count]')?.textContent ?? r.count);
    onReact({ ...r, pressed: btn.getAttribute('aria-pressed') === 'true', count: Number.isFinite(count) ? count : r.count }, i);
  };
  return (
    <MessageContext.Provider value={ctx}>
      <div ref={own as React.RefObject<HTMLDivElement>} className={cx('tray-message', variant === 'own' && 'tray-message--end', top && 'tray-message--top', className)} {...rest}>
        {avatarEl}
        <div className="tray-message__content">
          {author != null || time != null ? (
            <div className="tray-message__head">
              {author != null ? <b>{author}</b> : null}
              {time}
            </div>
          ) : null}
          {arrange(children)}
          {reactions && reactions.length ? (
            <div className="tray-reactions">
              {reactions.map((r, i) => (
                <button
                  key={i}
                  className="tray-reaction"
                  type="button"
                  data-tray="reaction"
                  aria-pressed={r.pressed ? 'true' : 'false'}
                  onClick={react(r, i)}
                >
                  {/* named by its words and its count ("Thumbs up, 2"): an aria-label would hide the count */}
                  <Icon name={r.icon} size="sm" />
                  <span className="tray-vh">{r.label}, </span>
                  <span data-count="">{r.count}</span>
                </button>
              ))}
            </div>
          ) : null}
          {footer != null ? <div className="tray-message__foot">{footer}</div> : null}
          {actions && actions.length ? (
            <div className="tray-message__actions">
              {actions.map((a, i) => (
                <Button key={i} variant="ghost" size="xs" icon={a.icon} aria-label={a.label} onClick={a.onClick} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </MessageContext.Provider>
  );
});
Message.displayName = 'Message';
