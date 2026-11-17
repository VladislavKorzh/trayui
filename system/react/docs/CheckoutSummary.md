---
category: Billing
keywords: [checkout summary, order summary, cart summary, totals, promo code, coupon, pay button, checkout]
---
# Checkout Summary

The checkout summary is the card beside a payment form: what is being bought, line by line, a place for a promo code, the total in the largest type, and the button that pays.

## Use
```tsx
<CheckoutSummary
  title="Your plan"
  lines={[
    { label: 'Shop plan', detail: '12 months at $24, billed yearly', amount: '$288.00' },
    { label: 'Promo code AUTUMN', detail: '10% off the first year', amount: '−$38.40' },   // a discount is a line
    { label: 'VAT 20%', amount: '$69.12' },                                              // so is the tax
  ]}
  promo onApplyPromo={(code) => applyCode(code)}           // the promo field with "Apply"
  total="$414.72"
  payLabel="Pay $414.72" onPay={pay}                        // the one yellow button: it repeats the amount
  note="Renews on 15 November 2027. Cancel any time."       // with a lock icon
/>

<CheckoutSummary variant="plain" lines={[{ label: 'Market plan', detail: 'Monthly', amount: '$79.00' }]} total="$79.00" />
```

## Parts
- Each line is a name at the start edge and an amount at the end edge; `detail` sets a small line under the name that explains it.
- The promo field is an Input Group with an "Apply" button; the code can be controlled with `promoCode` and `onPromoCodeChange`.
- The total sits over a hairline in `subtitle` size. The pay button repeats the amount; `payType="submit"` and `payForm` let it send the payment form beside it, and `paying` shows a spinner.
- The note under the button says when the next charge comes, with a lock icon.
- `variant="plain"` drops the card, the title and the button: the lines and the total alone, for a single item.

## Do and don't
- Do show tax and discounts as their own lines, so the total can be checked by adding.
- Do say when the next charge comes and how much it is.
- Don't put a second yellow button on the page with the summary.
- Don't hide the promo field behind a link if most people have a code; do hide it if few do.
