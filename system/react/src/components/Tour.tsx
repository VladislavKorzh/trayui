import * as React from 'react';
import { cx, useTrayEvent, useBehaviour, useForwardedRef, useUid } from '../lib/util';
import { Button } from './Button';

/** One step of a tour: the part it points at and what to say about it. */
export interface TourStep {
  /** The part of the screen the step points at: a CSS selector for an element inside the tour's area, usually an id such as "#orders-filter". */
  target: string;
  /** The step's title, three to six words: "Filter by status". */
  title: React.ReactNode;
  /** One or two sentences: what the part does for the person. */
  text: React.ReactNode;
}

export interface TourProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onChange'> {
  /** The steps, three or four, in order. Each points at one element inside `children`. An empty list shows no tour and leaves the screen as it is. */
  steps: TourStep[];
  /** The screen the tour runs over. Give the parts it points at the ids the steps name. */
  children: React.ReactNode;
  /** The index of the step shown first. Default 0. */
  defaultStep?: number;
  /** The forward button on every step but the last. Default "Next". */
  nextLabel?: React.ReactNode;
  /** The forward button on the last step, which ends the tour. Default "Done". */
  doneLabel?: React.ReactNode;
  /** The button that goes one step back, from the second step on. Default "Back". */
  backLabel?: React.ReactNode;
  /** The link on the first step that ends the tour at once. Default "Skip the tour". */
  skipLabel?: React.ReactNode;
  /** Called with the index of the step now shown, after Next or Back. */
  onStepChange?: (index: number) => void;
  /** Called when the tour ends: `finished` is true after the last step, false when it was skipped. Remember there that the tour was seen. */
  onComplete?: (finished: boolean) => void;
}

/**
 * A tour points at parts of a screen one at a time: a small raised panel beside the part, with a count, a sentence or two, and "Next".
 * Wrap the screen in it and name each part by a selector. It runs once from the moment it mounts: pass no steps to someone who has seen it, and give it a new `key` to run it again.
 */
export const Tour = React.forwardRef<HTMLDivElement, TourProps>(function Tour(
  {
    steps,
    children,
    defaultStep = 0,
    nextLabel = 'Next',
    doneLabel = 'Done',
    backLabel = 'Back',
    skipLabel = 'Skip the tour',
    onStepChange,
    onComplete,
    className,
    ...rest
  },
  forwarded,
) {
  const ref = useForwardedRef<HTMLDivElement>(forwarded);
  const uid = useUid('tour');
  // The tour behaviour owns which step is shown from here on: React only sets the first one.
  const [start] = React.useState(() => Math.max(0, Math.min(steps.length - 1, defaultStep)));
  useTrayEvent(ref, 'change', (detail: { step: number }) => onStepChange?.(detail.step - 1), { own: true });
  useTrayEvent(ref, 'complete', (detail: { finished: boolean }) => onComplete?.(detail.finished), { own: true });
  useBehaviour(ref);

  const last = steps.length - 1;
  return (
    <div ref={ref} className={cx('tray-tour-area', className)} data-tray="tour" {...rest}>
      {children}
      {steps.map((s, i) => (
        <div key={i} className="tray-tour tray-raised" role="dialog" aria-labelledby={`${uid}-${i}`} data-for={s.target} hidden={i !== start}>
          <p className="tray-tour__count" />
          <h2 className="nav" id={`${uid}-${i}`}>
            {s.title}
          </h2>
          <p className="tray-pop__text">{s.text}</p>
          <div className="tray-tour__foot">
            {i === 0 ? (
              <Button variant="link" data-tour="skip">
                {skipLabel}
              </Button>
            ) : (
              <Button variant="ghost" size="xs" data-tour="back">
                {backLabel}
              </Button>
            )}
            <Button variant="dark" size="xs" data-tour="next">
              {i === last ? doneLabel : nextLabel}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
});
Tour.displayName = 'Tour';
