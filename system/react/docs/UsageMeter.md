---
category: Metrics
keywords: [usage meter, usage, quota, limit, allowance, plan limits, meter, seats, storage]
---
# Usage Meter

A usage meter shows how much of a plan's allowance is used: a Progress bar per limit with `role="meter"`, the numbers in words, and a note once a limit is near.

## Use
```tsx
<Card title="Usage" description="Shop plan. Resets on 1 December."
      action={<Button variant="quiet" size="xs" href="/billing/plans">Change plan</Button>}>
  <UsageMeter items={[
    { label: 'Orders this month', used: 842, limit: 1000 },                     // "842 of 1,000"
    { label: 'Team seats', used: 5, limit: 5,
      note: 'Every seat is taken. Add seats to invite more people.' },           // from 90%: the value turns danger
    { label: 'Label storage', used: 1.2, limit: 5, unit: 'GB' },                 // "1.2 of 5 GB"
    { label: 'API requests' },                                                   // no limit: "Unlimited on this plan"
  ]} />
</Card>

<UsageMeter size="sm"                                                            {/* the foot of the sidebar */}
  items={[{ label: 'Orders', ariaLabel: 'Orders this month', used: 842, limit: 1000 }]}
  action={<Button variant="link" href="/billing/plans">Upgrade the plan</Button>} />
```

## Parts
- Each limit is a Progress row: the name at the start, both numbers at the end, an ink bar beneath. The bar has `role="meter"`: it is a level, not a task.
- From 90% of the limit (or with `high`), the value turns danger and the note takes a 'circle-alert' icon. Say in the note, in words, what has happened and what to do. The bar stays ink: the system has no red fill but the destructive button.
- An allowance without a limit is a line of text, not a full bar.
- `size="sm"` is the compact block for the foot of the sidebar: one limit and a link to upgrade, on a small fill of its own.

## You provide
The plan's name and when the count starts again ("Resets on 1 December"), usually as the Card's description, and a way to change the plan.

## Do and don't
- Do print both numbers: "842 of 1,000", not "84%".
- Do say when the count starts again.
- Don't show limits the plan does not have.
- Don't block work at 100% without saying what happens next.
