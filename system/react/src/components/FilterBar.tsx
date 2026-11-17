import * as React from 'react';
import { cx, useControlled } from '../lib/util';
import { Button } from './Button';
import { DropdownMenu, type MenuItem } from './DropdownMenu';
import { Icon } from './Icon';
import { InputGroup } from './InputGroup';
import { NativeSelect, type NativeSelectOption } from './NativeSelect';
import { ToggleGroup, type ToggleGroupItem } from './ToggleGroup';

export interface FilterOption {
  /** The filter's value, unique across the whole bar: 'status:to-pack'. `value` and `onChange` speak in these. */
  value: string;
  /** The option's words in the menu: "To pack". */
  label: string;
  /** How many items it would show, in muted type at the end of the row: 12. */
  count?: React.ReactNode;
  /** The chip's words while it is on. Default: the menu's label and the option's, "Status: To pack". */
  chip?: string;
}

export interface FilterMenu {
  /** The menu's button: one word for what it filters, "Status", "Delivery". */
  label: string;
  /** Its options; several can be on at once. */
  options: FilterOption[];
  /** Whether the menu starts open: holds it open in a static picture, until a click outside. Default false. */
  defaultOpen?: boolean;
}

export interface FilterBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The search field's placeholder and accessible name: "Search orders". Default 'Search'; false leaves the field out. */
  search?: string | false;
  /** The search text, for a controlled field. */
  query?: string;
  /** The search text at first, when `query` is left out. */
  defaultQuery?: string;
  /** Called with the search text as it is typed. */
  onQueryChange?: (query: string) => void;
  /** The filter menus after the search, at most four; more go behind a "Filters" button (`children`) that opens a Popover. */
  filters?: FilterMenu[];
  /** The filters that are on, by option `value`, in the order they were turned on. Each shows as a chip under the row. Leave it out to let the bar keep its own. */
  value?: string[];
  /** The filters on at first, when `value` is left out. Default none. */
  defaultValue?: string[];
  /** Called with every filter value that is now on, at each change: filter the list here. Never wait for an "Apply" button. */
  onChange?: (filters: string[]) => void;
  /** The sort choices, in a small native select at the end: ['Newest first', 'Oldest first']. Leave it out for no sorting. */
  sortOptions?: Array<string | NativeSelectOption>;
  /** The chosen sort, for a controlled select. */
  sort?: string;
  /** The sort chosen at first, when `sort` is left out. Default: the first option. */
  defaultSort?: string;
  /** Called with the chosen sort's value. */
  onSortChange?: (sort: string) => void;
  /** The sort select's accessible name. Default 'Sort by'. */
  sortLabel?: string;
  /** The views, as icon segments at the very end: `[{ value: 'list', label: 'List', icon: 'list' }, { value: 'grid', label: 'Grid', icon: 'layout-grid' }]`. */
  views?: ToggleGroupItem[];
  /** The chosen view, for a controlled switch. */
  view?: string;
  /** The view chosen at first, when `view` is left out. Default: the first. */
  defaultView?: string;
  /** Called with the chosen view's value. */
  onViewChange?: (view: string) => void;
  /** The view switch's accessible name. Default 'View'. */
  viewLabel?: string;
  /** The link at the end of the chips that turns every filter off. Default 'Clear all'. */
  clearLabel?: string;
  /** More in the row after the filter menus: a "Filters" button that opens a Popover with the rest. */
  children?: React.ReactNode;
  /** More at the end edge, before the sort and the view: an Export button. */
  end?: React.ReactNode;
}

/**
 * The filter bar sits over a list or a table: search at the start, filters as menus, sorting and the view at the end, and a chip for every filter that is on.
 * The list follows each change at once; say how many results match near it ("12 orders").
 */
export const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(function FilterBar(
  {
    search = 'Search',
    query,
    defaultQuery,
    onQueryChange,
    filters = [],
    value,
    defaultValue,
    onChange,
    sortOptions,
    sort,
    defaultSort,
    onSortChange,
    sortLabel = 'Sort by',
    views,
    view,
    defaultView,
    onViewChange,
    viewLabel = 'View',
    clearLabel = 'Clear all',
    children,
    end,
    className,
    ...rest
  },
  ref,
) {
  const [on, setOn] = useControlled<string[]>(value, defaultValue ?? [], onChange);
  const [text, setText] = useControlled(query, defaultQuery ?? '', onQueryChange);
  const firstSort = sortOptions?.[0];
  const [sortValue, setSort] = useControlled(sort, defaultSort ?? (typeof firstSort === 'string' ? firstSort : firstSort?.value ?? ''), onSortChange);

  const chipOf = new Map<string, string>();
  filters.forEach((m) => m.options.forEach((o) => chipOf.set(o.value, o.chip ?? `${m.label}: ${o.label}`)));
  const flip = (v: string, checked: boolean) => setOn(checked ? (on.includes(v) ? on : [...on, v]) : on.filter((x) => x !== v));
  const chips = on.filter((v) => chipOf.has(v));
  const hasEnd = end != null || !!sortOptions?.length || !!views?.length;

  return (
    <div ref={ref} className={cx('tray-filterbar', className)} {...rest}>
      <div className="tray-filterbar__row">
        {search !== false ? (
          <InputGroup size="sm" icon="search" type="search" placeholder={search} aria-label={search} value={text} onChange={(e) => setText(e.target.value)} />
        ) : null}
        {filters.map((m) => (
          <DropdownMenu
            key={m.label}
            label={m.label}
            defaultOpen={m.defaultOpen}
            items={m.options.map<MenuItem>((o) => ({
              type: 'checkbox',
              label: o.label,
              value: o.value,
              shortcut: o.count != null ? String(o.count) : undefined,
              checked: on.includes(o.value),
            }))}
            onCheckedChange={flip}
          />
        ))}
        {children}
        {hasEnd ? (
          <div className="tray-filterbar__end">
            {end}
            {sortOptions?.length ? (
              <NativeSelect size="sm" aria-label={sortLabel} options={sortOptions} value={sortValue} onChange={(e) => setSort(e.target.value)} />
            ) : null}
            {views?.length ? <ToggleGroup size="sm" iconOnly aria-label={viewLabel} items={views} value={view} defaultValue={defaultView} onChange={onViewChange} /> : null}
          </div>
        ) : null}
      </div>
      <div className="tray-filterbar__chips">
        {chips.map((v) => (
          <span key={v} className="tray-chip" data-value={v}>
            {chipOf.get(v)}
            <button type="button" className="tray-chip__x" aria-label={`Remove ${chipOf.get(v)}`} onClick={() => flip(v, false)}>
              <Icon name="x" size="sm" />
            </button>
          </span>
        ))}
        {chips.length ? (
          <Button variant="link" onClick={() => setOn(on.filter((v) => !chipOf.has(v)))}>
            {clearLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
});
FilterBar.displayName = 'FilterBar';
