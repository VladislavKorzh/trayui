import * as React from 'react';
import { useFieldControl } from '../lib/field';
import { cx, runtime, useBehaviour, useControlled } from '../lib/util';
import { calendarHandle, useTrayOn, useIsoLayoutEffect, useMergedRef } from '../lib/menus';
import { Button } from './Button';
import { Icon } from './Icon';

/** A shortcut above the calendar that picks a range ending today. */
export interface DatePickerPreset {
  /** What it says: "Last 7 days". */
  label: string;
  /** How many days the range covers, today included: 7. */
  days: number;
}

export interface DatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  /** 'single' takes one date and closes as soon as it is picked (the default); 'range' takes a first and a last day. */
  mode?: 'single' | 'range';
  /** How many months sit side by side in the panel. Default 1 for a single date, 2 for a range, in the manner of travel booking pickers. */
  months?: 1 | 2;
  /** The picked date as 'YYYY-MM-DD', or a range as 'start/end', held by you. Pair it with `onChange`. `''` is nothing picked. */
  value?: string;
  /** The date or range picked at first, when `value` is left out. */
  defaultValue?: string;
  /**
   * Called with the new value whenever it changes: a pick, a preset, Clear. While a range has only its first day the value is 'start/'
   * and `complete` is false.
   */
  onChange?: (value: string, complete: boolean) => void;
  /** What the field says while nothing is picked, as an instruction. Default 'Pick a day'; "Pick a period" for a range. */
  placeholder?: string;
  /** The first day that can be picked, 'YYYY-MM-DD'. Set it to today for a delivery date. */
  min?: string;
  /** The last day that can be picked, 'YYYY-MM-DD'. Set it to today for a report period. */
  max?: string;
  /** The month shown first, 'YYYY-MM'. Default: the month of the value, or of today. */
  month?: string;
  /** Which day is today, 'YYYY-MM-DD': it carries a dot, and presets end on it. Default: the real today. */
  today?: string;
  /** The first day of the week: 1 Monday (the default) or 0 Sunday. */
  weekStart?: 0 | 1;
  /** A BCP 47 tag for month names and for the date in the field. Default 'en-GB', which reads "18 – 24 Nov 2026". */
  locale?: string;
  /** The name of the calendar's button that turns back a month, in the page's language. Default 'Previous month'. */
  prevLabel?: string;
  /** The name of the calendar's button that turns on a month, in the page's language. Default 'Next month'. */
  nextLabel?: string;
  /** Shortcuts above the calendar that pick the last N days: `[{ label: 'Last 7 days', days: 7 }]`. Offer them when a few ranges cover most needs, as in reports. */
  presets?: DatePickerPreset[];
  /** Adds Clear and Apply under the calendar; the panel then stays open until Apply is pressed. */
  apply?: boolean;
  /** 'start' (the default) lines the panel up with the field's start edge; 'end' with its end edge, for a field near the end of a row. */
  align?: 'start' | 'end';
  /** 'md' is 56px, as tall as an input (the default); 'sm' is 48px, for toolbars and report headers. */
  size?: 'md' | 'sm';
  /** The name the value is submitted under in a form; a hidden input carries 'YYYY-MM-DD' or 'start/end'. */
  name?: string;
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
  /** Whether the panel starts open: also holds it open in a static picture, until a click outside. Default false. */
  defaultOpen?: boolean;
  /** Called with `true` when the panel opens and `false` when it closes. */
  onOpenChange?: (open: boolean) => void;
}

/** What the field shows, as the datepicker behaviour writes it: the date, the range, "18 Nov 2026 – …" halfway through a range, or the placeholder. */
function shown(value: string, locale: string, placeholder: string): string {
  if (!value) return placeholder;
  const format = (v: string) => (typeof runtime.formatDate === 'function' ? runtime.formatDate(v, locale) : v);
  const [start, end] = value.split('/');
  if (value.indexOf('/') < 0 || end) return format(value);
  return format(start) + ' – …';
}

/**
 * A date picker is a field that opens a calendar and shows the chosen date in words.
 * Use it for a date near today (a delivery day, a report period); for a date of birth or a date years away, use plain fields.
 */
