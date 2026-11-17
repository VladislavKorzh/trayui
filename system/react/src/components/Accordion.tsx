import * as React from 'react';
import { cx, useControlled, useUid } from '../lib/util';
import { PlusTile, summaryClick } from '../lib/nav';

export interface AccordionItem {
  /** Names the item for `value`, `defaultValue` and `onChange`. Default: its position, '0', '1', '2'… */
  value?: string;
  /** The question, as a person would ask it: "How long does a jar keep?" */
  title: React.ReactNode;
  /** The answer. A string is set as one paragraph; pass elements for more. */
  content: React.ReactNode;
}

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'title'> {
  /** The questions and their answers, in order. */
  items: AccordionItem[];
  /** 'md' sets the questions in `subtitle` type (the default), for a page of questions; 'sm' sets them in `control` type, for settings and filters. */
  size?: 'md' | 'sm';
  /** Lets several items stay open at once. Default false: opening one closes the others. */
  multiple?: boolean;
  /** The open items, by `value`. Leave it out to let the accordion keep its own state. */
  value?: string[];
  /** The items open at first, when `value` is not controlled. Default: none. Open the first one when the answers are the point of the page. */
  defaultValue?: string[];
  /** Called with the open items' values when an item opens or closes. */
  onChange?: (value: string[]) => void;
}

/**
 * An accordion is a list of questions that open one at a time: hairline rows, a bold question, a plus tile that turns into a cross.
 * It is built on the browser's own `<details>`, so the answers stay searchable with find-in-page. Use it for questions and answers, never to hide what a person must read to finish a task.
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { items, size = 'md', multiple, value, defaultValue = [], onChange, className, ...rest },
  ref,
) {
  const name = useUid('accordion');
  const [open, setOpen] = useControlled(value, defaultValue, onChange);
  const latest = React.useRef(open);
  latest.current = open;
  const keyOf = (it: AccordionItem, i: number) => it.value ?? String(i);
  const set = (v: string, next: boolean) => {
    const now = latest.current;
    if (next === now.includes(v)) return;
    setOpen(next ? (multiple ? [...now, v] : [v]) : now.filter((x) => x !== v));
  };

  return (
    <div ref={ref} className={cx('tray-accordion', size === 'sm' && 'tray-accordion--sm', className)} {...rest}>
      {items.map((it, i) => {
        const v = keyOf(it, i);
        const isOpen = open.includes(v);
        const body = typeof it.content === 'string' || typeof it.content === 'number' ? 'p' : 'div';
        const Body = body as 'p';
        return (
          <details
            key={v}
            name={multiple ? undefined : name}
            open={isOpen}
            // the browser may open an item by itself (find-in-page): take its word for it
            onToggle={(e) => set(v, e.currentTarget.open)}
          >
            <summary onClick={summaryClick(isOpen, (next) => set(v, next))}>
              {it.title}
              <PlusTile />
            </summary>
            <Body className="tray-accordion__body">{it.content}</Body>
          </details>
        );
      })}
    </div>
  );
});
Accordion.displayName = 'Accordion';
