# Accessible charts: keyboard, key and table

A chart in HTML that everyone can read: a name and a summary, a key that does not rest on colour, the figures as a table, arrow keys and colours at 3:1.

## What WCAG asks of a chart

A chart is a picture of numbers, and four success criteria of WCAG 2.2 apply to it.

- [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) (level A) asks for a text alternative. Its Understanding document gives a chart a short name and a longer description that "identifies the type of chart, provides a high-level summary of the data", and adds: "Where possible and practical, the actual data is provided in a table."
- [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (level A): colour is not "the only visual means of conveying information".
- [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (level AA): the parts of a graphic needed to understand it reach 3:1 against the colours next to them.
- [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (level A) and [1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) (level AA) cover the tooltip: all functionality works from a keyboard, and what appears on hover or focus can be dismissed and stays while it is wanted.

Each part below is a short version you can write yourself, next to what Tray UI's [Chart](#c-chart) does. The Chart draws bar, line, area, donut, radial and radar charts in plain HTML, CSS and SVG.

## A name and a summary

Wrap the chart in a `<figure>` with a `<figcaption>` that states the subject: "Caviar collected by month". MDN says the caption gives the figure its accessible name, but the HTML Accessibility API Mappings disagree: "A figcaption does not take part in the accessible name or accessible description computation unless explicitly referenced by an author." Chrome 157 follows the mappings: in its accessibility tree a figure with a caption and no `aria-labelledby` has an empty name. Point `aria-labelledby` at the caption, and the figure is named in both readings.

The drawing itself takes `role="img"` and a name. MDN's page on the role says what that does: browsers give every descendant of an `img` the role `presentation`, and "most screen readers will consider the element with `role="img"` set on it to be like a black box". The axis labels and the figure printed on a bar stay inside the box. The name has to carry the point.

Write it as the Understanding document describes: the form, the subject and its period, and the extreme. Tray UI's preview of a bar chart says "Bar chart of caviar collected by month in 2026. Nothing in January, February and December; the most, 22 kilograms, in May." When the `summary` option is missing, Tray UI makes one from every value, `bar chart. Collected: Mar 6 kg, Apr 14 kg, May 22 kg`, which for twelve months of two series is a list of 24 figures.

Here is the markup of a small chart that has every part this article describes:

```html
<figure class="chart" aria-labelledby="harvest-title">
  <figcaption id="harvest-title">Caviar collected by month</figcaption>
  <div class="plot">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" tabindex="0"
         aria-label="Bar chart of caviar collected by month. The most, 22 kg, came in May."></svg>
    <div class="tip" aria-hidden="true" hidden></div>
  </div>
  <p class="visually-hidden" aria-live="polite"></p>
  <details>
    <summary>Show the figures</summary>
    <table>
      <thead><tr><th scope="col">Month</th><th scope="col">Collected</th></tr></thead>
      <tbody></tbody>
    </table>
  </details>
</figure>
```

The tooltip is `aria-hidden`, since the live region says the same words; both are explained under the keyboard below.

## A key that does not rest on colour

A chart of one series needs no key: its title names what it shows. Tray UI draws a single series in `ink`, never in a data colour, and in the accent on an ink card. Black bars on a light card need no matching.

Several series take the four data colours in order, and the chart gets a key in words. Tray UI writes it as a real list under the plot, the name in `ink-soft` beside a 12px swatch:

```html
<ul class="tray-chart__legend">
  <li><span class="tray-swatch" style="--tray-c:var(--tray-s1)"></span>2026</li>
  <li><span class="tray-swatch" style="--tray-c:var(--tray-s2)"></span>2025</li>
</ul>
```

Text is never set in a series colour; the swatch carries the identity. A key still asks the eye to match two colours, and among WCAG's sufficient techniques for colour in an image are G111, "Using color and pattern", and G14, "Ensuring that information conveyed by color differences is also available in text". Tray UI leans on text:

- **The tooltip** names every series at a point, each with its swatch and its value.
- **The extreme** of a single series is labelled on the chart: "22 kg" above the May bar. Never a number on every point.
- **A donut's key** is a table of names, values and shares, so the slices are never the only record.

A line style works where text would crowd. The React example "This season against the last" draws 2026 as a solid ink line and 2025 as a dashed line in `ink-hint`: two series told apart by pattern and by shade, and named in its caption.

## Colours that pass 3:1

1.4.11 applies to "parts of graphics required to understand the content", measured "against adjacent color(s)". Its Understanding document says the lines of a graph "should have 3:1 contrast against their background", but "do not need to contrast with each other". It also lists when a graphic is not required for understanding: when "a graphic with text embedded or overlaid conveys the same information, such as labels and values on a chart", and when "the information is available in another form, such as in a table that follows the graph".

Measure against the ground the chart sits on. In Tray UI that is usually a card, filled with `surface`, and these are the contrasts of the data colours with the WCAG formula:

| Token | Light, on the page | Light, on a card | Dark, on the page | Dark, on a card |
| --- | --- | --- | --- | --- |
| `data-1` | 5.39:1 | 4.86:1 | 5.19:1 | 4.59:1 |
| `data-2` | 3.20:1 | 2.88:1 | 4.90:1 | 4.33:1 |
| `data-3` | 2.82:1 | 2.54:1 | 6.06:1 | 5.36:1 |
| `data-4` | 2.17:1 | 1.95:1 | 6.13:1 | 5.42:1 |
| `ink` | 18.42:1 | 16.60:1 | 17.03:1 | 15.05:1 |

In the light theme two of the four fall under 3:1 on the white page, and three on a card. Tray UI does not darken them; it takes the exceptions instead: every chart with several series has a key, a tooltip and a table of the same figures. A single series in `ink` passes everywhere. [Generate an accessible colour theme from four colours](#a-colour-theme-from-four-colours) has the contrast function in JavaScript.

Parts of a whole are set apart by the ground: a 2px gap between the parts of a stacked bar, a small gap between the segments of a donut. Each part then borders the ground alone.

In forced colours mode the browser replaces the page's colours with the person's own. Tray UI sets `forced-color-adjust: none` on the bars, lines and swatches, so each series keeps its colour and still matches its swatch, and a single series takes `CanvasText`.

## The figures as a table

A table under the chart gives every figure in words, for anyone who cannot see the drawing or tell its colours apart. It is the second exception of 1.4.11 as well. Write it as a data table: `<th scope="col">` for the series, `<th scope="row">` for each category, so each value is tied to its month and its series ([1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)).

A `<details>` element keeps it one click or key press away and needs no script. Tray UI puts a "Show the figures" disclosure under every chart; `labelHead` names the first column, and `table: false` leaves it out. A donut, a radial chart and a ranking of horizontal bars show their figures already, in the key, the middle of the ring and beside each bar, and Tray UI's own examples turn the table off for them.

## Arrow keys and the tooltip

A tooltip that appears only under the pointer leaves the keyboard without the figures. Make the plot a stop for Tab with `tabindex="0"`, and let the arrow keys move the tooltip. These are the keys of Tray UI's bar, line and area charts:

| Key | What happens |
| --- | --- |
| ArrowRight, ArrowLeft | The next or the previous point. The first press shows the labelled peak, or the first point. The two arrows swap under `dir="rtl"`. |
| Home, End | The first or the last point. |
| Escape | Hides the tooltip; focus stays on the plot. |

On a donut or a radar all four arrows walk the segments or the spokes, and wrap at the ends. A radial chart and a ranking take focus too, so Tab reaches their summary, and have nothing to walk.

What the keys reach has to be said as well. A live region inside the `role="img"` would be presentational with the rest of its children, so Tray UI puts it in the figure, beside the drawing, empty from the start. Only a key fills it; the pointer moves the tooltip and fills nothing. [Toast notifications that screen readers announce](#a-toast-notifications-screen-readers) explains why the region has to be in the page before its words.

The script for the markup above:

```js
const data = [['Mar', 6], ['Apr', 14], ['May', 22], ['Jun', 19], ['Jul', 9]];
const fig = document.querySelector('.chart');
const svg = fig.querySelector('svg'), tip = fig.querySelector('.tip');
const live = fig.querySelector('[aria-live]');
const n = data.length, max = 25;
let active = null;

svg.innerHTML = data.map(([, v], i) =>
  `<rect x="${(i + 0.3) * 100 / n}" y="${100 - v / max * 100}" width="${40 / n}" height="${v / max * 100}"/>`).join('');
fig.querySelector('tbody').innerHTML = data.map(([label, v]) =>
  `<tr><th scope="row">${label}</th><td>${v} kg</td></tr>`).join('');

function show(i, say) {
  active = i;
  tip.hidden = i === null;
  if (i === null) return;
  const [label, v] = data[i];
  tip.textContent = `${label}, ${v} kg`;
  tip.style.left = `${(i + 0.5) * 100 / n}%`;
  if (say) live.textContent = `${label}: ${v} kg`;
}

svg.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') return show(null);
  const to = { ArrowLeft: (active ?? 1) - 1, ArrowRight: (active ?? -1) + 1, Home: 0, End: n - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  show(Math.min(n - 1, Math.max(0, to)), true);
});
svg.addEventListener('pointermove', (e) => {
  const box = svg.getBoundingClientRect();
  show(Math.min(n - 1, Math.floor((e.clientX - box.left) / box.width * n)));
});
svg.addEventListener('pointerleave', () => show(null));
svg.addEventListener('blur', () => show(null));
```

```css
.plot { position: relative; }
.plot svg { display: block; width: 100%; height: 10rem; }
.plot svg:focus-visible { outline: 3px solid #141414; outline-offset: 6px; }
.tip { position: absolute; top: 0; translate: -50% 0; padding: 4px 8px; border-radius: 6px;
       background: #141414; color: #fff; white-space: nowrap; pointer-events: none; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden;
                   clip-path: inset(50%); white-space: nowrap; }
```

Against 1.4.13: Escape dismisses the tooltip without moving focus or the pointer, and it stays until the pointer leaves the plot or focus moves on. It has `pointer-events: none`, so a pointer moved onto it is still over the plot: the tooltip stays, showing the column underneath. Tray UI listens to `pointerdown` as well, so on a touch screen the tooltip shows while a finger rests on the plot, and goes when it lifts.

## Charts in Tray UI

Write the figure and its caption, then call the script:

```html
<figure class="tray-chart" id="harvest" aria-labelledby="harvest-title">
  <figcaption class="tray-chart__title" id="harvest-title">Caviar collected by month</figcaption>
</figure>
<script>
  TrayUI.chart(document.getElementById('harvest'), {
    type: 'bar', unit: ' kg', labelHead: 'Month',
    labels: ['Mar', 'Apr', 'May'],
    series: [{ name: 'Collected', values: [6, 14, 22] }],
    summary: 'Bar chart of caviar collected by month. The most, 22 kg, came in May.'
  });
</script>
```

The script draws the plot as a `role="img"` named by the `summary`, makes it a stop for Tab, adds the live region, the key for several series and the "Show the figures" table, and labels the peak. The same object can sit as JSON in `data-chart`, with `data-tray="chart"`. The script does not name the figure: add the `aria-labelledby` yourself, as above.

In React, `Chart` and `ChartContainer` from `trayui-react/charts` draw with Recharts in the same frame. `summary` names a group around the plot. Recharts' `accessibilityLayer`, on by default, makes its drawing a stop for Tab: focus shows the first point, ArrowLeft and ArrowRight move the tooltip, and Escape hides it. No live region follows the tooltip there, so the key and the table matter more: `Chart` adds both by itself, and with `ChartContainer` you pass `legend` and `footer={<ChartFigures data={data} labelKey="month" />}`.

The [Chart](#c-chart) page has every form and option, [Using the charts](#ch-use) the React parts, and [Accessibility](#g-accessibility) the rules every component follows. Nothing here was tested with a screen reader: the behaviour above was checked in Chrome and its accessibility tree.
