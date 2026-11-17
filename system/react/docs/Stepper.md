---
category: Navigation
keywords: [stepper, steps, wizard, progress steps, checkout steps, multi-step form, onboarding steps, timeline]
---
# Stepper

A stepper shows where a person is in a short, fixed sequence: the steps as numbered marks over a bar that fills as they go.

## Use
```tsx
<Stepper aria-label="Checkout" current={1}                     // counted from 0: "Delivery"
  steps={[{ label: 'Cart', href: '/cart' }, { label: 'Delivery' }, { label: 'Payment' }, { label: 'Review' }]} />

<Stepper aria-label="Set up the workspace" orientation="vertical" current={2}
  steps={[
    { label: 'Farm details', description: 'Perly Farm, Kyiv region', href: '/setup/farm' },
    { label: 'Products', description: 'Three jar sizes', href: '/setup/products' },
    { label: 'Delivery', description: 'Choose the days the courier comes' },
    { label: 'Invite the team' },
  ]} />

<Stepper aria-label="Order a jar" current={step} steps={steps} onStepClick={setStep} />   {/* finished steps become buttons */}
```

## States
The steps before `current` are done: a check in their mark, full ink, and ", done" for screen readers. The current one turns solid ink and carries `aria-current="step"`. The steps ahead show their number and are never links. A finished step may lead back, with `href` or `onStepClick`. Pass `current={steps.length}` once every step is done.

## Forms
`horizontal` (the default) puts the marks over a bar that fills as the person goes; below 34rem it keeps the marks and shows the label of the current step only. `vertical` stacks the steps with a line between the marks, for a side column, and shows each step's `description` under its name.

## Do and don't
- Do use it for three to five steps that always come in the same order.
- Do name each step with a noun: "Delivery", "Payment".
- Don't use it for progress whose steps the person does not take: that is Progress.
- Don't let a step be skipped by clicking ahead.
