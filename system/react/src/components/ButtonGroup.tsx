'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx, useBehaviour, useForwardedRef } from '../lib/util';
import { useOwnBcEvent } from '../lib/nav';
import { Icon } from './Icon';

export interface ButtonGroupItem {
  /** What the button says: a verb, sentence case. With `iconOnly` it becomes the button's aria-label instead. */
  label: string;
  /** An icon before the label, such as 'arrow-left' for "Reply". */
  icon?: IconSource;
  /** Shows only the icon, as a square button; the label is then read by screen readers. */
  iconOnly?: boolean;
  /** Draws a hairline before this button, to split the group into two clusters (for example before "Delete"). */
  separated?: boolean;
  /** The button cannot be used. */
  disabled?: boolean;
  /** Called when the button is clicked. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface ButtonGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Names the group for screen readers: "Message actions", "Quantity". Required: a group always needs a name. */
  label: string;
  /** The buttons, in order. Ignored by the stepper. */
  items?: ButtonGroupItem[];
  /** 'md' 56px buttons (the default); 'sm' 44px buttons, for toolbars and dense rows. */
  size?: 'md' | 'sm';
  /** 'horizontal' (the default) puts the buttons in a row; 'vertical' stacks them, as for zoom in and out. */
  orientation?: 'horizontal' | 'vertical';
  /** Turns the group into a quantity stepper: minus, the value, plus. It counts between `min` and `max`. */
  stepper?: boolean;
  /** Stepper: the value it starts at. Default `min`. */
  defaultValue?: number;
  /** Stepper: the lowest value; the minus button disables there. Default 0. */
  min?: number;
  /** Stepper: the highest value; the plus button disables there. Default 99. */
  max?: number;
  /** Stepper: called with the new value after minus or plus. */
  onChange?: (value: number) => void;
  /** Stepper: the aria-label of the minus button. Default 'One fewer'. */
  decrementLabel?: string;
  /** Stepper: the aria-label of the plus button. Default 'One more'. */
  incrementLabel?: string;
  /** More content after the items, such as a menu anchor whose trigger is a `<button className="tray-btn-group__item">`. */
  children?: React.ReactNode;
}

/**
 * A button group is a tray that holds related buttons 4px apart, so they read as one control: several actions on the same object,
 * a quantity stepper, or a main action with a second button for more choices. For a choice that stays selected, use a toggle group.
 */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { label, items = [], size = 'md', orientation = 'horizontal', stepper, defaultValue, min = 0, max = 99, onChange, decrementLabel = 'One fewer', incrementLabel = 'One more', className, children, ...rest },
  forwarded,
) {
  const ref = useForwardedRef(forwarded);
  useBehaviour(ref, [stepper]);
  useOwnBcEvent(ref, 'change', (d: { value: number }) => onChange?.(d.value), !!stepper);
  const classes = cx('tray-btn-group', size === 'sm' && 'tray-btn-group--sm', orientation === 'vertical' && 'tray-btn-group--vertical', className);

  if (stepper) {
    return (
      <div ref={ref as React.RefObject<HTMLDivElement>} className={classes} role="group" aria-label={label} data-tray="stepper" data-min={min} data-max={max} {...rest}>
        <button className="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="-1" aria-label={decrementLabel}>
          <Icon name="minus" />
        </button>
        <output className="tray-btn-group__value">{defaultValue ?? min}</output>
        <button className="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="1" aria-label={incrementLabel}>
          <Icon name="plus" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={classes} role="group" aria-label={label} {...rest}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {it.separated ? <span className="tray-btn-group__rule" /> : null}
          <button
            className={cx('tray-btn-group__item', it.iconOnly && 'tray-btn-group__item--icon')}
            type="button"
            aria-label={it.iconOnly ? it.label : undefined}
            disabled={it.disabled}
            onClick={it.onClick}
          >
            {it.icon ? <Icon name={it.icon} /> : null}
            {it.iconOnly ? null : it.label}
          </button>
        </React.Fragment>
      ))}
      {children}
    </div>
  );
});
ButtonGroup.displayName = 'ButtonGroup';
