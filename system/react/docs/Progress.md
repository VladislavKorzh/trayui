---
category: Feedback
keywords: [progress, progress bar, meter, loading bar, steps, stepper bar, upload, completion]
---
# Progress

A progress bar shows how much of a known whole is done: an 8px pill in `track`, filled in ink, with its name and value above.

## Use
```tsx
<Progress label="Uploading label.pdf" value={42} />                          {/* "42%" at the end */}
<Progress label="Autumn batch" aria-label="Autumn batch reserved"
          value={280} max={412} valueText="132 of 412 jars left" meter />    {/* a level, not a task */}
<Progress label="Checking the address" />                                    {/* no value: a sliding segment */}
<Progress steps={4} value={2} label="Delivery" aria-label="Checkout" />      {/* "Step 2 of 4" */}
<Card tone="inverse"><Progress tone="accent" label="Season so far" valueText="104 kg" value={80} /></Card>
```

## Forms
- The bar: the name at the start, the value at the end, the bar beneath. The fill is `value` out of `max` (100 by default).
- Busy: leave `value` out while the length is not known yet; a short segment slides along the track. Once the length is known, give the value.
- Steps: `steps` turns it into a row of short pills for a sequence, with `value` finished. Name the current step with `label` and the whole sequence with `aria-label`.
- `meter` gives the bar `role="meter"` instead of `progressbar`, for a level that is not a task: stock left, a rating, a share.
- `tone="accent"` fills in yellow, only for the single bar on an ink card.

The bar is named by `aria-label`, or by `label` when it is text, and carries `aria-valuemin`, `aria-valuemax` and `aria-valuenow`. When `valueText` is not the percentage, the bar also says it as `aria-valuetext`, after the percentage: "68%: 132 of 412 jars left".

## Do and don't
- Do write the value in words when it is not a percentage: "132 of 412 jars left".
- Do use ink for the fill; yellow only on an ink card.
- Don't use a data colour for a progress bar.
- Don't let the bar go backwards.
