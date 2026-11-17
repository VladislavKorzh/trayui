---
category: Billing
keywords: [billing summary, billing, subscription, current plan, plan overview, next invoice, renewal, account plan]
---
# Billing Summary

The billing summary opens the billing page: the plan the workspace is on, what it costs and when it renews on an ink card, with the facts of the next invoice beside it.

## Use
```tsx
<BillingSummary
  plan="Shop" status="Active" price="$29" per="a month"
  renewal="Renews on 1 December 2026."
  actions={<>
    <Button size="md" href="/billing/plans">Change plan</Button>           {/* yellow on the ink card */}
    <Button variant="ghost" size="md">Cancel plan</Button>                 {/* easy to find, hard to hit */}
  </>}
  invoice={[
    { label: 'Date', value: '1 December 2026' },
    { label: 'Shop plan', value: '$29.00', numeric: true },
    { label: 'Total', value: '$39.00', numeric: true, strong: true },
    { label: 'Paid with', value: 'Card ending 4242' },
  ]}
  invoiceActions={<Button variant="quiet" size="sm" href="/billing/card">Change the card</Button>}
/>
```

## Parts
- The ink card: "Current plan" above the plan's name in `title` type, the state as a yellow Badge at the end, the price as on the pricing cards, the renewal date, and the plan's buttons.
- The invoice card: "Next invoice" and its facts as a plain description list, then small buttons. Leave `invoice` out to show the ink card alone.
- The two cards sit side by side from 20rem each and stack below that.

The status says the state of the subscription in a word or two: "Active", "Trial, 5 days left", "Payment failed", "Cancels on 1 December". Text becomes a yellow Badge; pass an element to draw another.

## Do and don't
- Do print the renewal date in full, with the year.
- Do keep "Cancel plan" a ghost button beside the main one.
- Don't show the card number beyond its last four digits.
- Don't put usage bars on the ink card. They go in a Usage Meter beside it.
