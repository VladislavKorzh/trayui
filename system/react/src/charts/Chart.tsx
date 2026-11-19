'use client';
import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from 'recharts';
import { useStaticMode } from '../lib/static';
import { ChartCenter, ChartContainer, ChartFigures, ChartTooltip, ChartTooltipContent, type ChartConfig, type ChartWalk } from './kit';

export type ChartType = 'bar' | 'line' | 'area' | 'donut' | 'radial' | 'radar';

/** One set of figures in a chart: its name in the legend and tooltip, and one value per label. */
export interface ChartSeries {
  /** The series' name: "Collected", "2026", "Bed A". */
  name: string;
  /** One number per label, in the same order. */
  values: number[];
}

export interface ChartProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /**
   * The form. Change over time: 'line' (a trend), 'area' (a volume), 'bar' (separate periods; `stacked` for parts of a whole over time; `horizontal` for a ranking).
   * Parts of a whole at one moment: 'donut', five parts at most. A single share or score: 'radial'. Several measures of one thing: 'radar', two series at most. Default 'bar'.
   */
  type?: ChartType;
  /** The categories along the axis, the segments of a donut, the rings of a radial, the spokes of a radar: ['Mar', 'Apr', 'May']. */
  labels: string[];
  /** One or more series. One series is drawn in ink (yellow on an ink card); two to four take the data colours in order, with a legend. A fifth is "Other", in hint grey. */
  series: ChartSeries[];
  /** Text set after every value: ' kg', '%'. Mind the space. */
  unit?: string;
  /** The top of the value scale. Default: a round number above the largest value (100 for a radial). */
  max?: number;
  /** Stacks the series of a bar or area chart, for parts of a whole over time. */
  stacked?: boolean;
  /** With type 'bar': a ranked list of horizontal bars, for one series. */
  horizontal?: boolean;
  /** Draws a line or area as steps, for values that hold until they change. */
  step?: boolean;
  /** The plot height in px. Default 192; a donut, radial or radar is a square 224px wide at most. */
  height?: number;
  /** 'peak' labels the highest value of a single series directly (the default); 'none' turns that off. Never a number on every point. */
  label?: 'peak' | 'none';
  /** Adds a "Show the figures" disclosure with the same figures as a table under the chart. Default true; turn it off for a donut, radial or ranking, which show their figures already. */
  table?: boolean;
  /** The sentence a screen reader hears for the chart. Write it: say what the chart shows and its extreme. "Bar chart of caviar collected by month. The most, 22 kg, came in May." */
  summary?: string;
  /** The head of the first column in the figures table: "Month". */
  labelHead?: string;
  /** The caption under the total in the middle of a donut. Default 'Total'. */
  totalLabel?: string;
  /** A BCP 47 tag for number formatting. Default 'en-GB'. */
  locale?: string;
  /** The chart's title, which states the subject: "Caviar collected by month". Set in `subtitle` type. */
  title?: React.ReactNode;
  /** One sentence under the title, in soft ink: the period, the source, what to notice. */
  caption?: React.ReactNode;
  /** Puts a donut or radial beside its key instead of above it, in a card wide enough for both. */
  side?: boolean;
}

type Row = Record<string, string | number>;

/** Even steps up to a given top of the scale: 0, 10, 20, 30 for 30; 0, 20 ... 100 for 100. */
function evenTicks(max: number): number[] {
  const nice = (step: number) => {
    const unit = step / Math.pow(10, Math.floor(Math.log10(step)));
    return [1, 2, 2.5, 5].some((n) => Math.abs(unit - n) < 1e-9);
  };
  const parts = [5, 4, 3, 2].find((n) => nice(max / n)) ?? 4;
  return Array.from({ length: parts + 1 }, (_, i) => (max / parts) * i);
}

const PARTS = 'var(--tray-ground)'; // the ring of ground colour that parts of a whole are set apart with
const FORMS: ChartType[] = ['bar', 'line', 'area', 'donut', 'radial', 'radar'];

