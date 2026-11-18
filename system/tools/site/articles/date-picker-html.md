# A date picker in plain HTML and JavaScript

When `<input type="date">` is enough, and how to build a calendar grid: arrow keys, Page Up and Down, Home and End, month buttons, the date in the name.

A date picker is a field that opens a calendar. The WAI-ARIA Authoring Practices Guide (APG) has a full [date picker dialog example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/): a text field, a button that opens a dialog, and a grid of days inside it. Below, each part is built in plain HTML and JavaScript, next to what Tray UI's [Date Picker](#c-date-picker) and [Calendar](#c-calendar) do. Start with the part you may not need to build at all.

## When the date input is enough

`<input type="date">` is a date picker that comes with the browser. MDN marks it as working across browsers since April 2021.

```html
<label for="delivery">Delivery day</label>
<input type="date" id="delivery" name="delivery" min="2026-11-18" max="2026-12-31" required>
```

- **The value is always `yyyy-mm-dd`.** The field shows the date in the format of the person's own browser locale, and the form sends `2026-11-30` whatever the reader saw. You cannot choose the displayed format.
- **`min` and `max` bound it.** The browser's picker disables the dates outside them, and the form will not submit a typed date beyond them.
- **The picker is the browser's.** MDN: "The appearance of the date picker input UI varies based on the browser and operating system."

That covers one date, near today, in a form. Build your own when you need what the browser does not draw: a range across two months side by side, presets such as "Last 30 days", the chosen date shown in words in your own format, or a calendar that stays open on the page, as in a sidebar.

For a date the person already knows, use neither. GOV.UK's Design System asks for a date of birth with three plain fields, day, month and year, and keeps calendars for when people need to "pick a date in the near future or recent past", "know the day of the week", or "see dates in relation to other dates". Tray UI's Calendar says the same: "Don't use a calendar for a date of birth; three plain fields are faster." GOV.UK also asks you to let people type the date as well as pick it.

## The parts

The APG example has five:

1. a text field for the date, with its format in a hint;
2. a button named "Choose Date", which opens the dialog;
3. a modal dialog, `role="dialog"` with `aria-modal="true"` and a name;
4. a heading with the month and year, between buttons for the month and year before and after;
5. the grid of days, followed by Cancel and OK.

