---
category: Forms
keywords: [date picker, datepicker, date field, date input, date range picker, period picker]
---
# Date Picker

A date picker is a field that opens a calendar and shows the chosen date in words.

## Use
```tsx
<Field label="Delivery day">
  <DatePicker name="day" min="2026-11-15" value={day} onChange={setDay} />   {/* closes on the pick */}
</Field>

<Field label="Report period">
  <DatePicker mode="range" max={today} apply
    presets={[{ label: 'Last 7 days', days: 7 }, { label: 'Last 30 days', days: 30 }]}
    value={period} onChange={(value, complete) => complete && setPeriod(value)} />
</Field>
```

## Behaviour
The trigger is the system's field; the panel is a raised panel with a Calendar in it. A single date closes the panel as soon as it is picked and reads "19 Nov 2026". A range shows two months side by side, in the manner of travel booking pickers, and reads "18 – 24 Nov 2026"; halfway through it reads "18 Nov 2026 – …" and `onChange` reports `complete` false.

- `presets` adds buttons above the calendar that pick the last N days, ending today.
- `apply` adds Clear and Apply under the calendar; the panel then stays open until Apply is pressed.
- `name` puts 'YYYY-MM-DD' or 'start/end' in a hidden input for a form.

Inside a Field it takes the label, the hint and the error by itself. It opens on click or Enter, never on focus.

## Do and don't
- Do write the placeholder as an instruction: "Pick a day".
- Do offer presets when a few ranges cover most needs (reports).
- Don't use it for dates far from today; pair it with a typed field or use selects.
