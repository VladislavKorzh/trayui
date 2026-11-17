import * as React from 'react';
import { cx, useBehaviour, useForwardedRef, useUid } from '../lib/util';
import { Button } from './Button';

export interface DescriptionItem {
  /** The name of the fact, in soft ink: "Customer", "Tracking number". */
  term: React.ReactNode;
  /** Its value: text, a Badge, a link. Leave it out (or empty) and the row says `emptyText`, "None", in muted type. */
  value?: React.ReactNode;
  /** Sets the value in tabular figures, for amounts, dates and codes. */
  numeric?: boolean;
  /** Adds a small ghost button after the value that copies its text. Give the button's name: "Copy the tracking number". */
  copy?: string;
}

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  /** The facts, one pair per row, the most important first. */
  items: DescriptionItem[];
  /** The term over its value at every width, for a narrow column. By default the term sits in a 12rem column beside its value (and drops above it below 34rem). */
  stack?: boolean;
  /** No rules and tight rows, for three or four facts inside a card. */
  plain?: boolean;
  /** What an empty value says. Default 'None'. */
  emptyText?: React.ReactNode;
}

function isEmpty(v: React.ReactNode): boolean {
  return v == null || v === '' || v === false;
}

/**
 * A description list sets out the facts about one thing as pairs: the name of the fact in soft ink at the start edge, its value beside it, a hairline between rows.
 * Use it for the details of one order or one customer; values a person edits belong to a form, and several things side by side to a Table.
 */
export const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList(
  { items, stack, plain, emptyText = 'None', className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef(forwarded);
  const uid = useUid('dl');
  const copies = items.filter((it) => it.copy && !isEmpty(it.value)).length;
  // The system's `copy` behaviour on the copy buttons.
  useBehaviour(ref, [copies]);
  return (
    <dl ref={ref} className={cx('tray-dl', stack && 'tray-dl--stack', plain && 'tray-dl--plain', className)} {...rest}>
      {items.map((it, i) => {
        let dd: React.ReactNode;
        if (isEmpty(it.value)) {
          dd = (
            <dd className="tray-muted" style={{ fontWeight: 400 }}>
              {emptyText}
            </dd>
          );
        } else if (it.copy) {
          const id = `${uid}-${i}`;
          dd = (
            <dd>
              <span id={id} className={it.numeric ? 'tray-num' : undefined}>
                {it.value}
              </span>
              <Button variant="ghost" size="xs" icon="copy" aria-label={it.copy} data-tray="copy" data-target={'#' + id} />
            </dd>
          );
        } else {
          dd = <dd className={it.numeric ? 'tray-num' : undefined}>{it.value}</dd>;
        }
        return (
          <div key={i}>
            <dt>{it.term}</dt>
            {dd}
          </div>
        );
      })}
    </dl>
  );
});
DescriptionList.displayName = 'DescriptionList';
