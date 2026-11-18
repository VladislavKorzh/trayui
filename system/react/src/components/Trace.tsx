'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx, useControlled } from '../lib/util';
import { Icon } from './Icon';

export type TraceStatus = 'done' | 'running' | 'failed';

/** One step an agent took: a verb, what it acted on, its state and how long it took. */
export interface TraceStep {
  /** The verb, in bold: "Read", "Searched", "Ran". In the present while running ("Writing"); "Denied" or "Skipped" for a step that did not run. */
  verb: React.ReactNode;
  /** What the verb acted on, in plain words: "orders-november.csv", "for \"chilled delivery\" in the notes". Never a raw tool name or arguments. */
  text?: React.ReactNode;
  /** The icon in the step's tile: 'file', 'search', 'terminal'. Default 'check'; a failed step shows 'circle-x', a running one a Spinner. */
  icon?: IconSource;
  /** How long it took: "0.4 s", "30 s". Leave it out while running. */
  time?: React.ReactNode;
  /** 'done' (the default), 'running' (a Spinner in the tile, the title in ink), or 'failed' (the tile and the verb turn danger; say what failed). */
  status?: TraceStatus;
  /** The step's output, under its line: usually a `<CodeBlock size="sm">`. */
  detail?: React.ReactNode;
}

export interface TraceProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onToggle'> {
  /** The steps, in the order they ran. */
  steps: TraceStep[];
  /**
   * The disclosure line over the steps: "Worked for 42 seconds, 5 steps". With it the trace folds away under a chevron;
   * without it only the list of steps is drawn.
   */
  summary?: React.ReactNode;
  /** Whether the steps show under the summary (controlled). Keep it open while the work runs, closed once the answer is there. */
  open?: boolean;
  /** The starting state when `open` is not controlled. Default true. */
  defaultOpen?: boolean;
  /** Called when the summary is pressed, with the new state. */
  onOpenChange?: (open: boolean) => void;
}

function StepIcon({ step }: { step: TraceStep }) {
  if (step.status === 'running') return <span className="tray-spinner tray-spinner--sm" aria-hidden="true" />;
  return <Icon name={step.icon ?? (step.status === 'failed' ? 'circle-x' : 'check')} size="sm" />;
}

/**
 * A trace shows what an agent did on the way to an answer: one line per step, with its state and how long it took.
 * It folds under a summary line, "Worked for 42 seconds, 5 steps": open while the work runs, closed once the answer is there.
 */
export const Trace = React.forwardRef<HTMLElement, TraceProps>(function Trace({ steps, summary, open, defaultOpen = true, onOpenChange, className, ...rest }, ref) {
  const [isOpen, setOpen] = useControlled(open, defaultOpen, onOpenChange);
  const list = (cls?: string, props?: React.HTMLAttributes<HTMLOListElement>, olRef?: React.Ref<HTMLOListElement>) => (
    <ol ref={olRef} className={cx('tray-trace', cls)} role="list" {...props}>
      {steps.map((s, i) => (
        // One item per step: its output sits at the end of its own line, where it takes a row under the title.
        <li key={i} className="tray-trace__line" data-status={s.status && s.status !== 'done' ? s.status : undefined}>
          <span className="tray-trace__icon">
            <StepIcon step={s} />
          </span>
          <span className="tray-trace__title">
            <b>{s.verb}</b>
            {s.text != null ? <> {s.text}</> : null}
          </span>
          {s.time != null ? <span className="tray-trace__meta">{s.time}</span> : null}
          {s.detail != null ? <div className="tray-trace__detail">{s.detail}</div> : null}
        </li>
      ))}
    </ol>
  );
  if (summary == null) return list(className, rest as React.HTMLAttributes<HTMLOListElement>, ref as React.Ref<HTMLOListElement>);
  return (
    <details
      ref={ref as React.Ref<HTMLDetailsElement>}
      className={cx('tray-trace-group', className)}
      open={isOpen}
      onToggle={(e) => {
        const next = e.currentTarget.open;
        if (next !== isOpen) setOpen(next);
      }}
      {...rest}
    >
      <summary>
        <Icon name="chevron-right" size="sm" flip />
        {summary}
      </summary>
      {list()}
    </details>
  );
});
Trace.displayName = 'Trace';
