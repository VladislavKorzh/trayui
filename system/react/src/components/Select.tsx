'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { useFieldControl } from '../lib/field';
import { cx, useTrayEvent, useBehaviour, useControlled, useUid } from '../lib/util';
import { ListOption, useIsoLayoutEffect, useMergedRef, useTick } from '../lib/menus';
import { Icon } from './Icon';

/** One option of a Select. */
export interface SelectOption {
  /** What `onChange` receives and the form submits: '50', 'courier'. */
  value: string;
  /** What the option says, and what the field shows once it is chosen: "50 g", "Courier, chilled box". */
  label: string;
  /** A second line in muted text, when labels alone do not tell options apart. The field still shows the label alone. */
  description?: string;
  /** An icon before the label. */
  icon?: IconSource;
  /** Dims the option; it cannot be chosen. */
  disabled?: boolean;
}

/** A named group of options, divided from its neighbours by a hairline: "To your door", "Collect it yourself". */
export interface SelectGroup {
  /** The group's name, a small muted heading. */
  label: string;
  /** The options under it. */
  options: SelectOption[];
}

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  /** The options, top to bottom: plain options, or `{ label, options }` groups. Keep it under about ten; beyond that use Combobox. */
  options: Array<SelectOption | SelectGroup>;
  /** The chosen option's value, held by you. Pair it with `onChange`. `''` means nothing is chosen. */
  value?: string;
  /** The option chosen at first, when `value` is left out. Default: none, and the field shows the placeholder. */
  defaultValue?: string;
  /** Called with the option's value when one is chosen. */
  onChange?: (value: string) => void;
  /** What the field says while nothing is chosen, as an instruction: "Choose a jar". Default 'Choose an option'. */
  placeholder?: string;
  /** The name the value is submitted under in a form; a hidden input carries it. */
  name?: string;
  /** 'md' is 56px, as tall as an input (the default); 'sm' is 48px, for toolbars and table filters. */
  size?: 'md' | 'sm';
  /** Marks the value as wrong: a 2px danger ring. Inside a Field, pass `error` to the Field instead. */
  invalid?: boolean;
  /** Dims the field; it cannot be opened. */
  disabled?: boolean;
  /** The trigger's id, for a `<label htmlFor>`. Inside a Field it comes from the Field. */
  id?: string;
  /** Names the field for screen readers when no label points at it. */
  'aria-label'?: string;
  /** The id of the element that names the field, when it is not a `<label>`. */
  'aria-labelledby'?: string;
  /** Whether the list starts open: also holds it open in a static picture, until a click outside. Default false. */
  defaultOpen?: boolean;
  /** Called with `true` when the list opens and `false` when it closes. */
  onOpenChange?: (open: boolean) => void;
}

function isGroup(entry: SelectOption | SelectGroup): entry is SelectGroup {
  return (entry as SelectGroup).options !== undefined;
}

/**
 * A select picks one option from a short list that opens under its trigger. The trigger looks like an input.
 * Use it for a handful of options in a form or a filter; for a list longer than a screen use Combobox, and in plain forms or on phones prefer Native Select.
 */
export const Select = React.forwardRef<HTMLDivElement, SelectProps>(function Select(
  {
    options,
    value,
    defaultValue = '',
    onChange,
    placeholder = 'Choose an option',
    name,
    size = 'md',
    invalid,
    disabled,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
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
  const listId = useUid('select');
  const [current, setCurrent] = useControlled(value, defaultValue, onChange);
  // The behaviour owns the panel's `hidden` from here on: React only sets the first state, so the list never flashes open.
  const [initiallyOpen] = React.useState(defaultOpen);
  const [tick, bump] = useTick();
  useBehaviour(ref);

  const flat = options.flatMap((e) => (isGroup(e) ? e.options : [e]));
  const chosen = flat.find((o) => o.value === current);
  const text = chosen ? chosen.label : placeholder;

  useTrayEvent(ref, 'change', (detail: { value?: string }) => {
    bump();
    if ((detail.value ?? '') !== current) setCurrent(detail.value ?? '');
  });
  const report = (next: boolean) => (_detail: unknown, event: CustomEvent) => {
    if ((event.target as Element).parentElement === ref.current) onOpenChange?.(next);
  };
  useTrayEvent(ref, 'open', report(true));
  useTrayEvent(ref, 'close', report(false));

  // The behaviour marks the choice in the DOM as it is made. Write React's value back after every choice and every new value,
  // so a parent that holds `value` and keeps it is still what the field shows.
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll('[role="option"]').forEach((o) => o.setAttribute('aria-selected', String(o.getAttribute('data-value') === current)));
    const trigger = root.querySelector('.tray-select-trigger');
    const shown = root.querySelector('.tray-select-trigger__value');
    if (shown && shown.textContent !== text) shown.textContent = text;
    trigger?.toggleAttribute('data-placeholder', !chosen);
    const hidden = root.querySelector<HTMLInputElement>('input[type="hidden"]');
    if (hidden) hidden.value = current;
  }, [current, tick, text]);

  const rows: React.ReactNode[] = [];
  options.forEach((entry, i) => {
    const prev = options[i - 1];
    if (i > 0 && (isGroup(entry) || (prev && isGroup(prev)))) rows.push(<hr key={`rule-${i}`} className="tray-list__rule" aria-hidden="true" />);
    if (isGroup(entry)) {
      // A group of options is a role="group" named by its label, so a screen reader says the group's name on entering it.
      const groupLabelId = `${listId}-group-${i}`;
      rows.push(
        <div key={`group-${i}`} role="group" aria-labelledby={groupLabelId}>
          <div className="tray-list__label" id={groupLabelId}>
            {entry.label}
          </div>
          {entry.options.map((o, j) => (
            <ListOption key={j} option={o} selected={o.value === current} />
          ))}
        </div>,
      );
    } else {
      rows.push(<ListOption key={i} option={entry} selected={entry.value === current} />);
    }
  });

  return (
    <div ref={setRef} className={cx('tray-anchor tray-anchor--block', className)} data-tray="select" {...rest}>
      <button
        className={cx('tray-select-trigger', size === 'sm' && 'tray-select-trigger--sm')}
        type="button"
        data-placeholder={chosen ? undefined : ''}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        {...field}
      >
        <span className="tray-select-trigger__value">{text}</span>
        <Icon name="chevrons-up-down" />
      </button>
      <div className="tray-pop" id={listId} role="listbox" data-open={initiallyOpen ? '' : undefined} hidden={initiallyOpen ? undefined : true}>
        <div className="tray-list">{rows}</div>
      </div>
      <input type="hidden" name={name} value={current} />
    </div>
  );
});
Select.displayName = 'Select';