export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  {
    mode = 'single',
    months,
    value,
    defaultValue = '',
    onChange,
    placeholder,
    min,
    max,
    month,
    today,
    weekStart,
    locale = 'en-GB',
    prevLabel,
    nextLabel,
    presets,
    apply,
    align = 'start',
    size = 'md',
    name,
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
  const [current, setCurrent] = useControlled(value, defaultValue);
  const shownMonths = months ?? (mode === 'range' ? 2 : 1);
  const hint = placeholder ?? (mode === 'range' ? 'Pick a period' : 'Pick a day');
  const text = shown(current, locale, hint);
  // The behaviour owns the panel's `hidden` from here on: React only sets the first state, so the panel never flashes open.
  const [initiallyOpen] = React.useState(defaultOpen);
  // The calendar takes its options once, so a change of options draws a new picker.
  const optionsKey = [mode, shownMonths, min, max, month, today, weekStart, locale, prevLabel, nextLabel, apply ? 1 : 0].join('|');
  useBehaviour(ref, [optionsKey]);

  const take = (next: string, complete: boolean) => {
    if (next === current) return;
    setCurrent(next);
    onChange?.(next, complete);
  };
  useTrayOn(ref, 'change', (detail) => take(detail.value ?? '', detail.complete !== false), optionsKey);
  const report = (next: boolean) => (_detail: unknown, event: CustomEvent) => {
    if ((event.target as Element).parentElement === ref.current) onOpenChange?.(next);
  };
  useTrayOn(ref, 'open', report(true), optionsKey);
  useTrayOn(ref, 'close', report(false), optionsKey);

  const calendar = () => calendarHandle(ref.current?.querySelector('[data-tray~="calendar"]'));
  // Presets and Clear change the calendar without an event: read it back once the behaviour has run (its listener comes first).
  const readBack = () => {
    const v = calendar()?.value() ?? '';
    take(v, !v.endsWith('/'));
  };

  // A new value from outside moves the calendar and the field; a pick made in the panel already matches and is left alone.
  useIsoLayoutEffect(() => {
    const cal = calendar();
    if (cal && cal.value() !== current) cal.set(current);
    const root = ref.current;
    const shownEl = root?.querySelector('.tray-select-trigger__value');
    if (shownEl && shownEl.textContent !== text) shownEl.textContent = text;
    root?.querySelector('.tray-select-trigger')?.toggleAttribute('data-placeholder', !current);
  }, [current]);

  return (
    <div key={optionsKey} ref={setRef} className={cx('tray-anchor tray-anchor--block', className)} data-tray="datepicker" {...rest}>
      <button
        className={cx('tray-select-trigger', size === 'sm' && 'tray-select-trigger--sm')}
        type="button"
        data-placeholder={current ? undefined : ''}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        {...field}
      >
        <Icon name="calendar" />
        <span className="tray-select-trigger__value">{text}</span>
      </button>
      <div
        className={cx('tray-pop tray-pop--roomy', align === 'end' && 'tray-pop--end')}
        role="dialog"
        data-open={initiallyOpen ? '' : undefined}
        hidden={initiallyOpen ? undefined : true}
      >
        {presets && presets.length ? (
          <div className="tray-datepicker__presets">
            {presets.map((p, i) => (
              <Button key={i} variant="quiet" size="xs" data-preset={p.days} onClick={readBack}>
                {p.label}
              </Button>
            ))}
          </div>
        ) : null}
        <div
          data-tray="calendar"
          data-mode={mode}
          data-months={shownMonths}
          data-value={current}
          data-min={min}
          data-max={max}
          data-month={month}
          data-today={today}
          data-week-start={weekStart}
          data-locale={locale}
          data-prev-label={prevLabel}
          data-next-label={nextLabel}
        />
        {apply ? (
          <div className="tray-pop__foot">
            <Button variant="ghost" size="xs" data-clear="" onClick={readBack}>
              Clear
            </Button>
            <Button variant="dark" size="xs" data-apply="">
              Apply
            </Button>
          </div>
        ) : null}
      </div>
      <input type="hidden" name={name} value={current} />
    </div>
  );
});
DatePicker.displayName = 'DatePicker';
