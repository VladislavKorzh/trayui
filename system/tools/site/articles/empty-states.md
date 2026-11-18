# Empty states that say what to do next

Empty states for a first use, a search with no results, filters that hide everything, an error and no access: one action each, and a count that is read.

## Why the screen is empty

An empty list has a cause, and the cause decides the words and the button. Tray UI's [Empty](#c-empty) component names three kinds: first use, no results and all done. Its blocks add no access, and a failed request needs care, because it can pass for any of them.

| Why it is empty | The heading says | The one action | Start from |
| --- | --- | --- | --- |
| Nothing has been made yet | What will appear here | Make the first one | [First run](#b-empty-01) |
| The search matched nothing | The words searched for | Clear the search | [No results](#b-empty-02) |
| The filters hide every row | Which filter is in the way | Lift that filter | [No results](#b-empty-02) |
| The data did not load | What failed | Try again | The markup below |
| The person may not see it | Who may open it | Ask for access | [No access](#b-empty-03) |
| The work is done | That nothing is left | None | [Notification Center](#c-notification-center) |

## The parts of an empty state

Tray UI's Empty is a centred column of four parts: an icon tile, a heading, one sentence and the actions.

```html
<div class="tray-empty">
  <span class="tray-empty__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-inbox"/></svg></span>
  <div class="tray-empty__text">
    <h3 class="subtitle">No orders yet</h3>
    <p>When a customer orders a jar, it lands here with the address and the courier slot.</p>
  </div>
  <div class="tray-empty__actions">
    <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">Place a test order</button>
  </div>
</div>
```

- The heading names what is missing, in the person's words: "No orders yet". The Empty rules ask you not to blame the person.
- The sentence says what will appear, or why nothing did, at most 36 characters a line (`max-inline-size: 36ch`).
- The icon's `<svg>` is `aria-hidden`. A screen reader meets the heading, the sentence, then the buttons, in source order.
- The heading level fits the page: an `<h3>` under the `<h2>` "All orders" in First run, an `<h2>` under the page's `<h1>` in No results.

## Keep the table and its headers

Put the empty state where the rows would be, in one cell that spans the columns.

```html
<table class="tray-table" aria-labelledby="orders-title">
  <thead>
    <tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Status</th><th scope="col" data-num>Total</th></tr>
  </thead>
  <tbody>
    <tr><td colspan="4"><div class="tray-empty">…</div></td></tr>
  </tbody>
</table>
```

The table keeps its name, its heads say what will land here, and the first row takes the message's place without moving the page. In Chrome's accessibility tree the table keeps its column headers, and the empty row is one row with one cell holding the heading, the sentence and the button. The [Data Table](#c-data-table) does this itself: its behaviour shows a `<tr data-empty hidden>` row when its filter matches nothing and hides it when rows come back.

## First use: the step that makes the first item

[First run](#b-empty-01) is an orders page on a workspace's first day. The table's empty row says "No orders yet" and what will land there, and offers "Place a test order", which "goes through packing and labels, and is never charged". It shows the person a full screen before any customer orders.

Above the table, an [Onboarding Checklist](#c-onboarding-checklist) lists five tasks, two done, under a progress bar; only the current task shows its sentence and its button. It marks that task with `aria-current="step"`, keeps the bar's `aria-valuetext` in step ("3 of 5"), and moves focus to the next task's button when one is done. Beside it, a [File Upload](#c-file-upload) card imports last season's orders from a spreadsheet.

## One action, not three

People read an empty state when they are unsure what to do, and three buttons hand the doubt back to them. Offer the action that fills the screen, and leave the others where they live on the full page. The Empty rules: "Do offer one primary action at most."

First run keeps to this across the screen: the accent button belongs to the next setup task, "Choose the days", the empty row's button is quiet, and "New order" stays in the page head. No results has a quiet button and a ghost one, because they lift different things: the city filter, or every filter.

## No results: keep the cause in view

[No results](#b-empty-02) is a customer list where the search "Mriya" and two filters, City: Lviv and Last order: This month, leave nobody. The [Filter Bar](#c-filter-bar) stays as it was, chips and all, so the cause is on screen, and the table keeps its headers while one row explains.

The heading quotes the search: No customer matches “Mriya”. The sentence is worked out from the data. The block's script tries the rows again without the city filter, finds two, and says "It has 2 matches in other cities: Kyiv and Odesa", with a button to search every city. When lifting the city filter would not help, the sentence reads "Check the spelling, or clear the filters to search all 312 customers" and that button hides. With no chip on at all, the other button says "Clear the search".

### A filter that hides everything

When a search and filters together find nothing, find the part to blame before you write the message. Run the query again with one filter left out at a time; a filter that brings rows back when lifted is the one to name and offer to lift. When the search finds nothing even alone, the words are the problem: say so, and offer to clear them. Name a filter as its chip does, "City: Lviv".

### Say the count

Rows that vanish make no sound: when an empty state takes the place of results, the Empty rules say, "nothing announces it". The WCAG 2.2 Understanding document for success criterion 4.1.3 lists a line such as "18 results returned" or "No results returned" as a status message, and the technique ARIA22 marks one with `role="status"`. No results has such a line above the table, "0 of 312 customers match", and rewrites it after every keystroke and every chip.

Put the region in the page from the start, with its first count in it. MDN's guide to live regions: "The most reliable way to ensure that live regions are registered is to include them in the initial markup."

### Where focus goes

"Clear the filters" sits in the empty row, and that row is hidden as soon as rows return. When the element with focus is hidden or disabled, focus has nowhere to stay: in Chrome, a moment later `document.activeElement` is `body`. Move focus first. Both buttons in No results put it in the search field, where the person types next.

This standard example, with no Tray UI in it, keeps the count in a status region and moves focus before the empty row hides.

```html
<label for="q">Search customers</label>
<input id="q" type="search">
<p id="count" role="status">All 4 customers</p>
<table>
  <caption>Customers</caption>
  <thead><tr><th scope="col">Name</th><th scope="col">City</th></tr></thead>
  <tbody id="rows">
    <tr><td>Mriya restaurant</td><td>Kyiv</td></tr>
    <tr><td>Lev restaurant</td><td>Lviv</td></tr>
    <tr><td>Olena Bondar</td><td>Lviv</td></tr>
    <tr><td>Hill Cheese shop</td><td>Dnipro</td></tr>
    <tr id="empty" hidden>
      <td colspan="2">
        <h2 id="empty-title">No customer matches</h2>
        <p>Check the spelling, or clear the search to see every customer.</p>
        <button type="button" id="clear">Clear the search</button>
      </td>
    </tr>
  </tbody>
</table>
```

```js
const q = document.getElementById('q');
const count = document.getElementById('count');
const empty = document.getElementById('empty');
const rows = [...document.querySelectorAll('#rows tr:not(#empty)')];

function paint() {
  const term = q.value.trim().toLowerCase();
  let shown = 0;
  for (const row of rows) {
    row.hidden = !row.cells[0].textContent.toLowerCase().includes(term);
    if (!row.hidden) shown++;
  }
  empty.hidden = shown > 0;
  document.getElementById('empty-title').textContent = `No customer matches “${q.value.trim()}”`;
  count.textContent = term ? `${shown} of ${rows.length} customers match` : `All ${rows.length} customers`;
}

q.addEventListener('input', paint);
document.getElementById('clear').addEventListener('click', () => {
  q.value = '';
  q.focus(); // before the row that holds this button is hidden
  paint();
});
```

## When the data does not load

Code that treats a failed request as an empty list shows a first-use or no-results message, and "No customers yet" is then false: the person may start adding what already exists. Give the failure its own words and one button. No block shows this state; build it from the same Empty in the same row:

```html
<tr>
  <td colspan="4">
    <div class="tray-empty">
      <span class="tray-empty__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-circle-alert"/></svg></span>
      <div class="tray-empty__text">
        <h2 class="subtitle">The customers did not load</h2>
        <p>The server did not answer. Your search and filters are kept.</p>
      </div>
      <div class="tray-empty__actions">
        <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">
          <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-rotate-cw"/></svg>Try again
        </button>
      </div>
    </div>
  </td>
</tr>
```

Write the failure into the count line as well, "The customers did not load", so it is read as the counts are; WCAG's definition of a status message includes the existence of errors. When "Try again" brings the rows, its row goes, so move focus to the search field or the table first.

When part of a page loaded and part did not, keep what loaded and put a danger [Alert](#c-alert) over the part that is missing. An alert stays in the page until its cause is gone, and its rules say not to close an error on a timer. A [Toast](#c-toast) reports an event from a corner of the screen and can be dismissed while the problem stays, so it is the wrong place.

## No access: the data exists

[No access](#b-empty-03) is the reports page as a packer sees it. The figures and the chart stay on the page, dimmed, behind a prompt that names the owner and offers one button, "Ask Oksana for access". A badge with a lock beside the title says who can open the page, and a card under the prompt lists what the packer can do today.

The prompt is the locked form of the [Upgrade Prompt](#c-upgrade-prompt): `tray-locked__content` holds the preview at the disabled opacity, 0.45, and `tray-locked__prompt` floats over it. The preview carries `inert` and `aria-hidden="true"`. MDN says inert content cannot be focused and is excluded from the accessibility tree, so Tab skips the chart, which takes focus anywhere else, and a screen reader meets only the prompt. The Upgrade Prompt's rules cover this case too: where the person cannot upgrade, tell them to ask the owner.

After the request, the button is disabled and reads "Request sent", and the note under it says when it went. Disabling the button that has focus drops focus as hiding it does. Move focus to the note first, with `TrayUI.rescue(button, note)`, as the block does since version 0.3.0, or keep the button focusable with `aria-disabled="true"`, as the Notification Center does with "Mark all as read". With focus on it the note is read, so it needs no `role="status"`; a toast says the request went.

## On a phone

Below 56rem the sidebar leaves the page and a menu button in the top bar opens it in a sheet. Below 48rem the top bar's search folds to its icon and the breadcrumb keeps only the current page. At 390 pixels wide:

- First run stacks the checklist and the import card, side by side from 56rem, and the empty table comes after both.
- No results wraps its filter bar onto three rows and its chips onto two. The empty state's two buttons stack, centred. The four columns fit; a wider table scrolls sideways inside `tray-table-wrap`.
- No access sets the stat cards two across, and the prompt stays centred on the preview, 2rem narrower than it and at most 25rem wide.

## Empty states in Tray UI

Start from the block that matches the cause:

- [First run](#b-empty-01) for a new account: the empty table with a test order, the [Onboarding Checklist](#c-onboarding-checklist) and an import.
- [No results](#b-empty-02) for a search or filters that match nothing: the Filter Bar, the count in a status region and a message worked out from the data.
- [No access](#b-empty-03) for data the person may not see: the locked Upgrade Prompt over an `inert` preview.

Each is one HTML file over the three files that [Installation](#d-installation) links. Smaller empty states come with their components. The [Combobox](#c-combobox) shows a `tray-list__empty` sentence when nothing matches and says it through a hidden status line, since focus stays in the field; the [Command](#c-command) palette shows one in its list and, since version 0.3.0, says it the same way, with the count of what is left. In the Notification Center's Unread view, reading the last unread notification moves focus to "Nothing unread." The [Empty](#c-empty) page has the component and its rules.
