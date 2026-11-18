'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx, useBehaviour, useControlled, useForwardedRef, useUid } from '../lib/util';
import { Icon } from './Icon';

export interface ToggleGroupItem {
  /** The value this segment stands for. */
  value: string;
  /** One or two words: "50 g", "List", "Week". With `iconOnly` it becomes the segment's aria-label. */
  label: string;
  /** An icon before the label, such as 'list' or 'layout-grid'. */
  icon?: IconSource;
  /** Dims the segment; it cannot be chosen. */
  disabled?: boolean;
}

export interface ToggleGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The segments, two to five. */
  items: ToggleGroupItem[];
  /** Lets several segments be on at once (bold, italic, underline). Use `values`, `defaultValues` and `onValuesChange` then. Default: exactly one is on. */
  multiple?: boolean;
  /** The chosen segment's value, for a controlled group with one choice. */
  value?: string;
  /** The segment chosen at first, for an uncontrolled group with one choice. Default: the first segment, since a single-choice group is never left empty. */
  defaultValue?: string;
  /** Called with the chosen segment's value. */
  onChange?: (value: string) => void;
  /** With `multiple`: the values that are on, for a controlled group. */
  values?: string[];
  /** With `multiple`: the values on at first, for an uncontrolled group. Default none. */
  defaultValues?: string[];
  /** With `multiple`: called with every value that is now on. */
  onValuesChange?: (values: string[]) => void;
  /** 'md' has 52px segments in bold type (the default); 'sm' 44px segments in nav type, for toolbars. */
  size?: 'md' | 'sm';
  /** Spreads the segments in equal columns across the full width. */
  fill?: boolean;
  /** Square segments with the icon alone; each item's label becomes its aria-label. */
  iconOnly?: boolean;
  /** The form name of the inputs inside. One is made up when it is left out. */
  name?: string;
  /** Dims every segment. */
  disabled?: boolean;
}

/**
 * A toggle group is the segmented control: a tray of segments where the selected one is solid ink.
 * Use it for two to five short options that are all worth seeing at once: jar size, list or grid, a time range. Give it an aria-label.
 */
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  {
    items,
    multiple,
    value,
    defaultValue,
    onChange,
    values,
    defaultValues,
    onValuesChange,
    size = 'md',
    fill,
    iconOnly,
    name,
    disabled,
    className,
    ...rest
  },
  ref,
) {
  const auto = useUid('seg');
  const own = useForwardedRef(ref);
  const [one, setOne] = useControlled(value, defaultValue ?? items[0]?.value ?? '', onChange);
  const [many, setMany] = useControlled(values, defaultValues ?? [], onValuesChange);
  // the behaviours give a group of radios its sliding pill; a choice made from outside moves it too
  useBehaviour(own);
  React.useEffect(() => {
    if (!multiple) own.current?.dispatchEvent(new Event('change'));
  }, [own, one, multiple, items.length]);
  return (
    <div
      ref={own as React.RefObject<HTMLDivElement>}
      role={multiple ? 'group' : 'radiogroup'}
      className={cx('tray-seg', fill && 'tray-seg--fill', size === 'sm' && 'tray-seg--sm', iconOnly && 'tray-seg--icon', className)}
      {...rest}
    >
      {items.map((item) => {
        const on = multiple ? many.includes(item.value) : one === item.value;
        return (
          <label key={item.value} className="tray-seg__item">
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name ?? auto}
              value={item.value}
              checked={on}
              disabled={disabled || item.disabled}
              aria-label={iconOnly ? item.label : undefined}
              onChange={(e) => {
                if (!multiple) setOne(item.value);
                else setMany(items.map((i) => i.value).filter((v) => (v === item.value ? e.target.checked : many.includes(v))));
              }}
            />
            <span>
              {item.icon ? <Icon name={item.icon} /> : null}
              {iconOnly ? null : item.label}
            </span>
          </label>
        );
      })}
    </div>
  );
});
ToggleGroup.displayName = 'ToggleGroup';
