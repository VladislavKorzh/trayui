# Charts

58 charts for React, drawn with Recharts in the style of the system: area, bar, line, pie, radar and radial, in every theme.

## [Area charts](https://trayui.com/charts/area.md)

A volume over time: a 2px line over a quiet fill. One series is ink; several take the data colours and a key.

- Interactive: A period switch in the head of the card.
- Default: One series, straight segments.
- Smooth: A curve through the points.
- Step: For a value that holds until it changes.
- Value axis: With amounts along the side.
- Peak labelled: The extreme named in the plot.
- Stacked: Parts of a whole over time.
- Stacked to 100%: Shares instead of amounts.
- On an ink card: A single series turns yellow.

## [Bar charts](https://trayui.com/charts/bar.md)

Separate periods, rankings and parts of a whole: bars 24px wide at most, with 4px corners at the end that carries the value.

- Interactive: A channel switch in the head of the card.
- Default: One series.
- Peak labelled: A value axis, and the extreme named.
- Ranking: Horizontal bars, sorted, every value written.
- Two series: Side by side, 2px apart.
- Stacked: Parts of a whole, set apart by a gap.
- Negative values: Bars grow from zero in both directions.
- One bar picked out: The subject in ink, the rest as context.
- With a plan line: A dashed reference line.

## [Line charts](https://trayui.com/charts/line.md)

A trend: 2px lines, no dots unless each reading matters. Never a second value axis.

- Default: One series, straight segments.
- Smooth: A curve through the points.
- Step: For a count that holds until it changes.
- Two series: The first two data colours and a key.
- Dots: A dot on each reading.
- Peak labelled: The extreme named in the plot.
- Dashed comparison: The subject in ink, last season dashed in grey.
- Value axis: With amounts along the side.

## [Pie charts](https://trayui.com/charts/pie.md)

Parts of a whole at one moment, five at most, clockwise from the top and set apart by a gap.

- Pie: Whole slices and a key.
- Donut: A thin ring with the total in the middle.
- Labelled: A value beside each part.
- Active part: The middle names the part under the pointer.
- Half ring: One share of a whole.

## [Radar charts](https://trayui.com/charts/radar.md)

Several measures of one thing, on a hairline web. Two series at most.

- Default: One series, in ink.
- Dots: A dot on each score.
- Two series: Two shapes and a key.
- Outlines: No fill, where shapes cover each other.
- Round grid: Rings instead of a web.

## [Radial charts](https://trayui.com/charts/radial.md)

A single share or score as a ring on a track, with its figure in the middle.

- Default: One share and its figure.
- On the yellow card: The ring stays ink.
- Rings: A ring for each of a few things.
- Gauge: Half a ring from empty to full.
- Stacked: Two parts of one total.

## [Tooltips](https://trayui.com/charts/tooltip.md)

What the tooltip can say. Each is shown open; point at another bar to move it.

- Default: The category, then each series with its swatch.
- Line mark: A line instead of a swatch.
- No mark: Names and values alone.
- No first line: Without the category.
- Own first line: The category written by a formatter.
- Unit: A unit after every value.
- Formatter: Each value written by hand.
- Total: A last row sums the series.
- No highlight: Without the column highlight.

## [The Chart component](https://trayui.com/charts/chart-component.md)

One component for the six usual forms: give it labels and series, and it composes the chart, its key and its table of figures.

- Bars: type="bar", with the peak labelled.
- Area on ink: type="area" in an ink card.
- Two lines: type="line" with two series.
- Stacked bars: type="bar" stacked.
- Donut and its key: type="donut" side: the key sits beside the ring when the card has room.
- Radial: type="radial".
- Ranking: type="bar" horizontal.
- Radar: type="radar" with two series.
