import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { useFieldControl } from '../lib/field';
import { cx, useTrayEvent, useBehaviour, useControlled, useUid } from '../lib/util';
import { ListOption, useIsoLayoutEffect, useMergedRef, useTick } from '../lib/menus';
import { Icon } from './Icon';

/** One option of a Combobox. */
export interface ComboboxOption {
  /** What `onChange` receives: 'lviv', 'oksana'. */
  value: string;
  /** What the option says, and what the field holds once it is taken: "Lviv", "Oksana Franko". Typing matches against it. */
  label: string;
  /** A second line in muted text, when names repeat or need a role beside them: "Farm manager". */
  description?: string;
}

export interface ComboboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  /** Every option, in a sensible order (alphabetical for places and people). Typing narrows the list to the ones that contain the text. */
  options: ComboboxOption[];
  /** The taken option's value, held by you. Pair it with `onChange`. `''` means none is taken. */
  value?: string;
  /** The option taken at first, when `value` is left out. Default: none. */
  defaultValue?: string;
  /** Called with the option's value when one is taken (a click, or Enter on the highlighted one). */
  onChange?: (value: string) => void;
  /** Called with the text as it is typed, to fetch options from elsewhere. */
  onQueryChange?: (query: string) => void;
  /** The text in the field at first, which also narrows the list. Default: the label of the taken option, or nothing. */
  defaultQuery?: string;
  /** The field's placeholder, saying what to look for: "Find a city". */
  placeholder?: string;
  /** The icon at the start of the field. Default 'search'; 'user' for people, 'map-pin' for places. */
  icon?: IconSource;
  /** The sentence shown when nothing matches, saying what to do next: "No city by that name. Check the spelling." Default "Nothing matches. Check the spelling." */
  emptyText?: React.ReactNode;
  /** Marks the value as wrong: a 2px danger ring. Inside a Field, pass `error` to the Field instead. */
  invalid?: boolean;
  /** Dims the field; nothing can be typed or taken. */
  disabled?: boolean;
  /** The input's id, for a `<label htmlFor>`. Inside a Field it comes from the Field. */
  id?: string;
  /** Names the field for screen readers when no label points at it. */
  'aria-label'?: string;
  /** Whether the list starts open: also holds it open in a static picture, until a click outside. Default false. */
  defaultOpen?: boolean;
  /** Called with `true` when the list opens and `false` when it closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * A combobox is a field that filters a list as you type and takes one of its options.
 * Use it when the list is longer than a screen (cities, countries, people); for five options a Select or a Radio Group is faster.
 */
export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(function Combobox(
  {
    options,
    value,
    defaultValue = '',
    onChange,
    onQueryChange,
    defaultQuery,
    placeholder,
    icon = 'search',
    emptyText = 'Nothing matches. Check the spelling.',
    invalid,
    disabled,
    id,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalid,
    defaultOpen = false,
    onOpenChange,
    className,
    ...rest
  },
  forwarded,
) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const setRef = useMergedRef(ref, forwarded);
  const field = useFieldControl({ id, disabled, invalid, 'aria-describedby': ariaDescribedby, 'aria-invalid': ariaInvalid });
  const listId = useUid('combobox');
  const [current, setCurrent] = useControlled(value, defaultValue, onChange);
  // The behaviour owns the panel's and the options' `hidden` from here on: React only sets the first state.
  const [initiallyOpen] = React.useState(defaultOpen);
  const [firstText] = React.useState(() => defaultQuery ?? options.find((o) => o.value === current)?.label ?? '');
  const [tick, bump] = useTick();
  useBehaviour(ref);

  useTrayEvent(ref, 'change', (detail: { value?: string }) => {
    bump();
    if ((detail.value ?? '') !== current) setCurrent(detail.value ?? '');
  });
  const report = (next: boolean) => (_detail: unknown, event: CustomEvent) => {
    if ((event.target as Element).closest('.tray-anchor') === ref.current && (event.target as Element).tagName === 'INPUT') onOpenChange?.(next);
  };
  useTrayEvent(ref, 'open', report(true));
  useTrayEvent(ref, 'close', report(false));

  // Write React's value back after every choice and every new value: the mark on the taken option, and the field's text.
  // The text is left alone between choices, so typing is never undone.
  const label = options.find((o) => o.value === current)?.label;
  const synced = React.useRef({ current, tick });
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll('[role="option"]').forEach((o) => o.setAttribute('aria-selected', String(o.getAttribute('data-value') === current)));
    const before = synced.current;
    synced.current = { current, tick };
    if (before.current === current && before.tick === tick) return;
    const input = root.querySelector('input');
    if (input && label !== undefined && input.value !== label) input.value = label;
    else if (input && current === '' && before.current !== '') input.value = '';
  }, [current, tick, label]);

  return (
    <div ref={setRef} className={cx('tray-anchor tray-anchor--block', className)} data-tray="combobox" {...rest}>
      <div className="tray-input-group">
        <span className="tray-input-group__addon">
          <Icon name={icon} />
        </span>
        <input
          className="tray-input"
          placeholder={placeholder}
          defaultValue={firstText}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          autoComplete="off"
          aria-label={ariaLabel}
          onChange={onQueryChange ? (e) => onQueryChange(e.currentTarget.value) : undefined}
          {...field}
        />
      </div>
      <div className="tray-pop" id={listId} role="listbox" data-open={initiallyOpen ? '' : undefined} hidden={initiallyOpen ? undefined : true}>
        <div className="tray-list">
          {options.map((o, i) => (
            <ListOption key={i} id={`${listId}-${i}`} option={o} selected={o.value === current} />
          ))}
          <div className="tray-list__empty" hidden>
            {emptyText}
          </div>
        </div>
      </div>
    </div>
  );
});
Combobox.displayName = 'Combobox';
