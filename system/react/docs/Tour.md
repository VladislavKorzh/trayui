---
category: Onboarding
keywords: [tour, product tour, walkthrough, coach marks, onboarding, guide, hints, spotlight]
---
# Tour

A tour points at parts of a screen one at a time: a small raised panel beside the part, with a count, a sentence or two, and "Next".

## Use
```tsx
<Tour
  steps={[
    { target: '#orders-tabs', title: 'Orders move left to right', text: 'Everything new lands in "To pack".' },
    { target: '#orders-export', title: 'Take the list with you', text: 'Export what you see as a spreadsheet.' },
    { target: '#orders-new', title: 'Orders by phone go here', text: 'Add an order when a customer calls.' },
  ]}
  onComplete={(finished) => markTourSeen()}   // finished is false when it was skipped
>
  <OrdersScreen />                             {/* the parts carry the ids the steps name */}
</Tour>
```

## How it works
Wrap the screen in the Tour. Each step names its target with a CSS selector inside that area, usually an id. The current target gets a 2px dashed ink ring and the panel is placed under it, or over it when there is no room below. The count, "1 of 3", is written for you.

Every step has "Skip the tour", so the tour can be left from any of them, and "Next"; from the second step on, "Back" stands before "Next"; the last step's forward button says "Done" and ends the tour. `Escape` anywhere in the area ends it as Skip does, also on the part a step covers. When the tour ends, focus moves to the part the last step pointed at. `onStepChange` reports the index of the step shown; `onComplete` reports whether the tour was finished or skipped.

Each step is a non-modal dialog named by its heading; the page behind stays usable, and `Tab` reaches a step after the parts it points at. The ring is not read, so name the part in the words of the step.

The tour runs once from the moment it mounts, starting at `defaultStep`. For someone who has seen it, pass `steps={[]}`: the screen stays as it is. To run it again later, give the Tour a new `key`.

## Do and don't
- Do keep a tour to three or four steps, and let it be skipped from every step.
- Do point at things the person will use today.
- Don't start a tour over a screen that is still empty: show the Empty state or the Onboarding Checklist first.
- Don't dim the page behind it. The ring is enough, and the screen stays usable.
