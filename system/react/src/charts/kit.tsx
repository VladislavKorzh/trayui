'use client';
import * as React from 'react';
import { Label, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import type { LegendProps, TooltipProps } from 'recharts';
import { useStaticMode } from '../lib/static';

function cx(...parts: (string | false | null | undefined)[]): string | undefined {
  return parts.filter(Boolean).join(' ') || undefined;
}

/** A name that is safe inside a custom property: `farm shop` becomes `farm-shop`. */
function safe(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, '-');
}

/**
 * What a chart draws, by data key: the name shown in the legend, the tooltip and the table of figures, and, rarely, a colour.
 * The order of the keys is the order of the data colours.
 */
export type ChartConfig = Record<
  string,
  {
    /** The name people read: "Collected", "2026", "Farm shop". */
    label?: React.ReactNode;
    /** A colour of its own, as any CSS colour: 'var(--ink-hint)' for "Other". Leave it out and the series takes its turn in the data colours. */
    color?: string;
  }
>;

interface ChartContextValue {
  config: ChartConfig;
  locale: string;
  /** The point the keyboard is on, when the chart is walked (`walk`): the tooltip shows it. */
  active?: number;
}

/**
 * What the arrow keys walk in a chart: one stop for Tab, the drawing, whose points the keys move through, each said by a
 * polite live region beside the drawing. `Chart` sets it up for itself.
 */
export interface ChartWalk {
  /** How many points there are: the labels, or the segments of a donut. */
  count: number;
  /** What a point says, in words: "May: 22 kg", "Mar: 2026 6 kg, 2025 5 kg", "Jars: 57 kg, 55%". */
  say: (index: number) => string;
  /** The point the first press of an arrow reaches, such as the labelled peak. Default the first (the last for ArrowLeft and End). */
  start?: number;
  /** Goes round from the last point to the first and back, as on a donut. Default false: the keys stop at either end. */
  wrap?: boolean;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

/** The config of the chart around the caller: for a tooltip, a legend or a label written by hand. */
export function useChart(): ChartContextValue {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error('useChart must be used inside a <ChartContainer>');
  return context;
}

function nameOf(config: ChartConfig, ...keys: unknown[]): React.ReactNode {
  for (const key of keys) {
    if (typeof key === 'string' && config[key]?.label != null) return config[key].label;
  }
  const last = keys.filter((k) => typeof k === 'string' || typeof k === 'number').pop();
  return last == null ? '' : String(last);
}

/** Puts tooltip and legend items in the order of the config, whatever order the library hands them in. */
function inOrder<T>(items: readonly T[], config: ChartConfig, keyOf: (item: T) => unknown): T[] {
  const order = Object.keys(config);
  const at = (item: T) => {
    const i = order.indexOf(String(keyOf(item)));
    return i < 0 ? order.length : i;
  };
  return items.map((item, i) => [item, i] as const).sort((a, b) => at(a[0]) - at(b[0]) || a[1] - b[1]).map((pair) => pair[0]);
}

export interface ChartContainerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /** The series or segments by data key. Each becomes a custom property the marks use: `fill="var(--color-collected)"`. */
  config: ChartConfig;
  /** The chart's title, which states the subject: "Caviar collected by month". Set in `subtitle` type. */
  title?: React.ReactNode;
  /** One sentence under the title, in soft ink: the period, the source, what to notice. */
  caption?: React.ReactNode;
  /** The sentence a screen reader hears for the chart. Write it: say what the chart shows and its extreme. */
  summary?: string;
  /** The plot height in px. Default 192. With `round`, the width of the square instead: default 224. */
  height?: number;
  /** Makes the plot a centred square, for a pie, a radial or a radar chart. */
  round?: boolean;
  /** Shows the key under the plot: a swatch and a name for every key of the config. Give it to every chart with two or more series. */
  legend?: boolean;
  /** What follows the plot and the key inside the figure: `<ChartFigures>`, a sentence about the trend. */
  footer?: React.ReactNode;
  /** A BCP 47 tag for the numbers in the tooltip and the table. Default 'en-GB'. */
  locale?: string;
  /** One Recharts chart: `<AreaChart>`, `<BarChart>`, `<LineChart>`, `<PieChart>`, `<RadarChart>`, `<RadialBarChart>`. */
  children: React.ReactElement;
  /**
   * Makes the drawing one image the keyboard walks: a stop for Tab named by `summary`, whose points the arrow keys, Home and
   * End move through, each said by a live region and shown by the tooltip; Escape lets go. Give the Recharts chart
   * `accessibilityLayer={false}` then, so its own stop for Tab is not inside the image. Without it the drawing is a group
   * named by `summary`, and Recharts' own keyboard layer is left as it is.
   */
  walk?: ChartWalk;
}

