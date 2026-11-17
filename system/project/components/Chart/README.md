# Chart

A chart turns figures into thin marks on a quiet frame: a value axis in `tick` type, hairline gridlines, a strong baseline, a tooltip, and the same figures as a table.

## Markup
```html
<figure class="tray-chart" id="harvest">
  <figcaption class="tray-chart__title">Caviar collected by month</figcaption>
</figure>
<script>
  TrayUI.chart(document.getElementById('harvest'), {
    type: 'bar', unit: ' kg',
    labels: ['Mar', 'Apr', 'May'],
    series: [{ name: 'Collected', values: [6, 14, 22] }],
    summary: 'Bar chart of caviar collected by month. The most, 22 kg, came in May.'
  });
</script>
```
Or put the same object as JSON in `data-chart` and add `data-tray="chart"`.

| Option | Values |
| --- | --- |
| `type` | `bar`, `line`, `area`, `donut`, `radial`, `radar` |
| `labels`, `series` | The categories, and one or more `{ name, values }` |
| `unit` | Text set after every value: `' kg'`, `'%'` |
| `stacked` | Stack the series of a bar or area chart |
| `horizontal` | A ranked list of bars, for one series |
| `step` | Draw a line or area as steps |
| `max`, `height` | The top of the scale; the plot height in px |
| `label` | `'peak'` (default) labels the extreme of a single series; `'none'` turns that off |
| `table` | `false` leaves out the "Show the figures" table |
| `summary` | The sentence a screen reader hears for the chart. Write it: say what the chart shows. |

## Colour
- One series is drawn in `ink`, or in `accent` on an ink card. A single series never takes a data colour (the Entity Colour Rule).
- Several series take `data-1` to `data-4` in that order. A colour belongs to its series; filtering one out must not repaint the others. A fifth series is "Other", in `ink-hint`.
- Text is never set in a series colour. Values, labels and legends stay in ink; a swatch beside them carries the identity.
- Two of the four data colours are below 3:1 on light grounds, so every chart with several series has a legend, a tooltip and a table view.

## Marks
Bars are 24px wide at most, with 4px top corners and a 2px gap between neighbours. Lines are 2px. Areas are the line plus a 14% fill. Donut segments are separated by a small gap. Nothing is outlined or shadowed, and there is never a second value axis: two measures of different scale go in two charts.

## Interaction
Pointing at the plot shows a crosshair or a highlighted column and a tooltip with every series at that point. On a donut the centre shows the segment pointed at.

## Choosing the form
- Change over time: line (trend), area (volume), bar (separate periods).
- Parts of a whole: stacked bar over time; donut for one moment and at most five parts.
- A single share or score: radial, or just a Figure in a card.
- Ranking: horizontal bars.
- Several measures of one thing: radar, two series at most.

## In React
The React package draws its charts with Recharts instead of this script, in the same frame and with the same rules: `Chart` takes the options above as props, and `ChartContainer` frames any Recharts chart. Both come from `trayui-react/charts`.

## Accessibility
- The figure is named by its `figcaption`, and the drawing is `role="img"` named by the `summary`. Write the summary: without it a screen reader hears a long list of every value, made up by the script.
- The plot of a bar, line or area chart takes focus: `ArrowLeft` and `ArrowRight` move through the points, `Home` and `End` jump to the ends, `Escape` clears, and the tooltip shows the values at that point. On a donut or a radar the arrow keys walk the segments or the spokes, and the centre or the tooltip shows the one in focus.
- A radial chart and horizontal bars do not take focus, so their `summary` is all a screen reader hears of them: put every figure in it.
- Colour never names a series alone: several series come with a legend, a donut with a key table, and "Show the figures" opens a real table with scoped heads. Set `labelHead` to name its first column.

## Do and don't
- Do label the extreme directly and leave the rest to the tooltip; never a number on every point.
- Do give every chart a title that states the subject and a `summary`.
- Don't use a pie for more than five parts, a rainbow, a gradient, or 3D.
- Don't use data colours anywhere outside a chart.
