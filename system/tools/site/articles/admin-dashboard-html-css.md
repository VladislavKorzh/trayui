# An admin dashboard in plain HTML and CSS

How an admin dashboard is put together in HTML and CSS: an app shell, a sidebar that folds, a top bar, stat cards, a chart and a table that pages.

An admin dashboard is the first screen after sign-in: the week at a glance, then the work that waits. This article puts its usual parts together in plain HTML and CSS, with Tray UI's [Dashboard](#b-dashboard-01) block as the worked example. Like every block, it is one HTML file over `tokens.css`, `components/bundle.css` and `components/bundle.js`, and you can copy it whole.

## The parts and the landmarks

| Part | Element | In Tray UI |
| --- | --- | --- |
| The frame | A two-column grid | [App Shell](#c-app-shell) |
| Navigation | `<nav aria-label="Main">` | [Sidebar](#c-sidebar), [Workspace Switcher](#c-workspace-switcher), [Usage Meter](#c-usage-meter) |
| Place, search, account | `<header>` | [Top Bar](#c-top-bar), [Breadcrumb](#c-breadcrumb) |
| Title and main action | `<h1>` and one button | [Page Header](#c-page-header) |
| Metrics | A row of cards | [Stat Card](#c-stat-card) |
| A chart | `<figure>` | [Chart](#c-chart) |
| The latest records | `<table>` | [Data Table](#c-data-table) |

The elements give the page its landmarks: one `<main>`, a `<header>` and a `<nav>` with a name. Assistive technologies let a person move from landmark to landmark, so the navigation and the content are each one jump away.

```html
<div class="tray-app">
  <div class="tray-app__side">
    <nav class="tray-sidebar" id="nav" aria-label="Main">…</nav>
  </div>
  <div class="tray-app__main">
    <header class="tray-topbar">…</header>
    <main class="tray-app__content">
      <div class="tray-pagehead">…</div>
      <div class="tray-stats tray-stats--four">…</div>
      <section class="tray-card" aria-labelledby="orders-chart-title">…</section>
      <section aria-labelledby="orders-table-title">…</section>
    </main>
  </div>
</div>
```

The page header holds the screen's one primary button, New order, with a quiet Export beside it. The top bar holds no main action; the App Shell keeps it in the page header.

## The shell in CSS

These are Tray UI's rules for the shell, with the breakpoint that hides the sidebar:

```css
.tray-app {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--grid-gap);
  min-block-size: 100dvh;
  padding: var(--space-4);
}
.tray-app__side {
  position: sticky;
  inset-block-start: var(--space-4);
  align-self: start;
  block-size: calc(100dvh - 2 * var(--space-4));
}
.tray-app__side > .tray-sidebar { block-size: 100%; overflow-y: auto; }
.tray-app__main { display: flex; flex-direction: column; gap: var(--space-6); min-inline-size: 0; }
.tray-app__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-8);
  inline-size: min(100%, 72rem);
  margin-inline: auto;
}
@media (max-width: 55.99rem) {
  .tray-app { grid-template-columns: minmax(0, 1fr); }
  .tray-app__side { display: none; }
}
```

- **A minimum of 0.** A `1fr` track has a minimum of `auto`, the smallest width its content can take. A table 40rem wide would push the whole page past the window. With a minimum of 0 the column shrinks, and the table scrolls inside its own frame. `min-inline-size: 0` on the main column lets that grid item shrink with its track.
- **A sticky side.** The side column is as tall as the window less the padding and sticks to the top, so the sidebar stays in view while the content scrolls. A long sidebar scrolls inside itself.
- **One column.** The content is at most 72rem wide and centred, with sections 32px apart.

## A sidebar that folds to a rail

The panel button at the start of the top bar folds the sidebar from 17rem to a rail 76px wide. The button names the sidebar with `aria-controls` and keeps `aria-expanded` in step, and its name says what a press will do: "Collapse the sidebar", then "Expand the sidebar". The state lives in one attribute on the sidebar, which the CSS reads. A version of your own:

```html
<button type="button" aria-controls="nav" aria-expanded="true" aria-label="Collapse the sidebar">…</button>
<nav id="nav" aria-label="Main">
  <a href="/orders" aria-current="page"><svg aria-hidden="true">…</svg><span>Orders</span></a>
</nav>
```

```css
#nav { inline-size: 17rem; }
#nav[data-collapsed] { inline-size: 76px; }
#nav[data-collapsed] a > span {
  position: absolute; inline-size: 1px; block-size: 1px; margin: -1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
```

```js
const button = document.querySelector('[aria-controls="nav"]');
const nav = document.getElementById(button.getAttribute('aria-controls'));

button.addEventListener('click', () => {
  const rail = nav.toggleAttribute('data-collapsed');
  button.setAttribute('aria-expanded', String(!rail));
  button.setAttribute('aria-label', rail ? 'Expand the sidebar' : 'Collapse the sidebar');
});
```

In the rail the labels are hidden from sight with the clip pattern of a visually hidden class. They stay in the accessibility tree, so every link keeps its name; `display: none` would take them out of it. Group labels can go entirely. Each item needs a tooltip with its label for sighted users; in Tray UI the tooltip shows only in the rail, and one that repeats the link's name is drawn for the eye alone, so it is not read twice.

In Tray UI the button is `data-tray="sidebar-toggle"` with `aria-controls`, and the script does all of the above. Nothing remembers the rail between pages. The sidebar fires `tray:change` with `detail.collapsed` as it folds: store the choice there, and set `data-collapsed` again before the script runs. With both names on the button it starts in step either way.

```html
<button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon tray-app__collapse" type="button"
        data-tray="sidebar-toggle" aria-controls="nav" aria-label="Collapse the sidebar"
        data-label-collapse="Collapse the sidebar" data-label-expand="Expand the sidebar">…</button>
…
<script>
  const nav = document.getElementById('nav');
  if (localStorage.getItem('rail') === 'yes') nav.setAttribute('data-collapsed', '');
  nav.addEventListener('tray:change', (e) => localStorage.setItem('rail', e.detail.collapsed ? 'yes' : 'no'));
</script>
<script src="trayui/components/bundle.js"></script>
```

[Fifteen app sidebars](#a-app-sidebars) covers the other ways a sidebar can be built.

## The top bar

The bar says where the person is at its start and holds the tools at its end.

- **The breadcrumb** is a `<nav aria-label="Breadcrumb">` around an ordered list, and its last item carries `aria-current="page"`.
- **The search** is a button that looks like a field and opens a [Command](#c-command) panel. Its key hint, `/`, is drawn in a [Kbd](#c-kbd). Tray UI does not bind that key, so your own script has to listen for it, and only then add `aria-keyshortcuts="/"` to the button, which tells a screen reader the key works. Since version 0.3.0 the block's button no longer declares a key that nothing binds.
- **Notifications** is an icon button named "Notifications, 2 unread". The yellow count on its corner is hidden from assistive technologies, so the number is not read a second time. Change the label whenever the count changes.
- **The account** is the avatar as a button, named "Account: Oksana Franko".

## Stat cards

A stat card is plain text read in order: what it counts, the figure, then how it moved. Each part is a paragraph.

```html
<div class="tray-stat">
  <p class="tray-stat__label">Time to pack</p>
  <p class="tray-stat__value">26<small>min</small></p>
  <p class="tray-stat__foot">
    <span class="tray-trend" data-tone="bad"><svg class="tray-icon tray-icon--sm" aria-hidden="true">…</svg>+4 min</span>
    than the week before
  </p>
</div>
```

The arrow is hidden, so the sign in the text carries the direction: "+4 min", "−2". `data-tone` colours the trend by its meaning: the time to pack goes up and is red, the returns go down and are green. That colour is the only sign of good or bad here; when it matters, say it in words too. The foot always says what the figure is compared with.

Four cards should sit four across or two by two, never three and one. Tray UI does it with one grid rule and no media query:

```css
.tray-stats--four {
  display: grid;
  gap: var(--grid-gap);
  grid-template-columns: repeat(auto-fit, minmax(
    max((100% - 3 * var(--grid-gap)) / 4, min((100% - var(--grid-gap)) / 2, (40rem - 100%) * 999)),
    1fr));
}
```

`(40rem - 100%) * 999` is a huge positive length while the row is narrower than 40rem and a negative one once it is wider. So the smallest column is half the row on a narrow row and a quarter on a wide one, and `auto-fit` makes two columns or four. In Chromium, a row 639px wide gets two columns and a row 640px wide gets four.

## The chart

The chart is a `<figure>` whose figures are written as JSON in `data-chart`; Tray UI's script draws the bars in HTML. What makes it readable without sight:

- The plot is `role="img"`, named by the `summary` you write: "Bar chart of orders per day from 13 to 26 November. Weekends are the quietest days." Without one, the script names the plot with a long list of every value.
- The plot is a stop for Tab. ArrowLeft and ArrowRight walk the days, Home and End jump to the ends, and the tooltip shows the day in focus. What the keys reach ("24: 43 orders") is written into a polite live region beside the drawing, because the children of a `role="img"` are presentational and would never be read.
- "Show the figures" under the plot is a `<details>` that opens the same numbers as a table with scoped heads.

The 7 and 14 days switch above the chart is a pair of radios in a group named "Period". The block's script redraws the chart for the chosen days with `TrayUI.chart(el, config)`, and writes a new summary each time. A shorter version:

```js
const chart = document.getElementById('orders-chart');
const all = JSON.parse(chart.dataset.chart);

document.getElementById('orders-period').addEventListener('change', (event) => {
  const cut = all.labels.length - Number(event.target.value);
  const values = all.series[0].values.slice(cut);
  TrayUI.chart(chart, {
    ...all,
    labels: all.labels.slice(cut),
    series: [{ name: 'Orders', values }],
    summary: `Bar chart of orders per day. The most in one day was ${Math.max(...values)} orders.`,
  });
});
```

## The table: filter, select, sort and pages

The table of latest orders is a real `<table>`. The order number in each row is a row head, `<th scope="row">`, and every column head has `scope="col"`. Tray UI's Data Table finds each part by its attribute:

```html
<div class="tray-datatable" data-tray="datatable" data-page-size="6">
  <div class="tray-datatable__bar">
    <input class="tray-input" type="search" aria-label="Filter orders" data-filter>
    <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-bulk disabled>Print the labels</button>
  </div>
  <div class="tray-table-wrap" tabindex="0" role="region" aria-labelledby="orders-table-title">
    <table class="tray-table tray-table--hover tray-table--pad" aria-labelledby="orders-table-title">
      <thead><tr>
        <th class="tray-table__check"><input type="checkbox" data-select-all aria-label="Select all orders"></th>
        <th scope="col"><button class="tray-sort" type="button">Order<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-down"/></svg></button></th>
        <th scope="col" aria-sort="descending"><button class="tray-sort" type="button">Updated<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-down"/></svg></button></th>
      </tr></thead>
      <tbody><tr>
        <td class="tray-table__check"><input type="checkbox" data-select aria-label="Select order PL-20431"></td>
        <th scope="row">PL-20431</th>
        <td data-value="202611271031"><time datetime="2026-11-27T10:31">10:31</time></td>
      </tr></tbody>
    </table>
  </div>
  <div class="tray-datatable__foot">
    <span data-selected-count role="status"></span>
    <span data-page-status role="status"></span>
    <button type="button" data-page-prev aria-label="Previous page">…</button>
    <button type="button" data-page-next aria-label="Next page">…</button>
  </div>
</div>
```

The block wraps each checkbox in a `tray-check` label that draws the box. Keep the icon in each sort button: the behaviour turns it into an arrow that points the way of the sort. This is what the behaviour does:

- **Filter.** Typing hides the rows that do not contain the text, and a `<tr data-empty hidden>` row says so when none is left.
- **Sort.** The sort button sits inside its column head, and the head gets `aria-sort="ascending"` or `"descending"`, so the sorted column is exposed to assistive technologies. `data-value` gives a cell a value that sorts as it should, such as a time.
- **Select.** Each row's checkbox is named for its row. The head checkbox is mixed while only some rows are chosen, and choosing it ticks every row the filter shows, on every page. The count reads "1 of 12 selected". The block's own script listens for `tray:change` and wakes "Print the labels" when `detail.selected` is more than 0.
- **Pages.** The status reads "1–6 of 12". Previous and Next turn off at the ends, and when the one in focus turns off, focus moves to the other one.

The behaviour writes the counts and announces nothing, so the block gives both `role="status"`.

## On a phone

Below 56rem, 896 pixels at the default text size, the shell drops to one column and the sidebar leaves the page. A menu button in the top bar, `data-tray="sidebar-sheet"`, moves that same sidebar into a modal `<dialog>` from the start side, named "Main" after it. Focus moves in, Escape closes it and focus returns to the button, and following a link closes it too. The collapse button hides, since there is nothing beside the content to fold.

Below 48rem the top bar folds part by part. `tray-crumbs--fold` keeps only the current page of the breadcrumb, and `tray-topbar__search--fold` keeps only the search icon, which is why that button has an `aria-label`. The stat cards go two by two and the page header's buttons wrap under the title. The table keeps its 40rem and scrolls sideways inside its frame: 640 pixels of table in a frame 342 wide on a 390-pixel phone. The frame has `tabindex="0"`, so a keyboard can reach and scroll it, and `role="region"` with the table's heading as its name.

## Which block to start from

| Block | Start from it when |
| --- | --- |
| [Dashboard](#b-dashboard-01) | The first screen of a product: four figures, one chart, the latest records. |
| [Stat cards with a period switch](#b-stats-01) | People check the same figures every week; tabs switch the period. |
| [Stat cards over a season chart](#b-stats-02) | One series tells the story of the period. |
| [Breakdown by channel](#b-stats-03) | Parts of a whole: a donut, a table of shares, ranked bars. |
| [Table with filters and bulk actions](#b-table-01) | People tick rows and act on them together. |
| [Table with sortable columns and row menus](#b-table-02) | Records are looked up and acted on one at a time. |
| [Table with status tabs and a details sheet](#b-table-03) | The next step depends on the status of a record. |

## The dashboard in Tray UI

Open the [Dashboard](#b-dashboard-01) block to see it at desktop, tablet and phone width and copy its code. It needs the three files from [Installation](#d-installation); its paths assume it sits one folder below them. The behaviours start on their own when `bundle.js` loads, and `TrayUI.init(root)` starts them on markup added later.

Each part has its own page with the rules for writing it: [App Shell](#c-app-shell), [Sidebar](#c-sidebar), [Top Bar](#c-top-bar), [Page Header](#c-page-header), [Stat Card](#c-stat-card), [Chart](#c-chart) and [Data Table](#c-data-table). [Page layouts](#g-layouts) shows the shell beside the other frames a page can have.
