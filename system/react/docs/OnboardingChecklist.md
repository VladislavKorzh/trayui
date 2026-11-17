---
category: Onboarding
keywords: [onboarding checklist, checklist, getting started, setup, tasks, first steps, progress, welcome]
---
# Onboarding Checklist

The onboarding checklist gets a new workspace to its first real result: a short list of tasks, the next one opened with its button, a bar that fills as they are done.

## Use
```tsx
<OnboardingChecklist
  title="Get ready for the first order"
  tasks={[
    { title: 'Create the workspace', done: true },
    { title: 'Choose the courier days', description: 'Orders placed after the cut-off wait for the next courier day.',
      action: 'Choose the days' },                                   // finished on the spot
    { title: 'Connect the shop', action: 'Connect the shop', href: '/settings/shop',
      done: shopConnected },                                         // finished elsewhere: done comes from your state
  ]}
  doneText="Everything is set. The first order will appear on the Orders page."
  onComplete={() => setChecklistDismissable(true)}
/>
```

## How it works
The first task that is not done is the current one: it opens on a white row with its sentence and its button; the others show their title only, done ones struck through. The head holds a Progress bar, "Done" at the start and "2 of 5" at the end.

A task's button finishes the task on the spot by default: it is marked done, the next task opens and takes the focus, and `onChange` reports `{ done, total, index }`. After the last one `onComplete` runs and `doneText` appears.

Most tasks are really done elsewhere in the product. For those, give the button an `href` (it then only leads there) and set `done` from your own state when the work is finished; the bar and the current task follow at once.

## You provide
A title that names the goal, and three to five tasks, each with an instruction for a title, one sentence of why, and a button that starts with a verb.

## Do and don't
- Do keep it to three to five tasks, each done in a minute or two.
- Do start with a task that is already done, such as creating the account.
- Don't list features to look at. Every task ends in something the workspace needs.
- Don't keep the card after it is complete: let it be dismissed, then remove it.
