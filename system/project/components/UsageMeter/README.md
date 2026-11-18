# Usage Meter

A usage meter shows how much of a plan's allowance is used: a Progress bar per limit, the numbers in words, and a note once a limit is near.

## Markup
```html
<div class="tray-usage">
  <div class="tray-progress">
    <span class="tray-progress__name">Orders this month</span>
    <span class="tray-progress__value">842 of 1,000</span>
    <span class="tray-progress__bar" role="meter" aria-label="Orders this month"
          aria-valuemin="0" aria-valuemax="1000" aria-valuenow="842" aria-valuetext="842 of 1,000" style="--tray-v: 84"></span>
  </div>
  <div class="tray-progress" data-level="high">
    <span class="tray-progress__name">Team seats</span>
    <span class="tray-progress__value">5 of 5</span>
    <span class="tray-progress__bar" role="meter" aria-label="Team seats"
          aria-valuemin="0" aria-valuemax="5" aria-valuenow="5" aria-valuetext="5 of 5" style="--tray-v: 100"></span>
    <span class="tray-progress__note">… Every seat is taken. Add seats to invite more people.</span>
  </div>
</div>
```
Each row is a Progress with `role="meter"`: a level, not a task. `data-level="high"` turns the value to `danger` and expects a `tray-progress__note` with an icon that says so in words. The bar stays ink: the system has no red fill but the destructive button. Set it from 90% up.

`tray-usage--sm` is the compact block for the foot of the sidebar: one limit and a link to upgrade.

## Accessibility
Each bar is a `role="meter"` named by its `aria-label`, with `aria-valuemin`, `aria-valuemax` and `aria-valuenow` in the units of its words. Add `aria-valuetext` with those words ("842 of 1,000"), so a screen reader reads what the page shows. A limit that is near shows in the `danger` value and in the note with its icon and words, never in colour alone. The bar stays ink, and with forced colours it is drawn in the system's colours.

## Do and don't
- Do print both numbers: "842 of 1,000", not "84%".
- Do say when the count starts again: "Resets on 1 December".
- Don't show limits the plan does not have. An unlimited allowance is a line of text, not a full bar.
- Don't block work at 100% without saying what happens next.