/**
 * The frame of a Recharts chart in this system: a title and a caption, the plot at a set height and the full width of its card,
 * and the colours. One key in `config` is drawn in ink (yellow on an ink card); two to four take the data colours in order; a fifth is hint grey.
 * Inside it, marks take their colour from `var(--color-<key>)`.
 */
export const ChartContainer = React.forwardRef<HTMLElement, ChartContainerProps>(function ChartContainer(
  { config, title, caption, summary, height, round, legend, footer, locale = 'en-GB', walk, className, style, children, ...rest },
  ref,
) {
  // Static mode: a chart composed here is Recharts' own, which the plain-HTML system cannot draw. Chart's six forms can be.
  if (useStaticMode())
    throw new Error(
      `trayui-react/static: a chart composed in ChartContainer${typeof title === 'string' ? ` ("${title}")` : ''} cannot be rendered to static HTML: ` +
        "the plain-HTML system draws only Chart's six forms (bar, line, area, donut, radial, radar). Use Chart, or draw this one with the page's own script.",
    );
  const [active, setActive] = React.useState<number | undefined>(undefined);
  // Recharts shows the tooltip at the point the keyboard is on only while the pointer has not moved over the chart; once
  // it has, the chart is drawn afresh as the keyboard takes over (a new key), so the tooltip follows the keys again.
  const pointed = React.useRef(false);
  const [fresh, setFresh] = React.useState(0);
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!walk || walk.count < 1) return;
    const last = walk.count - 1;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const step = ({ ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 1, ArrowUp: -1 } as Record<string, number>)[e.key];
    let next: number | undefined;
    if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else if (step && active === undefined) next = walk.start ?? (step > 0 ? 0 : last);
    else if (step && active !== undefined) next = walk.wrap ? (active + step + walk.count) % walk.count : Math.max(0, Math.min(last, active + step));
    else if (e.key === 'Escape' && active !== undefined) {
      e.preventDefault();
      setActive(undefined);
      return;
    } else return;
    e.preventDefault();
    if (active === undefined && pointed.current) {
      pointed.current = false;
      setFresh((n) => n + 1);
    }
    setActive(next);
  };
  const said = walk && active !== undefined && active < walk.count ? walk.say(active) : '';
  const keys = Object.keys(config);
  const vars: Record<string, string> = {};
  keys.forEach((key, i) => {
    vars[`--color-${safe(key)}`] = config[key].color ?? `var(--tray-s${Math.min(i + 1, 5)})`;
  });
  const value = React.useMemo(() => ({ config, locale, active }), [config, locale, active]);
  // The figure is named by its caption, as the plain-HTML chart is: a screen reader says the title on entering it.
  const titleId = 'tray-chart-title-' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <ChartContext.Provider value={value}>
      <figure
        ref={ref}
        className={cx('tray-chart', keys.length === 1 && 'tray-chart--single', className)}
        style={{ ...vars, ...style } as React.CSSProperties}
        aria-labelledby={title != null ? titleId : undefined}
        {...rest}
      >
        {title != null ? (
          <figcaption className="tray-chart__title" id={titleId}>
            {title}
          </figcaption>
        ) : null}
        {caption != null ? <p className="tray-chart__caption">{caption}</p> : null}
        <div
          className={cx('tray-chart__canvas', round && 'tray-chart__canvas--round')}
          role={walk ? 'img' : 'group'}
          aria-label={summary}
          tabIndex={walk ? 0 : undefined}
          onKeyDown={walk ? onKeyDown : undefined}
          onBlur={walk ? () => setActive(undefined) : undefined}
          onPointerMove={
            walk
              ? () => {
                  pointed.current = true;
                }
              : undefined
          }
          style={height ? ({ [round ? '--tray-d' : '--tray-h']: `${height}px` } as React.CSSProperties) : undefined}
        >
          <ResponsiveContainer key={fresh} width="100%" height="100%" minWidth={0}>
            {children}
          </ResponsiveContainer>
        </div>
        {/* Beside the image, not in it: a live region inside a role="img" is never heard. */}
        {walk ? (
          <span className="tray-vh" aria-live="polite">
            {said}
          </span>
        ) : null}
        {legend ? <ChartLegendContent /> : null}
        {footer}
      </figure>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'ChartContainer';

/* ---------- Tooltip ---------- */

type TipItem = {
  dataKey?: unknown;
  name?: unknown;
  value?: unknown;
  color?: string;
  fill?: string;
  stroke?: string;
  payload?: Record<string, unknown>;
};

