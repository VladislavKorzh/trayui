'use client';
import * as React from 'react';
import { cx, useTrayEvent, useBehaviour, useForwardedRef, useUid } from '../lib/util';
import { Button } from './Button';
import { Input } from './Input';

/** One answer to offer: a choice card (for 'choice') or a checkbox (for 'multiple'). */
export interface QuestionnaireOption {
  /** The answer as the summary and `onComplete` report it: "Today, 14:00 to 18:00". */
  value: string;
  /** The answer's words on the card or beside the checkbox: "Today". Default: the value. */
  label?: React.ReactNode;
  /** With 'choice': one line under the label, in muted type: "Between 14:00 and 18:00". */
  description?: React.ReactNode;
  /** Chosen when the questionnaire opens: the likely answer. Default false. */
  defaultChecked?: boolean;
  /** With 'choice': "Something else". Choosing it shows a text field, and what is typed there becomes the answer. Use it on one option, the last. */
  other?: boolean;
  /** With `other`: the text field's name for screen readers. Default "Something else". */
  otherLabel?: string;
  /** With `other`: the text field's placeholder, an example: "For example, Friday after six". */
  otherPlaceholder?: string;
}

/** One question, shown on its own step. */
export interface QuestionnaireQuestion {
  /** The question, as a short sentence with a question mark: "When should it arrive?" */
  question: string;
  /** 'choice' is one of several (choice cards with radios), 'multiple' is several (checkboxes), 'text' is free text (a textarea). */
  type: 'choice' | 'multiple' | 'text';
  /** The answers to offer, for 'choice' and 'multiple'. */
  options?: QuestionnaireOption[];
  /** The question may be skipped: Next is enabled without an answer. Usually the free-text last step. Default false. */
  optional?: boolean;
  /** One line under the answers, in soft ink: "You can leave this empty." */
  hint?: React.ReactNode;
  /** With 'text': the placeholder of the textarea. */
  placeholder?: string;
  /** With 'text': the textarea's name for screen readers. Default: the question. */
  label?: string;
}

/** What `onComplete` reports for one question: its words and the answers chosen or typed (empty when skipped). */
export interface QuestionnaireAnswer {
  question: string;
  answer: string[];
}

export interface QuestionnaireProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'children'> {
  /** The questions, three to five, in order. Ask only what changes what happens next. */
  questions: QuestionnaireQuestion[];
  /** The line over the summary at the end. Default "Thank you. Here is what we have". */
  doneTitle?: React.ReactNode;
  /** The button under the summary that starts again from the first question. Default "Change the answers". */
  restartLabel?: React.ReactNode;
  /** Called when the last question is finished, with every question and its answers. */
  onComplete?: (answers: QuestionnaireAnswer[]) => void;
}

const checkSvg = (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path className="tray-check__tick" d="M4 10.5l4 4 8-9" />
    <path className="tray-check__dash" d="M5 10h10" />
  </svg>
);

function Step({ q, index, name }: { q: QuestionnaireQuestion; index: number; name: string }) {
  const options = q.options ?? [];
  const other = q.type === 'choice' ? options.find((o) => o.other) : undefined;
  return (
    <fieldset className="tray-questionnaire__step" data-optional={q.optional ? '' : undefined} hidden={index > 0}>
      <legend className="subtitle">{q.question}</legend>
      {q.type === 'choice' ? (
        <>
          <div className="tray-choices">
            {options.map((o, k) => (
              <label className="tray-choice" key={k}>
                <input type="radio" name={name} value={o.value} defaultChecked={o.defaultChecked} data-other={o.other ? '' : undefined} />
                <span className="tray-radio__ring" />
                <span className="tray-choice__text">
                  <b>{o.label ?? o.value}</b>
                  {o.description != null ? <span>{o.description}</span> : null}
                </span>
              </label>
            ))}
          </div>
          {other ? (
            <Input data-other-text="" placeholder={other.otherPlaceholder} aria-label={other.otherLabel ?? 'Something else'} hidden={!other.defaultChecked} />
          ) : null}
        </>
      ) : q.type === 'multiple' ? (
        <div className="tray-stack" style={{ gap: 0 }}>
          {options.map((o, k) => (
            <label className="tray-check" key={k}>
              <input type="checkbox" name={name} value={o.value} defaultChecked={o.defaultChecked} />
              <span className="tray-check__box">{checkSvg}</span>
              <span>{o.label ?? o.value}</span>
            </label>
          ))}
        </div>
      ) : (
        <textarea className="tray-textarea" rows={3} name={name} aria-label={q.label ?? q.question} placeholder={q.placeholder} />
      )}
      {q.hint != null ? <p className="tray-questionnaire__hint">{q.hint}</p> : null}
    </fieldset>
  );
}

/**
 * A questionnaire asks a few questions one at a time, when an assistant or a flow needs answers before it can go on.
 * It counts the questions, keeps Next disabled until the question is answered, and ends with a summary of the answers.
 */
export const Questionnaire = React.forwardRef<HTMLFormElement, QuestionnaireProps>(function Questionnaire(
  { questions, doneTitle = 'Thank you. Here is what we have', restartLabel = 'Change the answers', onComplete, className, ...rest },
  ref,
) {
  const own = useForwardedRef(ref);
  const uid = useUid('q');
  useBehaviour(own);
  useTrayEvent(own, 'complete', (detail: { answers: QuestionnaireAnswer[] }) => onComplete?.(detail.answers));
  return (
    <form ref={own as React.RefObject<HTMLFormElement>} className={cx('tray-card tray-questionnaire', className)} data-tray="questionnaire" {...rest}>
      <div className="tray-questionnaire__head">
        <span data-progress="" />
        <div className="tray-steps" aria-hidden="true">
          {questions.map((_, i) => (
            <span key={i} />
          ))}
        </div>
      </div>
      {questions.map((q, i) => (
        <Step key={i} q={q} index={i} name={`${uid}-${i}`} />
      ))}
      <div className="tray-questionnaire__foot">
        <Button variant="ghost" size="md" data-back="">
          Back
        </Button>
        <Button size="md" data-next="">
          Next
        </Button>
      </div>
      <div className="tray-stack" data-done="" hidden>
        <p className="subtitle">{doneTitle}</p>
        <dl className="tray-questionnaire__answers" />
        <div>
          <Button variant="quiet" size="sm" data-restart="">
            {restartLabel}
          </Button>
        </div>
      </div>
    </form>
  );
});
Questionnaire.displayName = 'Questionnaire';
