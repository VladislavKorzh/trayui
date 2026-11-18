import * as React from 'react';
import { cx } from '../lib/util';

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The name above the bar, at the start: "Uploading label.pdf". In the steps form, the name of the current step: "Delivery". */
  label?: React.ReactNode;
  /**
   * How much is done, from 0 to `max`. Leave it out while the length is not known yet: a short segment then slides along the track.
   * In the steps form, the number of finished steps, which is also the current step: 2 for "Step 2 of 4".
   */
  value?: number;
  /** The whole. Default 100, so `value` reads as a percentage. */
  max?: number;
  /** The figure above the bar, at the end. Default: the percentage ("42%"), or "Step 2 of 4" in the steps form. Write it in words when it is not a percentage: "132 of 412 jars left". */
  valueText?: React.ReactNode;
  /** Makes it a row of short pills for a sequence, "step 2 of 4", with this many steps. */
  steps?: number;
  /** Marks a level that is not a task (stock left, a rating, a share): role 'meter' instead of 'progressbar'. */
  meter?: boolean;
  /** 'ink' fills the bar in ink (the default). 'accent' fills it in yellow, only for the single bar on an ink card. */
  tone?: 'ink' | 'accent';
  /** Names the bar for screen readers. Default: `label` when it is text. In the steps form, name the whole sequence: "Checkout". */
  'aria-label'?: string;
}

/**
 * A progress bar shows how much of a known whole is done: an 8px pill in `track`, filled in ink, with its name and value above.
 * The steps form is a row of short pills for "step 2 of 4". Use a Spinner while the length is unknown and short.
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { label, value, max, valueText, steps, meter, tone = 'ink', className, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  const name = ariaLabel ?? (typeof label === 'string' ? label : undefined);
  if (steps !== undefined) {
    const done = Math.max(0, Math.min(steps, value ?? 0));
    const text = valueText ?? `Step ${done} of ${steps}`;
    const bar = (
      <div
        className="tray-steps"
        role={meter ? 'meter' : 'progressbar'}
        aria-label={name}
        aria-valuemin={1}
        aria-valuemax={steps}
        aria-valuenow={done}
        aria-valuetext={typeof text === 'string' ? (typeof label === 'string' ? `${text}: ${label}` : text) : undefined}
      >
        {Array.from({ length: steps }, (_, i) => (
          <span key={i} data-done={i < done ? '' : undefined} />
        ))}
      </div>
    );
    return (
      <div ref={ref} className={cx('tray-stack tray-stack--sm', className)} {...rest}>
        {label != null || valueText != null ? (
          <div className="tray-row tray-row--between">
            <span className="nav">{label}</span>
            <span className="tray-soft tray-num">{text}</span>
          </div>
        ) : null}
        {bar}
      </div>
    );
  }
  const whole = max ?? 100;
  const busy = value === undefined;
  const pct = busy ? 0 : Math.round((Math.max(0, Math.min(whole, value)) / whole) * 100);
  const text = valueText ?? (busy ? null : `${pct}%`);
  return (
    <div ref={ref} className={cx('tray-progress', tone === 'accent' && 'tray-progress--accent', busy && 'tray-progress--busy', className)} {...rest}>
      {label != null ? <span className="tray-progress__name">{label}</span> : null}
      {label != null || text != null ? <span className="tray-progress__value">{text}</span> : null}
      <span
        className="tray-progress__bar"
        role={meter ? 'meter' : 'progressbar'}
        aria-label={name}
        aria-valuemin={busy ? undefined : 0}
        aria-valuemax={busy ? undefined : whole}
        aria-valuenow={busy ? undefined : value}
        // Words that are not the percentage are read as the value too: "68%: 132 of 412 jars left".
        aria-valuetext={!busy && typeof text === 'string' && text !== `${pct}%` ? `${pct}%: ${text}` : undefined}
        style={busy ? undefined : ({ '--tray-v': pct } as React.CSSProperties)}
      />
    </div>
  );
});
Progress.displayName = 'Progress';
