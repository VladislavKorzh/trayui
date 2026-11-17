import * as React from 'react';
import { cx } from '../lib/util';
import { Icon } from './Icon';

export interface StepperStep {
  /** The step's name, a noun: "Delivery", "Payment". */
  label: React.ReactNode;
  /** A second line under the name, in the vertical form: what was chosen there, or what the step asks. */
  description?: React.ReactNode;
  /** Where a finished step leads back to. Steps ahead are never links. */
  href?: string;
}

export interface StepperProps extends React.OlHTMLAttributes<HTMLOListElement> {
  /** The steps, three to five, always in the same order. */
  steps: StepperStep[];
  /** The step the person is on, counted from 0. The steps before it are done and show a check. Pass `steps.length` once every step is done. Default 0. */
  current?: number;
  /** 'horizontal' (the default): the marks over a bar that fills as they go. 'vertical': stacked, with a line between the marks, for a side column. */
  orientation?: 'horizontal' | 'vertical';
  /** Called with a finished step's position when it is clicked: going back to change it. Finished steps without `href` become buttons then. */
  onStepClick?: (index: number) => void;
  /** Read after a finished step's name by screen readers, after a comma. Default 'done'. */
  doneLabel?: string;
}

/**
 * A stepper shows where a person is in a short, fixed sequence: the steps as numbered marks over a bar that fills as they go.
 * Use it for three to five steps a person takes in order, such as a checkout; progress the person does not drive is a Progress bar. Give it an aria-label.
 */
export const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, current = 0, orientation = 'horizontal', onStepClick, doneLabel = 'done', className, ...rest },
  ref,
) {
  return (
    <ol ref={ref} className={cx('tray-stepper', orientation === 'vertical' && 'tray-stepper--v', className)} {...rest}>
      {steps.map((s, i) => {
        const done = i < current;
        const here = i === current;
        const body = (
          <>
            <span className="tray-step__mark">{done ? <Icon name="check" size="sm" /> : null}</span>
            <span className="tray-step__text">
              {s.label}
              {done ? <span className="tray-vh">, {doneLabel}</span> : null}
              {s.description != null ? <small>{s.description}</small> : null}
            </span>
          </>
        );
        return (
          <li key={i} data-done={done ? '' : undefined} aria-current={here ? 'step' : undefined}>
            {done && s.href !== undefined ? (
              <a className="tray-step" href={s.href} onClick={onStepClick ? () => onStepClick(i) : undefined}>
                {body}
              </a>
            ) : done && onStepClick ? (
              <button className="tray-step" type="button" onClick={() => onStepClick(i)}>
                {body}
              </button>
            ) : (
              <span className="tray-step">{body}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
});
Stepper.displayName = 'Stepper';
