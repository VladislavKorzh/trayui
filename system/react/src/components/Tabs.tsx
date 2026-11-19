'use client';
import * as React from 'react';
import { useStaticMode } from '../lib/static';
import { cx, useBehaviour, useControlled, useForwardedRef, useUid } from '../lib/util';
import { Badge } from './Badge';

export interface TabItem {
  /** Names the tab. `value`, `defaultValue` and `onChange` speak in these. */
  value: string;
  /** What the tab says: one or two words, sentence case. "Items", "Delivery". */
  label: React.ReactNode;
  /** A number in a small round badge after the label, such as 3 unread messages. */
  count?: React.ReactNode;
  /** Panels form only: the tab is greyed out and cannot be chosen. */
  disabled?: boolean;
  /** Panels form: what the tab's panel shows while the tab is chosen. */
  content?: React.ReactNode;
  /** Navigation form: where the link goes. */
  href?: string;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'defaultValue'> {
  /** The tabs, two to seven, in order. */
  items: TabItem[];
  /**
   * 'panels' (the default): the tabs show and hide panels in place; give each item `content`.
   * 'navigation': the tabs are links to pages or to sections of a long page; give each item `href`. The current one is marked with `aria-current`.
   */
  mode?: 'panels' | 'navigation';
  /** The chosen tab (panels) or the current link (navigation), by `value`. Leave it out to let the tabs keep their own state. */
  value?: string;
  /** The tab chosen at first, when `value` is not controlled. Default: the first tab that is not disabled. */
  defaultValue?: string;
  /** Called with the tab's `value` when a tab is chosen: by a click, or by the arrow keys, Home and End in the panels form. */
  onChange?: (value: string) => void;
  /** Navigation form: 'page' (the default) when the links lead to pages; 'section' when they lead to sections of one long page and follow the scroll (`aria-current="true"`). */
  current?: 'page' | 'section';
  /** Spreads the tabs across the full width, in equal parts. */
  fill?: boolean;
  /** For a strip that may not fit: it scrolls sideways and fades over its last 56px while tabs run past the end. The chosen tab, or the current link, and a tab that takes keyboard focus are scrolled into view clear of the fade; only the strip moves. */
  scroll?: boolean;
  /** Names the strip for screen readers: "Order PL-20418", "Sections". */
  label?: string;
}

/**
 * Tabs switch between views of the same thing: a tray strip of 44px tabs, the current one in solid ink.
 * Use the panels form to show and hide panels in place, and the navigation form for links to pages or sections; never for steps done in order.
 */
export const Tabs = React.forwardRef<HTMLElement, TabsProps>(function Tabs(
  { items, mode = 'panels', value, defaultValue, onChange, current = 'page', fill, scroll, label, className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef(forwarded);
  const uid = useUid('tabs');
  const first = items.find((it) => !it.disabled)?.value ?? '';
  const [chosen, setChosen] = useControlled(value, defaultValue ?? first, onChange);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  // static mode: bundle.js's tabs behaviour switches the panels and moves with the arrows, in place of the handlers below
  const wired = useStaticMode();
  useBehaviour(ref, [scroll, mode]);
  const stripClass = cx('tray-tabs', fill && 'tray-tabs--fill');
  const strip = scroll ? 'strip' : undefined;

  if (mode === 'navigation') {
    return (
      <nav ref={ref as React.RefObject<HTMLElement>} className={cx(stripClass, className)} aria-label={label} data-tray={strip} {...rest}>
        {items.map((it) => (
          <a
            key={it.value}
            className="tray-tab"
            href={it.href}
            aria-current={it.value === chosen ? (current === 'section' ? 'true' : 'page') : undefined}
            onClick={() => setChosen(it.value)}
          >
            {it.label}
            {it.count != null ? <Badge count>{it.count}</Badge> : null}
          </a>
        ))}
      </nav>
    );
  }

  const panels = items.some((it) => it.content !== undefined);
  // the one tab that takes Tab focus: the chosen one, or the first live tab when nothing matches
  const focusable = items.some((it) => it.value === chosen && !it.disabled) ? chosen : first;
  const choose = (i: number, focus: boolean) => {
    setChosen(items[i].value);
    if (focus) tabRefs.current[i]?.focus();
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const live = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
    const at = live.indexOf(tabRefs.current.indexOf(e.target as HTMLButtonElement));
    if (!live.length) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const step = e.key === 'ArrowRight' ? (rtl ? -1 : 1) : e.key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0;
    let to = -1;
    if (step && at >= 0) to = live[(at + step + live.length) % live.length];
    else if (e.key === 'Home') to = live[0];
    else if (e.key === 'End') to = live[live.length - 1];
    if (to < 0) return;
    e.preventDefault();
    choose(to, true);
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className} data-tray={wired ? 'tabs' : undefined} {...rest}>
      <div className={stripClass} role="tablist" aria-label={label} data-tray={strip} onKeyDown={onKeyDown}>
        {items.map((it, i) => {
          const on = it.value === chosen;
          return (
            <button
              key={it.value}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              className="tray-tab"
              role="tab"
              type="button"
              id={`${uid}-tab-${i}`}
              aria-selected={on}
              aria-controls={panels ? `${uid}-panel-${i}` : undefined}
              tabIndex={it.value === focusable ? 0 : -1}
              disabled={it.disabled}
              onClick={() => choose(i, false)}
            >
              {it.label}
              {it.count != null ? <Badge count>{it.count}</Badge> : null}
            </button>
          );
        })}
      </div>
      {panels
        ? items.map((it, i) => (
            <div
              key={it.value}
              className="tray-tabpanel"
              role="tabpanel"
              id={`${uid}-panel-${i}`}
              aria-labelledby={`${uid}-tab-${i}`}
              tabIndex={0}
              hidden={it.value !== chosen}
            >
              {it.content}
            </div>
          ))
        : null}
    </div>
  );
});
Tabs.displayName = 'Tabs';