A modal `<dialog>` opened with `showModal()` gives the third part natively: Escape closes it and the page behind it cannot be reached. [Modal dialogs in plain HTML](#a-modal-dialog-html) covers it. What follows is the grid, its keys, the month buttons and the name of the button.

## The grid of days

The APG builds the month as a table with `role="grid"`, named by the month heading.

- **The column heads** are the days of the week. Their text is two letters, and each `th` has an `abbr` with the full name; the APG gives it so that screen readers can say the whole day.
- **Each day** is a `td` with `role="gridcell"`.
- **One day has `tabindex="0"`**, every other `tabindex="-1"`. The grid is then one stop for Tab, and the arrow keys move inside it. This is a roving tabindex: when focus moves, the `0` moves with it.
- **The chosen day** has `aria-selected="true"`.
- **The heading is a live region** with `aria-live="polite"`, so that a new month is announced when it changes.

```html
<div class="calendar">
  <button type="button" data-step="-1" aria-label="Previous month">‹</button>
  <h2 id="month" aria-live="polite"></h2>
  <button type="button" data-step="1" aria-label="Next month">›</button>
  <table role="grid" aria-labelledby="month">
    <thead>
      <tr>
        <th scope="col" abbr="Monday">Mo</th>
        <th scope="col" abbr="Tuesday">Tu</th>
        <th scope="col" abbr="Wednesday">We</th>
        <th scope="col" abbr="Thursday">Th</th>
        <th scope="col" abbr="Friday">Fr</th>
        <th scope="col" abbr="Saturday">Sa</th>
        <th scope="col" abbr="Sunday">Su</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>
```

The week here starts on Monday. For a week that starts on Sunday, put the Sunday column first and drop the `+ 6` from the two places where the script below works out a column.

## The keys

These are the keys of the APG grid.

| Key | Focus moves to |
| --- | --- |
| ArrowLeft, ArrowRight | The day before or after. |
| ArrowUp, ArrowDown | The same day of the week before or after. |
| Home, End | The first or the last day of the week. |
| Page Up, Page Down | The same day of the month before or after. |
| Shift+Page Up, Shift+Page Down | The same day of the year before or after. |
| Enter, Space | Picks the focused day; the dialog closes and focus returns to the button. |
| Escape | The dialog closes, nothing is picked, and focus returns to the button. |

Every move that leaves the month shows the new month. Page Up and Page Down keep the number of the day, unless the month is too short for it: in the APG's words, "If that day does not exist, moves focus to the last day of the month." From 31 January 2027, Page Down lands on 28 February.

## A script from scratch

This runs the grid above. It draws a month, moves focus with every key in the table, picks with Enter, Space or a click, and turns the month with the two buttons. It fires a `pick` event with the date, for the dialog around it to close and fill in its field.

```js
const grid = document.querySelector('[role="grid"]');
const title = document.getElementById('month');
const monthName = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });
let focused = new Date(2026, 10, 18); // the day with tabindex="0"
let selected = null;

// The same day in another month, or that month's last day when it has no such day
function sameDay(y, m, day) {
  return new Date(y, m, Math.min(day, new Date(y, m + 1, 0).getDate()));
}

// Where each key moves focus from the date d
function target(d, key, shift) {
  const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
  const col = (d.getDay() + 6) % 7; // 0 on Monday, the first column
  return {
    ArrowLeft: () => new Date(y, m, day - 1),
    ArrowRight: () => new Date(y, m, day + 1),
    ArrowUp: () => new Date(y, m, day - 7),
    ArrowDown: () => new Date(y, m, day + 7),
    Home: () => new Date(y, m, day - col),
    End: () => new Date(y, m, day + 6 - col),
    PageUp: () => sameDay(y, m - (shift ? 12 : 1), day),
    PageDown: () => sameDay(y, m + (shift ? 12 : 1), day),
  }[key]?.();
}

function render() {
  const y = focused.getFullYear(), m = focused.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
  const name = monthName.format(focused);
  if (title.textContent !== name) title.textContent = name; // the live region
  let html = '<tr>' + '<td></td>'.repeat(lead);
  for (let d = 1; d <= days; d++) {
    if (d > 1 && (lead + d - 1) % 7 === 0) html += '</tr><tr>';
    const isSelected = !!selected && +selected === +new Date(y, m, d);
    html += `<td role="gridcell" data-day="${d}" tabindex="${d === focused.getDate() ? 0 : -1}"` +
      ` aria-selected="${isSelected}">${d}</td>`;
  }
  grid.tBodies[0].innerHTML = html + '</tr>';
}

function moveTo(date) {
  focused = date;
  render();
  grid.querySelector('[tabindex="0"]').focus();
}

function pick(date) {
  selected = date;
  moveTo(date);
  grid.dispatchEvent(new CustomEvent('pick', { detail: date, bubbles: true }));
}

grid.addEventListener('keydown', (e) => {
  if (!e.target.matches('[role="gridcell"]')) return;
  const picks = e.key === 'Enter' || e.key === ' ';
  const to = picks ? focused : target(focused, e.key, e.shiftKey);
  if (!to) return;
  e.preventDefault();
  if (picks) pick(to); else moveTo(to);
});

grid.addEventListener('click', (e) => {
  const cell = e.target.closest('[data-day]');
  if (cell) pick(new Date(focused.getFullYear(), focused.getMonth(), +cell.dataset.day));
});

document.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
  focused = sameDay(focused.getFullYear(), focused.getMonth() + +b.dataset.step, focused.getDate());
  render(); // focus stays on the button; the heading says the new month
}));

render();
```

- **Dates by their parts.** `new Date(y, m, day - 7)` lets the `Date` object carry the overflow: day 0 is the last day of the month before, and month 12 is January of the next year. Avoid adding milliseconds, which goes wrong on the days the clocks change.
- **Write the heading only when it changes.** Setting `textContent`, even to the same words, replaces the text of the live region, which is a change to it. The check leaves the heading alone while focus stays inside the month.
- **Days outside the month are empty cells** here, and focus never lands on one: every key gives a real date, and `render()` moves the month to it.
- **Limits.** For a `min` and a `max`, return early from `moveTo` when the date is outside them, and give those cells `aria-disabled="true"`.
- **Right to left.** In a page with `dir="rtl"` the week runs from right to left, so ArrowLeft should move to the next day. Swap the two arrows when `getComputedStyle(grid).direction` is `rtl`.

## Month buttons with names

The buttons around the heading usually show a chevron and no word, so each needs a name: `aria-label="Previous month"` and `aria-label="Next month"`. Write them in the language of the page, as the month and day names are. Tray UI's Calendar takes them from `data-prev-label` and `data-next-label`, which version 0.2.0 added, and its month and day names from `data-locale` through `Intl.DateTimeFormat`.

```html
<div data-tray="calendar" data-locale="fr-FR"
     data-prev-label="Mois précédent" data-next-label="Mois suivant"></div>
```

A press on a month button leaves focus on the button, so nothing on the button says which month is now shown. That is why the APG makes the heading a polite live region. Tray UI's month title is not one: after Next month, the new month reaches assistive technologies when focus moves into the days, since every day's name holds its month and year.

## The date in the button's name

Once a date is picked, the button that opened the calendar should say it. A person who tabs back to it then meets the date with the field's name, without opening the calendar again. The APG's button starts as "Choose Date" and, after a pick, its `aria-label` becomes "Change Date" followed by the date.

Tray UI's Date Picker shows the date on the button, in words such as "22 Nov 2026", and puts the same words in its name. A `<label>` or `aria-labelledby` replaces the content of a button as its name, so with the label alone the date would be missing from the name. The fix is to list both in `aria-labelledby`:

```html
<span id="delivery-label">Delivery day</span>
<button type="button" aria-labelledby="delivery-label delivery-value"
        aria-haspopup="dialog" aria-expanded="false">
  <span id="delivery-value">Pick a day</span>
</button>
```

```js
document.addEventListener('pick', (e) => {
  document.getElementById('delivery-value').textContent =
    e.detail.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
});
```

Chrome then computes the button's name as "Delivery day 22 Nov 2026", and before a pick, "Delivery day Pick a day". The words in the placeholder become part of the name, so write it as an instruction.

## The date picker in Tray UI

Write a trigger, a panel with a calendar in it, and a hidden input for the form, with `data-tray="datepicker"` on the anchor around them:

```html
<span class="tray-label" id="delivery-label">Delivery day</span>
<div class="tray-anchor tray-anchor--block" data-tray="datepicker">
  <button class="tray-select-trigger" type="button" aria-labelledby="delivery-label" data-placeholder>
    <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-calendar"/></svg>
    <span class="tray-select-trigger__value">Pick a day</span>
  </button>
  <div class="tray-pop tray-pop--roomy">
    <div data-tray="calendar" data-min="2026-11-18"></div>
  </div>
  <input type="hidden" name="delivery">
</div>
```

The script makes the panel a `role="dialog"` named as the field, gives the trigger `aria-haspopup="dialog"`, `aria-controls` and `aria-expanded`, and adds the value to the trigger's `aria-labelledby`, as above. Enter, Space or ArrowDown opens the panel and moves focus to the picked day, or to today. Escape closes it, and so does picking a single date; either way focus returns to the trigger. The panel is not modal: Tab out of it closes it too. The hidden input holds `YYYY-MM-DD`.

For a range, set `data-mode="range" data-months="2"` on the calendar: two months sit side by side, and the trigger reads "18 – 24 Nov 2026". Buttons with `data-preset="7"` pick the last seven days, and a `data-apply` button keeps the panel open until it is pressed. The [Table with filters and bulk actions](#b-table-01) block has a range with presets.

The calendar inside takes a different road from the APG's grid. Each day is a `<button>` named with its full date, such as "Tuesday, 1 December 2026", and the picked day, or each end of a range, has `aria-pressed="true"`. The weekday letters are hidden from assistive technologies, since every day's name holds its weekday. The days are one Tab stop with a roving tabindex. The arrow keys move by a day or a week, turn the month at its edge, stop at `min` and `max`, and swap in a right-to-left page; Enter or Space picks. Home, End, Page Up and Page Down are not handled, so a far month is reached with the month buttons.

The calendar fires `tray:change` with `detail.value` and `detail.complete`, false while a range has only its first day. It also works alone on the page, as in the [Sidebar with a calendar](#b-sidebar-10), and from a script with `TrayUI.calendar(el, options)`. The [Date Picker](#c-date-picker) and [Calendar](#c-calendar) pages have live examples and every option, and [Installation](#d-installation) has the lines that link the stylesheet and the script.
