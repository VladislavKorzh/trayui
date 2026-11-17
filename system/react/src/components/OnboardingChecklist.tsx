import * as React from 'react';
import { cx, useTrayEvent, useBehaviour, useForwardedRef, useUid } from '../lib/util';
import { Button } from './Button';
import { Card } from './Card';
import { Icon } from './Icon';
import { Progress } from './Progress';

/** One task of the checklist: something the workspace needs, done in a minute or two. */
export interface ChecklistTask {
  /** What the person does, as an instruction: "Choose the courier days". */
  title: React.ReactNode;
  /** One sentence under the title, shown only while this is the current task: why it matters, or what to expect. */
  description?: React.ReactNode;
  /** Whether the task is done. Set it from your own state when the task is done elsewhere in the product. Default false. */
  done?: boolean;
  /** The words of the current task's button, a verb first: "Choose the days". Without it the current task shows no button. */
  action?: React.ReactNode;
  /** Makes the button a link to the place where the task is done: "/settings/courier". The task then stays open until you set `done`. */
  href?: string;
  /** Called when the button is pressed. */
  onAction?: () => void;
  /** Whether pressing the button finishes the task on the spot: it is marked done and the next task opens. Default: true without `href`, false with it. */
  completes?: boolean;
}

/** What `onChange` reports after a task is finished with its button. */
export interface ChecklistProgress {
  /** How many tasks are done now. */
  done: number;
  /** How many tasks there are. */
  total: number;
  /** The index of the task that was just finished. */
  index: number;
}

export interface OnboardingChecklistProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'onChange'> {
  /** The goal the tasks lead to, in `subtitle` type: "Get ready for the first order". */
  title: React.ReactNode;
  /** The tasks, three to five, in the order they should be done. Start with one that is already done, such as creating the account. */
  tasks: ChecklistTask[];
  /** The name over the progress bar, at the start. Default "Done"; the count, "2 of 5", sits at the end. */
  progressLabel?: React.ReactNode;
  /** A line shown once every task is done: "Everything is set. The first order will appear on the Orders page." */
  doneText?: React.ReactNode;
  /** The heading level of the title. Default 2. */
  headingLevel?: 2 | 3;
  /** Called after a task is finished with its button, with the new count and the task's index. */
  onChange?: (progress: ChecklistProgress) => void;
  /** Called once the last task is finished with its button. Let the card be dismissed then. */
  onComplete?: () => void;
}

/**
 * The onboarding checklist gets a new workspace to its first real result: a short list of tasks, the next one opened with its button, a bar that fills as they are done.
 * Use it on the first screens of a new account; remove it once it is complete.
 */
export const OnboardingChecklist = React.forwardRef<HTMLElement, OnboardingChecklistProps>(function OnboardingChecklist(
  { title, tasks, progressLabel = 'Done', doneText, headingLevel = 2, onChange, onComplete, className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef<HTMLElement>(forwarded);
  const titleId = useUid('checklist');
  const total = tasks.length;
  // Tasks finished on the spot. The checklist behaviour marks them in the page; React keeps the same state, so a `done` set from the app shows at once.
  const [spot, setSpot] = React.useState<{ total: number; done: number[] }>({ total, done: [] });
  const spotDone = spot.total === total ? spot.done : [];
  const isDone = (i: number) => !!tasks[i]?.done || spotDone.includes(i);
  const doneCount = tasks.filter((_, i) => isDone(i)).length;
  const current = tasks.findIndex((_, i) => !isDone(i));

  const report = (complete: boolean) => () => {
    const marked = Array.from(ref.current?.querySelectorAll('.tray-task') ?? []).map((el) => el.hasAttribute('data-done'));
    const index = marked.findIndex((on, i) => on && !isDone(i));
    setSpot({ total, done: marked.map((on, i) => (on && !tasks[i]?.done ? i : -1)).filter((i) => i >= 0) });
    const done = marked.filter(Boolean).length;
    onChange?.({ done, total, index });
    if (complete) onComplete?.();
  };
  useTrayEvent(ref, 'change', report(false), { own: true, deps: [total] });
  useTrayEvent(ref, 'complete', report(true), { own: true, deps: [total] });
  useBehaviour(ref, [total]);

  // The behaviour writes the spoken value of the bar on its own clicks; keep it right when `done` comes from the app.
  React.useEffect(() => {
    ref.current?.querySelector('.tray-progress__bar')?.setAttribute('aria-valuetext', `${doneCount} of ${total}`);
  }, [doneCount, total, ref]);

  const H = `h${headingLevel}` as 'h2' | 'h3';
  return (
    <Card
      // a new list of tasks is wired afresh: the behaviour reads the tasks once
      key={total}
      ref={ref}
      as="section"
      className={cx('tray-checklist', className)}
      data-tray="checklist"
      aria-labelledby={titleId}
      {...rest}
    >
      <div className="tray-checklist__head">
        <H className="subtitle" id={titleId}>
          {title}
        </H>
        <Progress
          label={progressLabel}
          value={doneCount}
          max={total || 1}
          valueText={`${doneCount} of ${total}`}
          aria-label={typeof title === 'string' ? title : undefined}
        />
      </div>
      <ol className="tray-tasks">
        {tasks.map((t, i) => {
          const completes = t.completes ?? t.href === undefined;
          return (
            <li key={i} className="tray-task" data-done={isDone(i) ? '' : undefined} aria-current={i === current ? 'step' : undefined}>
              <span className="tray-task__mark">
                <Icon name="check" size="sm" />
              </span>
              <div className="tray-task__body">
                <b>{t.title}</b>
                {t.description != null ? <p>{t.description}</p> : null}
                {t.action != null ? (
                  <Button size="sm" href={t.href} data-task-done={completes ? '' : undefined} onClick={t.onAction}>
                    {t.action}
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
      {doneText != null ? (
        <p className="tray-soft" data-checklist-done="" hidden={doneCount < total}>
          {doneText}
        </p>
      ) : null}
    </Card>
  );
});
OnboardingChecklist.displayName = 'OnboardingChecklist';
