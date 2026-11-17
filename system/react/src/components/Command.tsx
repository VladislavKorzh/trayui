import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx, useTrayEvent, useBehaviour, useUid } from '../lib/util';
import { useMergedRef } from '../lib/menus';
import { Icon } from './Icon';
import { Kbd } from './Kbd';

/** One destination or action in the palette. */
export interface CommandItem {
  /** A place by its title ("Orders"), an action with a verb ("Create an order"). Typing matches against it. */
  label: string;
  /** What `onSelect` of the palette receives. Default: the label. */
  value?: string;
  /** One icon per item; every item of the palette has one. */
  icon?: IconSource;
  /** The keyboard shortcut, one cap per key: ['Ctrl', 'N'], ['G', 'O']. */
  shortcut?: string[];
  /** Runs when the item is chosen: a click, or Enter on the highlighted one. */
  onSelect?: () => void;
}

/** A named group of items: "Go to", "Actions", "Recent orders". It disappears while nothing in it matches. */
export interface CommandGroup {
  /** The group's name, a small muted heading. */
  label?: string;
  /** Its items, most used first. */
  items: CommandItem[];
}

export interface CommandProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  /** The groups, top to bottom: what people do most comes first, before they type. */
  groups: CommandGroup[];
  /** The field's placeholder. Default 'Search or run a command'. */
  placeholder?: string;
  /** Names the field for screen readers. Default 'Command'. */
  'aria-label'?: string;
  /** The text in the field at first, which also narrows the list. */
  defaultQuery?: string;
  /** The sentence shown when nothing matches. Default "Nothing matches. Try another word." */
  emptyText?: React.ReactNode;
  /** Shows the key hints at the foot: arrows to move, Enter to run, Esc to close. Default true. */
  hints?: boolean;
  /** Called with the item's `value` (or its label) when an item is chosen. Each item's own `onSelect` runs too. */
  onSelect?: (value: string) => void;
}

/**
 * Command is a search field over a list of destinations and actions: type a few letters, press Enter.
 * It usually opens in a Dialog from a shortcut (Ctrl K) and from a visible search button; it is never the only way to reach anything.
 */
export const Command = React.forwardRef<HTMLDivElement, CommandProps>(function Command(
  {
    groups,
    placeholder = 'Search or run a command',
    'aria-label': ariaLabel = 'Command',
    defaultQuery,
    emptyText = 'Nothing matches. Try another word.',
    hints = true,
    onSelect,
    className,
    ...rest
  },
  forwarded,
) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const setRef = useMergedRef(ref, forwarded);
  const listId = useUid('command');
  useBehaviour(ref);

  // The behaviour reports Enter and clicks alike with tray:select; find the item by its value to run its own onSelect.
  useTrayEvent(ref, 'select', (detail: { value?: string }) => {
    const v = detail.value ?? '';
    for (const g of groups) {
      const hit = g.items.find((it) => (it.value ?? it.label) === v);
      if (hit) {
        hit.onSelect?.();
        break;
      }
    }
    onSelect?.(v);
  });

  return (
    <div ref={setRef} className={cx('tray-command', className)} data-tray="command" {...rest}>
      <label className="tray-command__search">
        <Icon name="search" />
        <input
          placeholder={placeholder}
          aria-label={ariaLabel}
          defaultValue={defaultQuery}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          autoComplete="off"
        />
      </label>
      <div className="tray-command__list" id={listId} role="listbox">
        {groups.map((g, i) => (
          <div key={i} data-group="" role="group" aria-labelledby={g.label ? `${listId}-g${i}` : undefined}>
            {g.label ? (
              <div className="tray-list__label" id={`${listId}-g${i}`}>
                {g.label}
              </div>
            ) : null}
            {g.items.map((it, j) => (
              <button key={j} type="button" className="tray-option" role="option" id={`${listId}-${i}-${j}`} tabIndex={-1} data-value={it.value ?? it.label}>
                {it.icon ? <Icon name={it.icon} /> : null}
                <span className="tray-option__text">{it.label}</span>
                {it.shortcut && it.shortcut.length ? <Kbd keys={it.shortcut} className="tray-option__meta" /> : null}
              </button>
            ))}
          </div>
        ))}
        <div className="tray-list__empty" hidden>
          {emptyText}
        </div>
      </div>
      {hints ? (
        <div className="tray-command__foot">
          <span>
            <kbd className="tray-kbd">↑</kbd>
            <kbd className="tray-kbd">↓</kbd> to move
          </span>
          <span>
            <kbd className="tray-kbd">Enter</kbd> to run
          </span>
          <span>
            <kbd className="tray-kbd">Esc</kbd> to close
          </span>
        </div>
      ) : null}
    </div>
  );
});
Command.displayName = 'Command';
