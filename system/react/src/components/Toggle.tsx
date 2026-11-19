'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { useStaticMode } from '../lib/static';
import { cx, useControlled } from '../lib/util';
import { Icon } from './Icon';

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onChange'> {
  /** Whether it is pressed, for a controlled toggle. */
  pressed?: boolean;
  /** Whether it starts pressed, for an uncontrolled toggle. Default false. */
  defaultPressed?: boolean;
  /** Called with the new state when it is pressed or released. Apply the change at once. */
  onPressedChange?: (pressed: boolean) => void;
  /** An icon before the label. With no label the toggle turns square: give it an aria-label ("Bold"). */
  icon?: IconSource;
  /** A second icon shown while pressed, in place of `icon`: the theme switch shows 'moon' while light and 'sun' while dark. */
  iconPressed?: IconSource;
  /** 'sm' is 48px (the default), 'xs' 40px for dense toolbars. */
  size?: 'sm' | 'xs';
}

/**
 * A toggle is one button that stays pressed: on is solid ink, off is the resting fill.
 * Use it for a single on/off setting in a toolbar (bold, pin, mute); for a setting in a form use Switch, for a choice among several use Toggle Group.
 */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { pressed, defaultPressed = false, onPressedChange, icon, iconPressed, size = 'sm', className, children, onClick, ...rest },
  ref,
) {
  const [on, setOn] = useControlled(pressed, defaultPressed, onPressedChange);
  // static mode: bundle.js's toggle behaviour flips aria-pressed, in place of the state above
  const wired = useStaticMode();
  const iconOnly = !!icon && children == null;
  const iconSize = size === 'xs' ? 'sm' : 'md';
  return (
    <button
      ref={ref}
      type="button"
      className={cx('tray-toggle', iconOnly && 'tray-toggle--icon', size === 'xs' && 'tray-toggle--xs', className)}
      aria-pressed={on}
      data-tray={wired ? 'toggle' : undefined}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOn(!on);
      }}
      {...rest}
    >
      {icon && iconPressed ? (
        <>
          <span data-when="off">
            <Icon name={icon} size={iconSize} />
          </span>
          <span data-when="on">
            <Icon name={iconPressed} size={iconSize} />
          </span>
        </>
      ) : icon ? (
        <Icon name={icon} size={iconSize} />
      ) : null}
      {children}
    </button>
  );
});
Toggle.displayName = 'Toggle';
