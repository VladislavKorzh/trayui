# Calendar

A calendar shows a month as a grid of days and takes one date or a range.

## Markup
```html
<div data-tray="calendar" data-mode="range" data-months="2"
     data-value="2026-11-18/2026-11-24" data-min="2026-11-15"></div>
```
The behaviour draws everything inside. Options, as `data-` attributes or as the second argument of `TrayUI.calendar(el, options)`:

| Option | Values |
| --- | --- |
| `mode` | `single` (default) or `range` |
| `months` | `1` or `2` months side by side |
| `value` | `YYYY-MM-DD`, or `start/end` for a range |
| `min`, `max` | first and last day that can be picked |
| `month` | `YYYY-MM`, the month shown first |
| `week-start` | `1` Monday (default), `0` Sunday |
| `locale` | a BCP 47 tag for month and weekday names, default `en-GB` |
| `prev-label`, `next-label` | the names of the month buttons in the page's language, default "Previous month" and "Next month" (`prevLabel`, `nextLabel` as options) |

It fires `tray:change` with `detail.value` and `detail.complete` (false while a range has only its first day).

## Look
Days are 44px cells with 14px corners. Today carries a small dot. A picked day is solid `ink`; the days between two ends of a range are a grey band that joins them. Days of the next and previous month are in `ink-hint` in the one-month view and left out of the two-month view.

## Accessibility
Each day is a `<button>` named with its full date, such as "Thursday, 19 November 2026", and a picked day, or each end of a range, has `aria-pressed="true"`. The days are one stop for `Tab`, and the days before `min` or after `max` are `disabled`. The arrow keys move by a day or a week and turn the page at the edge of a month; in a right-to-left page the week runs from right to left, and the left arrow moves on to the next day. Enter or Space picks. The month buttons are named "Previous month" and "Next month", or in the page's language with `prev-label` and `next-label`, as the days and months already are with `locale`. The weekday letters are hidden, since each day's name holds its weekday. The focus ring is drawn inside the day, in the page colour on a picked day. Today's dot and the band between the ends of a range are not announced.

## Do and don't
- Do set `min` when the past makes no sense (a delivery date).
- Don't use a calendar for a date of birth; three plain fields are faster.

## In a narrow column
`tray-cal--fluid` makes the calendar as wide as its column, the days sharing it equally: in a sidebar or a small panel.
