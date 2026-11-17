# Onboarding Checklist

The onboarding checklist gets a new workspace to its first real result: a short list of tasks, the next one opened with its button, a bar that fills as they are done.

## Markup
```html
<section class="tray-card tray-checklist" data-tray="checklist" aria-labelledby="start-title">
  <div class="tray-checklist__head">
    <h2 class="subtitle" id="start-title">Get ready for the first order</h2>
    <div class="tray-progress">
      <span class="tray-progress__name">Done</span><span class="tray-progress__value">2 of 5</span>
      <span class="tray-progress__bar" role="progressbar" aria-label="Setup" aria-valuemin="0"></span>
    </div>
  </div>
  <ol class="tray-tasks">
    <li class="tray-task" data-done>
      <span class="tray-task__mark"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-check"/></svg></span>
      <div class="tray-task__body"><b>Add your products</b></div>
    </li>
    <li class="tray-task">
      <span class="tray-task__mark">…</span>
      <div class="tray-task__body">
        <b>Choose the courier days</b>
        <p>Orders placed after the cut-off wait for the next day.</p>
        <button class="tray-btn tray-btn--sm" type="button" data-task-done>Choose the days</button>
      </div>
    </li>
  </ol>
  <p data-checklist-done hidden>Everything is set. The first order will appear here.</p>
</section>
```
## Behaviour
`data-tray="checklist"`: the first task without `data-done` becomes the current one (`aria-current="step"`) and shows its text and button; the others show their title only. A button with `data-task-done` marks its task done and moves on. The Progress follows by itself, and the element with `data-checklist-done` appears at the end. It fires `tray:change` with `{ done, total }` and `tray:complete` after the last task.

Usually a task is done by doing it elsewhere in the product: set `data-done` from your own state and leave `data-task-done` for tasks finished on the spot.

## Accessibility
It is a `<section>` named by its heading through `aria-labelledby`, and the tasks are an `<ol>`. The task to do now carries `aria-current="step"` and is announced as the current step, and the others show their title only. The bar is a `role="progressbar"` with an `aria-label`, and the behaviour keeps its `aria-valuenow`, `aria-valuemax` and `aria-valuetext` ("2 of 5") up to date. When a `data-task-done` button finishes a task, focus moves to the next task's button.

## Do and don't
- Do keep it to three to five tasks, each done in a minute or two.
- Do start with a task that is already done, such as creating the account.
- Don't list features to look at. Every task ends in something the workspace needs.
- Don't keep the card after it is complete: let it be dismissed, then remove it.