export interface ChartTooltipContentProps {
  /** Text set after every value: ' kg', '%'. Mind the space. */
  unit?: string;
  /** Leaves out the first line, the category the pointer is at. */
  hideLabel?: boolean;
  /** Leaves out the mark of colour before each name. */
  hideIndicator?: boolean;
  /** The mark of colour: a 'swatch' (the default), a 'line' or a 'dashed' line, for a series drawn that way. */
  indicator?: 'swatch' | 'line' | 'dashed';
  /** The field of a data row that names it, when the name is not the data key: `nameKey="channel"` in a pie. */
  nameKey?: string;
  /** Writes the first line: `(label) => 'Week of ' + label`. */
  labelFormatter?: (label: React.ReactNode, items: TipItem[]) => React.ReactNode;
  /** Writes one value: `(value) => value + ' jars'`. It replaces `unit`. */
  valueFormatter?: (value: number | string, item: TipItem) => React.ReactNode;
  /** Adds a last row with the sum of the values, under this name: `total="Total"`. */
  total?: string;
  /** Filled in by Recharts. */
  active?: boolean;
  /** Filled in by Recharts. */
  payload?: readonly TipItem[];
  /** Filled in by Recharts. */
  label?: string | number;
}

/**
 * What the tooltip says: the category, then each series with its mark of colour, its name and its value.
 * One series reads as a single line, "May, 22 kg". Text stays in the tooltip's own ink; only the mark carries the colour.
 */
export function ChartTooltipContent({ unit = '', hideLabel, hideIndicator, indicator = 'swatch', nameKey, labelFormatter, valueFormatter, total, active, payload, label }: ChartTooltipContentProps) {
  const { config, locale } = useChart();
  const nf = React.useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
  const items = inOrder((payload ?? []).filter((item) => item.value != null) as TipItem[], config, (item) => (nameKey ? item.payload?.[nameKey] : item.dataKey));
  if (!active || !items.length) return null;

  const say = (value: unknown, item: TipItem): React.ReactNode => {
    if (valueFormatter) return valueFormatter(value as number | string, item);
    return typeof value === 'number' ? nf.format(value) + unit : String(value) + unit;
  };
  const name = (item: TipItem): React.ReactNode => nameOf(config, nameKey ? item.payload?.[nameKey] : undefined, item.dataKey, item.name);
  /* In a pie the hovered slice names itself, so the first line would only repeat it. */
  const polar = label == null || label === '';
  const head = hideLabel || polar ? null : labelFormatter ? labelFormatter(label, items) : nameOf(config, label);

  if (items.length === 1 && !total && (hideIndicator || !polar)) {
    const item = items[0];
    const text = polar || hideLabel ? name(item) : head;
    return (
      <div className="tray-tip">
        {text}, {say(item.value, item)}
      </div>
    );
  }
  const sum = items.reduce((a, item) => a + (typeof item.value === 'number' ? item.value : 0), 0);
  return (
    <div className="tray-tip">
      {head != null ? <span>{head}</span> : null}
      {items.map((item, i) => (
        <span className="tray-tip__row" key={i}>
          {hideIndicator ? null : (
            <span
              className={cx('tray-swatch', indicator !== 'swatch' && `tray-swatch--${indicator}`)}
              style={{ '--tray-c': item.payload?.fill ?? item.color ?? item.fill ?? item.stroke } as React.CSSProperties}
            />
          )}
          {name(item)}
          <b>{say(item.value, item)}</b>
        </span>
      ))}
      {total ? (
        <span className="tray-tip__row tray-tip__row--total">
          {total}
          <b>{say(sum, {})}</b>
        </span>
      ) : null}
    </div>
  );
}

/**
 * The Recharts tooltip, set up for this system: it does not glide, it stands 12px from the pointer, and it says its figures with `ChartTooltipContent`.
 * Pass `content={<ChartTooltipContent unit=" kg" />}` to set a unit or change what it says; every other prop is the Recharts one.
 */
export function ChartTooltip(props: TooltipProps) {
  // a chart the keyboard walks shows the point the keys are on
  const active = React.useContext(ChartContext)?.active;
  return <Tooltip isAnimationActive={false} offset={12} content={<ChartTooltipContent />} defaultIndex={active} {...props} />;
}

/* ---------- Legend ---------- */

type KeyItem = { dataKey?: unknown; value?: unknown; color?: string; payload?: Record<string, unknown> };

export interface ChartLegendContentProps {
  /** The field of a data row that names it, when the name is not the data key: `nameKey="channel"` in a pie. */
  nameKey?: string;
  /** Filled in by Recharts. */
  payload?: readonly KeyItem[];
}

/**
 * The key of a chart: a swatch and a name for each series, in soft ink. Every chart with two or more series has one.
 * On its own it lists the keys of the config; as the `content` of a Recharts `<Legend>` it lists what the legend holds.
 */
