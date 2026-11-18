# Print styles for a web app with @media print

A print stylesheet for a web app: the light theme on paper, the navigation left out, link addresses, page breaks, tables, and the fills that must still print.

## What printing does to a page

When someone prints, the browser lays the page out again for the sheet and applies the rules inside `@media print`. An invoice or an order often ends up on paper or in a PDF, and an app made for the screen meets four problems on the way.

- **Backgrounds are left out.** The [print-color-adjust](https://developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust) property is `economy` by default, which lets the browser drop backgrounds to save ink. Chrome's print dialog has a Background graphics setting under More settings; with it off, no background colour or image prints unless the page asks for it, as shown below. MDN's compatibility notes add that Chrome and Safari never print the background of `<body>`.
- **Light text turns grey.** MDN's example of what `economy` allows is darker text for white paper. Tested in Chrome with Background graphics off, the near-white text of a dark theme printed as a faint grey on white.
- **A scrolling box prints what fits.** A list in a box with `max-block-size` and `overflow: auto` prints the rows inside its height, and the rest is cut off.
- **The screen's furniture comes along.** The sidebar, the toolbar, a toast and any open menu print where they were. In Chrome a `position: fixed` bar prints on every sheet.

A print stylesheet answers each of these. It is short, and it lives at the end of the CSS, inside one `@media print` block, or in several, beside the components they change.

## The light theme on paper

When the colours are custom properties, print is one more theme. Set every colour token to its light value:

```css
@media print {
  :root:root, [data-theme][data-theme] {
    color-scheme: light;
    --page: #ffffff;
    --surface: #f4f3f0;
    --ink: #141414;
    --ink-soft: #4a4a46;
    --rule-strong: #b5b3ac;
  }
}
```

The doubled selectors are there for specificity. `:root:root` and `[data-theme][data-theme]` each count as two classes, so they beat `[data-theme="dark"]`, which counts as one, wherever the theme rule stands in the cascade. That includes a theme stylesheet linked after yours. `color-scheme: light` turns the browser's own parts light too, such as form controls. Set every colour token in this rule: a token left out keeps its dark value, and whatever is drawn with it prints in the dark theme's colour.

## Leave the screen's furniture out

Nothing on paper can be pressed, so the navigation, the toolbars, toasts, tooltips and open menus go. The layout around them unwinds, and scrolling boxes give up their height.

```css
.print-only { display: none; }

@media print {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .sidebar, .toasts, .no-print { display: none !important; }
  .print-only { display: revert; }
  .app { display: block; padding: 0; }
  .table-wrap { max-block-size: none; overflow: visible; }
}
```

- `!important` on `display: none` wins over a component rule that sets `display` with a more specific selector.
- `.no-print` keeps anything else off paper: an Export button, a filter bar, a search field.
- `.print-only` shows what only paper needs, such as the date and the account the page was printed from. `display: revert` rolls `display` back to the browser's own value for the element, `block` for a paragraph.
- The app's grid of a sidebar and a main column becomes a single block, so the main column takes the width of the sheet.
- Animations and transitions are switched off, so each thing prints in its settled state.

## Edges where fills were

With backgrounds left out, a card drawn as a fill disappears, and so does a status badge. Give the card an edge. A fill that carries meaning, such as a badge, a bar of a chart or a meter, can ask to print as it is:

```css
@media print {
  .card { border: 1px solid var(--rule-strong); }
  .status { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

`exact` asks the browser to change nothing about the element's colours. Tested in Chrome, the badges printed filled with Background graphics off. MDN warns that the person's own print options may take priority, so let the words carry the meaning and the fill help.

`exact` keeps the text colour too, and the property is inherited. Set it where the fill is. White text on a dark `<body>` background, with `exact` on the text alone, printed in Chrome as white on white: the text kept its colour and the body lost its background. The same happens when the fill is drawn by a separate element, such as a pill that slides behind the chosen tab of a strip. Give that element `exact` as well, or the chosen tab's light text prints on nothing.

## Links say where they go

On paper a link cannot be followed, so write its address after it:

```css
@media print {
  main a[href^="http"]::after {
    content: " (" attr(href) ")";
    color: var(--ink-soft);
    overflow-wrap: anywhere;
  }
}
```

The selector takes links written with a full address, inside the main content. A link within the app, such as `#faq` or a relative path, gets nothing, and neither does the navigation. `overflow-wrap: anywhere` lets a long address break instead of running off the sheet.

## Page breaks

```css
@media print {
  @page { margin: 16mm; }
  h1, h2, h3 { break-after: avoid; }
  .card, figure, tr { break-inside: avoid; }
}
```

- `break-inside: avoid` keeps a card, a figure or a table row on one sheet. A box taller than a sheet still breaks.
- `break-after: avoid` keeps a heading with what follows it. Tested in Chrome, a heading that would have ended a sheet moved to the next one with its paragraph. MDN's compatibility data says Firefox and Safari recognise the value but it has no effect there.
- `break-before: page` starts something on a new sheet, such as each invoice in a batch.
- `@page { margin }` sets the margins of every sheet.

## Tables

Write the header row in `<thead>`: Chrome repeats the `<thead>` at the top of every sheet the table runs onto. Tested with 39 rows, the table ran onto three A4 sheets, and the second and the third began with the header row. With `tr { break-inside: avoid }`, no row is split between two sheets. Lift any height limit and overflow on the table's wrapper, as above, so every row prints.

Put together, the rules above turned a dark page with a sidebar, a card, a table of status badges and a toast into three light A4 sheets in Chrome. The sidebar and the toast were gone, the card had its edge, the badges kept their fill, the link showed its address, and each sheet of the table began with its header row.

## Check it

- **DevTools.** In Chrome's Rendering tab, "Emulate CSS media type" set to `print` shows the print rules on screen. It does not split pages or leave out backgrounds.
- **Print preview.** Look at it twice, with Background graphics on and off. Off is Chrome's default.
- **Playwright.** `page.pdf(print_background=False)` prints as Chrome does with Background graphics off, and `page.emulate_media(media="print")` lets a test read the print styles with `getComputedStyle`.

Print the dark theme, the longest table, and a page with a menu open.

## Print in Tray UI

Tray UI's print rules follow the same plan, in two places. `tokens.css` holds the theme: inside `@media print`, `:root:root, [data-theme][data-theme]` sets `color-scheme: light`, the 30 colour tokens that differ between themes and the shadow to the values of the Light theme. Every theme prints as Light. Tested, a Linen page printed with Light's white page and yellow accent, and so did a theme of your own, written as the [Themes](#d-themes) page writes it.

The rest is in `95-modes.css`. Animations and transitions are off. The app's sidebar and menu, toasts, tooltips, open menus and popovers, the tour, a fixed cookie banner and closed dialogs stay off paper. The app becomes a block, a sticky top bar stops sticking, and scrolling boxes, table wraps and tab strips show all they hold. Trays, fields and quiet controls get a 1px `rule-strong` edge, and the edge of a button is `ink`. The ink card, a dark button, a pressed toggle, checkboxes, switches, meters, badges and charts keep their fills with `print-color-adjust: exact`. Cards, stats, alerts and table rows do not break across sheets, and headings stay with what follows them.

```css
@media print {
  .tray-prose a[href^="http"]::after { content: " (" attr(href) ")"; color: var(--ink-soft); font-size: .875em; overflow-wrap: anywhere; }
  .tray-card, .tray-stat, .tray-alert, .tray-banner, .tray-item, .tray-chart, figure, tr { break-inside: avoid; }
  h1, h2, h3, h4, .title, .subtitle, .headline { break-after: avoid; }
}
```

Two classes are for your own markup. `tray-noprint` keeps a thing off paper, and `tray-print-only` shows a thing on paper alone:

```html
<button class="tray-btn tray-btn--quiet tray-noprint" type="button">Export</button>
<p class="tray-print-only tray-muted">Printed from the orders page.</p>
```

The [Accessibility](#g-accessibility) guide describes print beside more contrast and forced colours, and the [App Shell](#c-app-shell) and [Table](#c-table) pages show the layout and the tables these rules unwind. Forced colours take fills away on screen in the same way, and [Forced colours mode](#a-forced-colors-mode) draws the edges for that case.
