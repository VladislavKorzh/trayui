'use client';
import * as React from 'react';
import { cx, useTrayEvent, useBehaviour, useForwardedRef, useUid } from '../lib/util';
import { Button } from './Button';
import { Field } from './Field';
import { Textarea } from './Textarea';

/** What `onComplete` reports: the number chosen and the reason typed (empty when left out). */
export interface FeedbackAnswer {
  /** The number chosen, or null when the form was sent without one. */
  rating: number | null;
  /** The reason, as typed. Empty when it was left out. */
  comment: string;
}

export interface FeedbackWidgetProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'children'> {
  /** The one question, as a full sentence with its question mark: "How likely are you to recommend Counter to another farm?" */
  question: React.ReactNode;
  /** '0-10' (the default) for "would you recommend", '1-5' for "how was it". */
  scale?: '0-10' | '1-5';
  /** The name of the low end, under the first number: "Not at all", "Hard". */
  lowLabel: React.ReactNode;
  /** The name of the high end, under the last number: "Very", "Easy". */
  highLabel: React.ReactNode;
  /** The label of the box for the reason, shown once a number is chosen. Default "What is the main reason?". It is always optional. */
  reasonLabel?: React.ReactNode;
  /** The send button. Default "Send". */
  sendLabel?: React.ReactNode;
  /** What shows in place of the form once it is sent; it takes the focus. Default "Thank you.". Say who reads the answers: "Thank you. Oksana reads every answer." */
  thanks?: React.ReactNode;
  /** A number chosen from the start; the box for the reason is then open too. */
  defaultRating?: number;
  /** The reason filled in from the start. */
  defaultReason?: string;
  /** Called when the answer is sent. Post it there. */
  onComplete?: (answer: FeedbackAnswer) => void;
}

/**
 * The feedback widget asks one question with a row of numbers, then offers a box for the reason, then says thanks.
 * Ask after the person finished something, not while they work, and let it be closed without an answer.
 */
export const FeedbackWidget = React.forwardRef<HTMLFormElement, FeedbackWidgetProps>(function FeedbackWidget(
  {
    question,
    scale = '0-10',
    lowLabel,
    highLabel,
    reasonLabel = 'What is the main reason?',
    sendLabel = 'Send',
    thanks = 'Thank you.',
    defaultRating,
    defaultReason,
    onComplete,
    className,
    ...rest
  },
  forwarded,
) {
  const ref = useForwardedRef<HTMLFormElement>(forwarded);
  // The feedback behaviour opens the reason and the thanks from here on: React only sets the first state.
  const [reasonOpen] = React.useState(() => defaultRating !== undefined);
  useTrayEvent(
    ref,
    'complete',
    (detail: { rating: string | null; comment: string }) =>
      onComplete?.({ rating: detail.rating == null ? null : Number(detail.rating), comment: detail.comment }),
    { own: true },
  );
  useBehaviour(ref);

  const numbers = scale === '1-5' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // The named ends sit outside the fieldset: each end's radio points at its word, so "0" is read with "Not at all".
  const ends = useUid('scale-end');
  const endOf = (n: number) => (n === numbers[0] ? `${ends}-lo` : n === numbers[numbers.length - 1] ? `${ends}-hi` : undefined);
  return (
    <form ref={ref} className={cx('tray-card tray-feedback', className)} data-tray="feedback" {...rest}>
      <div className="tray-stack tray-stack--sm" data-feedback="ask">
        {/* eleven tiles on one row, as the original 0 to 10 scale sets them */}
        <fieldset className="tray-scale" style={scale === '0-10' ? { gridTemplateColumns: 'repeat(11, minmax(0, 1fr))' } : undefined}>
          <legend className="tray-label">{question}</legend>
          {numbers.map((n) => (
            <label key={n}>
              <input type="radio" name="rating" value={n} defaultChecked={n === defaultRating} aria-describedby={endOf(n)} />
              <span>{n}</span>
            </label>
          ))}
        </fieldset>
        <p className="tray-scale__ends">
          <span id={`${ends}-lo`}>{lowLabel}</span>
          <span id={`${ends}-hi`}>{highLabel}</span>
        </p>
      </div>
      <div className="tray-stack" data-feedback="more" hidden={!reasonOpen}>
        <Field label={reasonLabel} optional="Optional">
          <Textarea name="comment" rows={2} defaultValue={defaultReason} style={{ minBlockSize: '5.5rem' }} />
        </Field>
        <div>
          <Button size="sm" type="submit">
            {sendLabel}
          </Button>
        </div>
      </div>
      <p data-feedback="thanks" hidden>
        {thanks}
      </p>
    </form>
  );
});
FeedbackWidget.displayName = 'FeedbackWidget';
