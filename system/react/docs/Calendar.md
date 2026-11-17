---
category: Forms
keywords: [calendar, date, month view, date range, day picker, schedule]
---
# Calendar

A calendar shows a month as a grid of days and takes one date or a range.

## Use
```tsx
<Calendar value={day} onChange={setDay} min="2026-11-15" />                     {/* one date, 'YYYY-MM-DD' */}

<Calendar mode="range" months={2} value={period}                                  {/* 'start/end' */}
  onChange={(value, complete) => complete && setPeriod(value)} />

<Card style={{ padding: 'var(--space-6)' }}>                                     {/* on a tray */}
  <Calendar defaultValue="2026-11-19" />
</Card>
```

## Options
`mode` is `single` or `range`; `months` shows one or two months side by side; `min` and `max` fence the days that can be picked; `month` ('YYYY-MM') is the month shown first; `weekStart` 1 starts the week on Monday, 0 on Sunday; `locale` names the months and weekdays (default `en-GB`); `today` fixes which day carries the dot.

`onChange` runs on every pick with the value and whether it is complete: halfway through a range the value is 'start/' and `complete` is false.

## Look
Days are 44px cells with 14px corners. Today carries a small dot. A picked day is solid ink; the days between two ends of a range are a grey band that joins them. Days of the next and previous month are in hint ink in the one-month view and left out of the two-month view.

## Keyboard
The arrow keys move by a day or a week and turn the page at the edge of a month; Enter or Space picks.

## Do and don't
- Do set `min` when the past makes no sense (a delivery date).
- Do use a Date Picker inside a form; a Calendar sits open on a page or in a panel.
- Don't use a calendar for a date of birth; three plain fields are faster.
