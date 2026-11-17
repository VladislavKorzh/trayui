---
category: Billing
keywords: [plan comparison, compare plans, feature table, feature matrix, comparison table, pricing table, tiers]
---
# Plan Comparison

The plan comparison is the full table under the pricing cards: every feature as a row, every plan as a column, a check, a dash or a number in each cell.

## Use
```tsx
<PlanComparison
  aria-label="What each plan includes"
  plans={[
    { name: 'Stall', price: '$0' },
    { name: 'Shop', price: '$29 a month', featured: true },   // a tray behind the whole column
    { name: 'Market', price: '$79 a month' },
  ]}
  rows={[
    { group: 'Orders', feature: 'Orders a month', values: [50, 1000, 'Unlimited'] },   // a number reads "1,000"
    { feature: 'Courier tracking', values: [false, true, true] },                       // a dash, a check, a check
    { group: 'Team', feature: 'People', values: ['One', 'Five', 'Twenty'] },            // the limit in words
  ]}
/>
```

## Parts
- The head: each plan's name with its price small under it, in the order of the pricing cards. The feature column's head is hidden but read.
- A cell holds a check (`true`, read as "Included"), a dash in hint ink (`false`, read as "Not included"), a number in tabular figures, or the limit in words.
- `group` on a row starts a group above it: a muted heading in the first cell and an empty cell under each plan, so the featured tray runs through.
- `featured` lays a tray behind one column, rounded at the head and the foot: the plan you recommend, or the one the person is on.

The table sits in a wrapper that scrolls sideways on a phone. Name it with an `aria-label`.

## Do and don't
- Do keep the plan names and prices in the head, in the order of the pricing cards.
- Do write the limit rather than a check where there is one: "Five people".
- Don't use a red cross for a missing feature. A dash in hint ink is enough.
- Don't list features every plan has in the same amount: say them once above the table.
