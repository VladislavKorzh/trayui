import * as React from 'react';

/** The bubble variant a Message asks of the Bubbles inside it, unless a Bubble sets its own. */
export type ChatBubbleVariant = 'fill' | 'own' | 'plain';

export const MessageContext = React.createContext<{ bubble: ChatBubbleVariant } | null>(null);

/** Turns a number into a CSS length (px); passes strings through. */
export function toLength(v: string | number | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}