export function ChartLegendContent({ nameKey, payload }: ChartLegendContentProps) {
  const { config } = useChart();
  const items: readonly KeyItem[] = payload?.length
    ? inOrder(payload, config, (item) => (nameKey ? item.payload?.[nameKey] : item.dataKey))
    : Object.keys(config).map((key) => ({ dataKey: key, color: `var(--color-${safe(key)})` }));
  if (!items.length) return null;
  return (
    <ul className="tray-chart__legend">
      {items.map((item, i) => (
        <li key={i}>
          <span className="tray-swatch" style={{ '--tray-c': item.color } as React.CSSProperties} />
          {nameOf(config, nameKey ? item.payload?.[nameKey] : undefined, item.dataKey, item.value)}
        </li>
      ))}
    </ul>
  );
}

/**
 * The Recharts legend with this system's key in it, for a key that must sit inside the plot's own box. It takes its height from the plot:
 * for the usual key under the plot, set `legend` on `ChartContainer` instead. Every prop is the Recharts one.
 */
export function ChartLegend(props: LegendProps) {
  return <Legend verticalAlign="bottom" align="left" content={<ChartLegendContent />} {...(props as object)} />;
}

/* ---------- The middle of a ring ---------- */

export interface ChartCenterProps {
  /** The figure: "104 kg", "68%". Set large, in ink. */
  value: React.ReactNode;
  /** What the figure is, under it: "Season so far". */
  label?: React.ReactNode;
  /** Moves the text down from the middle of the plot, in px (up when negative). Half a ring holds its figure near its base: `dy={36}`. */
  dy?: number;
}

type Box = { cx?: number; cy?: number; x?: number; y?: number; width?: number; height?: number };

/** A figure and its name in the middle of a donut or a radial chart. Put it inside `<Pie>`, or inside `<PolarRadiusAxis>` of a radial chart. */
export function ChartCenter({ value, label, dy = 0 }: ChartCenterProps) {
  return (
    <Label
      position="center"
      content={(props: { viewBox?: unknown }) => {
        const box = (props.viewBox ?? {}) as Box;
        const x = box.cx ?? (box.x ?? 0) + (box.width ?? 0) / 2;
        const y = (box.cy ?? (box.y ?? 0) + (box.height ?? 0) / 2) + dy;
        return (
          <text x={x} y={y} textAnchor="middle" className="tray-chart__middle">
            <tspan x={x} y={label != null ? y : y + 10} className="tray-chart__middle-value">
              {value}
            </tspan>
            {label != null ? (
              <tspan x={x} y={y + 22} className="tray-chart__middle-label">
                {label}
              </tspan>
            ) : null}
          </text>
        );
      }}
    />
  );
}

/* ---------- The same figures as a table ---------- */

export interface ChartFiguresProps<Row extends Record<string, unknown> = Record<string, unknown>> {
  /** The rows the chart draws. */
  data: readonly Row[];
  /** The field that names a row: 'month'. */
  labelKey: keyof Row & string;
  /** The head of the first column: "Month". */
  labelHead?: string;
  /** The fields to show, in order. Default: every key of the chart's config. */
  keys?: string[];
  /** Text set after every value: ' kg', '%'. */
  unit?: string;
  /** The words on the disclosure. Default "Show the figures". */
  summary?: string;
}

/**
 * The figures of a chart as a table, behind a "Show the figures" disclosure. Two of the four data colours are faint on a light ground,
 * so a chart with several series gives its figures this way as well. Pass it to the `footer` of `ChartContainer`.
 */
export function ChartFigures<Row extends Record<string, unknown>>({ data, labelKey, labelHead = '', keys, unit = '', summary = 'Show the figures' }: ChartFiguresProps<Row>) {
  const { config, locale } = useChart();
  const nf = React.useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
  const cols = keys ?? Object.keys(config);
  return (
    <details className="tray-collapsible">
      <summary>
        <span>{summary}</span>
        <span className="tray-tile" aria-hidden="true">
          <svg className="tray-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5v14" />
          </svg>
        </span>
      </summary>
      <div className="tray-collapsible__body">
        <table className="tray-table tray-table--compact">
          <thead>
            <tr>
              <th scope="col">{labelHead}</th>
              {cols.map((key) => (
                <th scope="col" data-num="" key={key}>
                  {nameOf(config, key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <th scope="row">{nameOf(config, row[labelKey])}</th>
                {cols.map((key) => {
                  const v = row[key];
                  return (
                    <td data-num="" key={key}>
                      {typeof v === 'number' ? nf.format(v) + unit : v == null ? '' : String(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
