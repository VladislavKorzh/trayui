'use client';
import * as React from 'react';
import { useStaticMode } from '../lib/static';
import { cx, runtime, useControlled } from '../lib/util';
import { calendarHandle, useTrayOn, useIsoLayoutEffect, useMergedRef, type CalendarHandle } from '../lib/menus';

export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  /** 'single' takes one date (the default); 'range' takes a first and a last day, joined by a grey band. */
  mode?: 'single' | 'range';
  /** How many months sit side by side: 1 (the default) or 2. Two months suit a range. */
  months?: 1 | 2;
  /** The picked date as 'YYYY-MM-DD', or a range as 'start/end' ('2026-11-18/2026-11-24'), held by you. Pair it with `onChange`. `''` is nothing picked. */
  value?: string;
  /** The date or range picked at first, when `value` is left out. */
  defaultValue?: string;
  /**
   * Called on every pick with the new value and whether it is complete. While a range has only its first day the value is 'start/'
   * and `complete` is false.
   */
  onChange?: (value: string, complete: boolean) => void;
  /** The first day that can be picked, 'YYYY-MM-DD'. Set it when the past makes no sense, as for a delivery date. */
  min?: string;
  /** The last day that can be picked, 'YYYY-MM-DD'. */
  max?: string;
  /** The month shown first, 'YYYY-MM'. Default: the month of the value, or of today. */
  month?: string;
  /** Which day is today, 'YYYY-MM-DD'; it carries a small dot. Default: the real today. */
  today?: string;
  /** The first day of the week: 1 Monday (the default) or 0 Sunday. */
  weekStart?: 0 | 1;
  /** A BCP 47 tag for the names of months and weekdays. Default 'en-GB'. */
  locale?: string;
  /** The name of the button that turns back a month, in the page's language. Default 'Previous month'. */
  prevLabel?: string;
  /** The name of the button that turns on a month, in the page's language. Default 'Next month'. */
  nextLabel?: string;
}

/**
 * A calendar shows a month as a grid of days and takes one date or a range.
 * Use it on its own in a page or a panel; inside a form, a Date Picker opens one from a field. Do not use it for a date of birth: three plain fields are faster.
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { mode = 'single', months = 1, value, defaultValue = '', onChange, min, max, month, today, weekStart = 1, locale = 'en-GB', prevLabel, nextLabel, className, ...rest },
  forwarded,
) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const setRef = useMergedRef(ref, forwarded);
  const [current, setCurrent] = useControlled(value, defaultValue);
  // UI.calendar takes its options once, so a change of options draws a new element.
  const optionsKey = [mode, months, min, max, month, today, weekStart, locale, prevLabel, nextLabel].join('|');
  const drawn = React.useRef<{ el: Element; cal: CalendarHandle } | null>(null);
  const latest = React.useRef(current);
  latest.current = current;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || drawn.current?.el === el) return;
    runtime.calendar(el, { mode, months, value: latest.current, min, max, month, today, weekStart, locale, prevLabel, nextLabel });
    const cal = calendarHandle(el);
    if (cal) drawn.current = { el, cal };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsKey]);

  // A new value from outside moves the calendar; a pick made in it already matches and is left alone.
  useIsoLayoutEffect(() => {
    const cal = drawn.current?.cal;
    if (cal && cal.value() !== current) cal.set(current);
  }, [current]);

  useTrayOn(
    ref,
    'change',
    (detail) => {
      const next = detail.value ?? '';
      setCurrent(next);
      onChange?.(next, detail.complete !== false);
    },
    optionsKey,
  );

  // Static mode: the layout effect above never runs, so bundle.js's calendar behaviour draws the grid, from the same options
  // written as the data-* attributes it reads (only those that differ from its defaults).
  const wired = useStaticMode();
  const options = wired
    ? {
        'data-tray': 'calendar',
        'data-mode': mode === 'single' ? undefined : mode,
        'data-months': months === 1 ? undefined : months,
        'data-week-start': weekStart === 1 ? undefined : weekStart,
        'data-locale': locale === 'en-GB' ? undefined : locale,
        'data-prev-label': prevLabel,
        'data-next-label': nextLabel,
        'data-today': today,
        'data-min': min,
        'data-max': max,
        'data-month': month,
        'data-value': current || undefined,
      }
    : {};
  // tray-cal is the class UI.calendar adds; set here too, so React never takes it away again.
  return <div key={optionsKey} ref={setRef} className={cx('tray-cal', className)} {...options} {...rest} />;
});
Calendar.displayName = 'Calendar';