/**
 * A chart from a list of labels and one or more series, drawn with Recharts: thin marks on a quiet frame, a tooltip, a key,
 * and the same figures as a table. Bar, line, area, donut, radial and radar. For anything else Recharts can draw,
 * compose it yourself inside `ChartContainer`.
 */
export const Chart = React.forwardRef<HTMLElement, ChartProps>(function Chart(
  { type = 'bar', labels, series, unit = '', max, stacked, horizontal, step, height, label = 'peak', table = true, summary, labelHead, totalLabel = 'Total', locale = 'en-GB', title, caption, side, className, ...rest },
  ref,
) {
  const nf = React.useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
  const val = (v: number) => nf.format(v) + unit;
  const mark = (v: number) => val(v).replace(/ /g, '\u00a0'); // a label in the plot never breaks between the figure and its unit
  const said = summary ?? `${type} chart. ` + series.map((s) => `${s.name}: ` + labels.map((l, i) => `${l} ${val(s.values[i] ?? 0)}`).join(', ')).join('. ');
  const first = series[0]?.values ?? [];
  /* A donut, and a radial with several rings, are parts named by the labels; everything else is series named by their own names. */
  const byLabel = type === 'donut' || (type === 'radial' && first.length > 1);

  /* Static mode: the figure the plain-HTML system draws its chart into (TrayUI.chart, from data-chart), from the same props.
     It refuses, with an error that says why, what TrayUI.chart would draw otherwise than Recharts does here, rather than
     write a chart that says something else. */
  if (useStaticMode()) {
    const refuse = (why: string): never => {
      throw new Error(`trayui-react/static: the chart${typeof title === 'string' ? ` "${title}"` : ''} cannot be rendered to static HTML: ${why}`);
    };
    if (!FORMS.includes(type)) refuse(`TrayUI.chart draws ${FORMS.join(', ')}, not "${String(type)}".`);
    if (!series.length) refuse('it has no series.');
    if (type === 'radial' && first.length > 3) refuse(`it is a radial chart of ${first.length} rings, and TrayUI.chart draws three at most.`);
    if (type === 'line' && stacked) refuse('it is a stacked line chart: TrayUI.chart would stack the lines, which are drawn unstacked here. Stack bars or areas, or leave stacked out.');
    for (const s of series)
      for (const v of s.values) {
        if (!Number.isFinite(v)) refuse(`the series "${s.name}" holds ${String(v)}, which is not a number.`);
        if (v < 0) refuse(`the series "${s.name}" holds ${v}: TrayUI.chart draws from zero up, and cannot draw a value below it.`);
      }
    const shown = table && !byLabel && !(type === 'bar' && horizontal); // where the figures table is drawn here
    const data = {
      type,
      labels,
      series: series.map((s) => ({ name: s.name, values: labels.map((_l, i) => s.values[i] ?? 0) })),
      unit: unit || undefined,
      max,
      stacked: stacked || undefined,
      horizontal: horizontal || undefined,
      step: step || undefined,
      height,
      label: label === 'none' ? 'none' : undefined,
      table: shown ? undefined : false,
      summary: said,
      labelHead,
      totalLabel: totalLabel === 'Total' ? undefined : totalLabel,
      locale: locale === 'en-GB' ? undefined : locale,
    };
    return (
      <figure
        ref={ref}
        className={['tray-chart', side && 'tray-chart--side', className].filter(Boolean).join(' ')}
        data-tray="chart"
        data-chart={JSON.stringify(data)}
        {...rest}
      >
        {title != null ? <figcaption className="tray-chart__title">{title}</figcaption> : null}
        {caption != null ? <p className="tray-chart__caption">{caption}</p> : null}
      </figure>
    );
  }

  const config: ChartConfig = {};
  if (byLabel) labels.forEach((l, i) => (config[`p${i}`] = { label: l }));
  else series.forEach((s, i) => (config[`s${i}`] = { label: s.name }));

  const rows: Row[] = byLabel
    ? labels.map((l, i) => ({ part: `p${i}`, label: l, value: first[i] ?? 0, fill: `var(--color-p${i})` }))
    : labels.map((l, i) => {
        const row: Row = { label: l, at: i };
        series.forEach((s, k) => (row[`s${k}`] = s.values[i] ?? 0));
        return row;
      });
  const one = series.length === 1;
  const peak = one && label === 'peak' ? first.indexOf(Math.max(...first)) : -1;
  /* Recharts leaves out the marks of empty values, so the peak is found by its row, not by its place among the marks. */
  const peakLabel =
    peak >= 0 ? <LabelList position="top" offset={8} valueAccessor={(entry) => ((entry.payload as Row | undefined)?.at === peak ? mark(first[peak]) : '')} /> : null;
  const tip = <ChartTooltip content={<ChartTooltipContent unit={unit} nameKey={byLabel ? 'part' : undefined} />} />;
  const scale = max != null ? ([0, max] as [number, number]) : undefined;
  const ticks = max != null ? evenTicks(max) : undefined;

  let plot: React.ReactElement;
  let round = false;
  let key: React.ReactNode = null;

  if (type === 'bar' && horizontal) {
    plot = (
      <BarChart accessibilityLayer={false} data={rows} layout="vertical" barSize={16} margin={{ right: 56 }}>
        <XAxis type="number" hide domain={scale} />
        <YAxis type="category" dataKey="label" width="auto" tick={{ className: 'tray-chart__name' }} />
        {tip}
        <Bar dataKey="s0" fill="var(--color-s0)" radius={4}>
          <LabelList position="right" offset={12} formatter={(v: unknown) => (typeof v === 'number' ? mark(v) : '')} />
        </Bar>
      </BarChart>
    );
  } else if (type === 'bar') {
    plot = (
      <BarChart accessibilityLayer={false} data={rows} maxBarSize={24} barGap={2} margin={{ top: peak >= 0 ? 24 : 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" />
        <YAxis width="auto" domain={scale} ticks={ticks} unit={unit} />
        {tip}
        {series.map((_s, k) => (
          <Bar key={k} dataKey={`s${k}`} fill={`var(--color-s${k})`} {...(stacked ? { stackId: 'a', radius: 4, stroke: PARTS, strokeWidth: 2 } : { radius: [4, 4, 0, 0] as [number, number, number, number] })}>
            {k === 0 ? peakLabel : null}
          </Bar>
        ))}
      </BarChart>
    );
  } else if (type === 'line') {
    plot = (
      <LineChart accessibilityLayer={false} data={rows} margin={{ top: peak >= 0 ? 24 : 8, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" padding={{ left: 12, right: 12 }} />
        <YAxis width="auto" domain={scale} ticks={ticks} unit={unit} />
        {tip}
        {series.map((_s, k) => (
          <Line key={k} dataKey={`s${k}`} type={step ? 'step' : 'linear'} stroke={`var(--color-s${k})`} dot={false} activeDot={{ r: 5 }}>
            {k === 0 ? peakLabel : null}
          </Line>
        ))}
      </LineChart>
    );
  } else if (type === 'area') {
    plot = (
      <AreaChart accessibilityLayer={false} data={rows} margin={{ top: peak >= 0 ? 24 : 8, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" padding={{ left: 12, right: 12 }} />
        <YAxis width="auto" domain={scale} ticks={ticks} unit={unit} />
        {tip}
        {series.map((_s, k) => (
          <Area key={k} dataKey={`s${k}`} type={step ? 'step' : 'linear'} stackId={stacked ? 'a' : undefined} fill={`var(--color-s${k})`} stroke={`var(--color-s${k})`} activeDot={{ r: 5 }}>
            {k === 0 ? peakLabel : null}
          </Area>
        ))}
      </AreaChart>
    );
  } else if (type === 'radar') {
    round = true;
    plot = (
      <RadarChart accessibilityLayer={false} data={rows} outerRadius="72%">
        <PolarGrid />
        <PolarAngleAxis dataKey="label" />
        <PolarRadiusAxis domain={scale} tick={false} axisLine={false} />
        {tip}
        {series.map((_s, k) => (
          <Radar key={k} dataKey={`s${k}`} fill={`var(--color-s${k})`} stroke={`var(--color-s${k})`} />
        ))}
      </RadarChart>
    );
  } else {
    round = true;
    const total = first.reduce((a, v) => a + v, 0);
    if (type === 'donut') {
      plot = (
        <PieChart accessibilityLayer={false}>
          {tip}
          <Pie data={rows} dataKey="value" nameKey="part" innerRadius="82%" outerRadius="100%" startAngle={90} endAngle={-270} rootTabIndex={-1}>
            <ChartCenter value={val(total)} label={totalLabel} />
          </Pie>
        </PieChart>
      );
    } else {
      const rings = first.length;
      const ring = rings > 1 ? rows : [{ label: labels[0] ?? '', value: first[0] ?? 0, fill: 'var(--color-s0)' }];
      plot = (
        <RadialBarChart accessibilityLayer={false} data={ring} innerRadius={rings > 1 ? '38%' : '86%'} outerRadius="100%" startAngle={90} endAngle={-270} barCategoryGap={rings > 1 ? 4 : 0}>
          <PolarAngleAxis type="number" domain={[0, max ?? 100]} tick={false} axisLine={false} />
          <PolarRadiusAxis type="category" dataKey="label" tick={false} axisLine={false}>
            {rings === 1 ? <ChartCenter value={val(first[0] ?? 0)} label={labels[0]} /> : null}
          </PolarRadiusAxis>
          {rings > 1 ? tip : null}
          <RadialBar dataKey="value" background cornerRadius={99} />
        </RadialBarChart>
      );
    }
    if (type === 'donut' || first.length > 1) {
      key = (
        <table className="tray-chart__key">
          <tbody>
            {labels.map((l, i) => (
              <tr key={i}>
                <th scope="row">
                  <span className="tray-swatch" style={{ '--tray-c': `var(--color-p${i})` } as React.CSSProperties} />
                  {l}
                </th>
                <td>{val(first[i] ?? 0)}</td>
                {type === 'donut' ? <td>{total ? Math.round(((first[i] ?? 0) / total) * 100) : 0}%</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  }

  const figures = table && !byLabel && !(type === 'bar' && horizontal) ? <ChartFigures data={rows} labelKey="label" labelHead={labelHead} unit={unit} /> : null;
  /* The keys walk the labels (or the parts of a donut), each said in words, as the plain-HTML chart says them. */
  const sum = first.reduce((a, v) => a + v, 0);
  const single = type === 'radial' && !byLabel;
  const walk: ChartWalk = {
    count: single ? Math.min(1, labels.length) : labels.length,
    say: (i) =>
      byLabel
        ? `${labels[i]}: ${val(first[i] ?? 0)}` + (type === 'donut' ? `, ${sum ? Math.round(((first[i] ?? 0) / sum) * 100) : 0}%` : '')
        : `${labels[i]}: ` + (one ? val(first[i] ?? 0) : series.map((s) => `${s.name} ${val(s.values[i] ?? 0)}`).join(', ')),
    start: peak >= 0 ? peak : undefined,
    wrap: round,
  };
  return (
    <ChartContainer
      ref={ref}
      config={config}
      title={title}
      caption={caption}
      summary={said}
      height={height ?? (type === 'bar' && horizontal ? labels.length * 40 : undefined)}
      round={round}
      walk={walk}
      legend={!byLabel && series.length > 1}
      locale={locale}
      className={[side && 'tray-chart--side', className].filter(Boolean).join(' ') || undefined}
      footer={
        key || figures ? (
          <>
            {key}
            {figures}
          </>
        ) : undefined
      }
      {...rest}
    >
      {plot}
    </ChartContainer>
  );
});
Chart.displayName = 'Chart';
