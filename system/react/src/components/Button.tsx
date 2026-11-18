import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { Icon } from './Icon';

export type ButtonVariant = 'primary' | 'dark' | 'quiet' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'lg' | 'md' | 'sm' | 'xs';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * 'primary' is the yellow button: the single most important action in view, one per view.
   * 'dark' is solid ink: the main action on a yellow surface, or a second strong action.
   * 'quiet' is the resting fill: the default for everything that is not the main action.
   * 'ghost' has no fill until hover: toolbars, dialogs, "Cancel". 'danger' deletes something for good. 'link' reads as a link inside text.
   */
  variant?: ButtonVariant;
  /** 'lg' 64px (the default, page actions), 'md' 56px (in a row with inputs), 'sm' 48px (headers, toolbars), 'xs' 40px (tables, dense rows). */
  size?: ButtonSize;
  /** An icon before the label. With no label the button turns square: give it an aria-label. */
  icon?: IconSource;
  /** An icon after the label, such as 'arrow-right' for "Next". */
  iconEnd?: IconSource;
  /** Takes the full width of its container. */
  block?: boolean;
  /** Pushes the last part of the label to the far end, for a value on the button: "Order a jar ... $59". Pass the value as `end`. */
  end?: React.ReactNode;
  /** Shows a spinner before the label and sets aria-busy while work runs. The label stays. */
  busy?: boolean;
  /** Renders a link that looks like a button: use it when the button goes somewhere instead of doing something. */
  href?: string;
  /** With `href`: where to open the link. */
  target?: string;
  /** With `href`: the link's relation, such as 'noopener'. */
  rel?: string;
  /** The button's type in a form. Default 'button', so it never submits by accident. */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * A button starts an action. The yellow one is the single most important action in view; everything else is quiet, ghost or a link.
 */
export const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'lg', icon, iconEnd, block, end, busy, href, target, rel, type = 'button', className, children, ...rest },
  ref,
) {
  const iconOnly = !!icon && children == null && end == null;
  const classes = cx(
    'tray-btn',
    variant !== 'primary' && `tray-btn--${variant}`,
    size !== 'lg' && `tray-btn--${size}`,
    iconOnly && 'tray-btn--icon',
    block && 'tray-btn--block',
    end != null && 'tray-btn--split',
    className,
  );
  const body = (
    <>
      {busy ? <span className="tray-spinner tray-spinner--sm" aria-hidden="true" /> : icon ? <Icon name={icon} /> : null}
      {end != null ? <span>{children}</span> : children}
      {end != null ? <span>{end}</span> : null}
      {iconEnd ? <Icon name={iconEnd} flip={typeof iconEnd === 'string' && (iconEnd.startsWith('arrow') || iconEnd.startsWith('chevron'))} /> : null}
    </>
  );
  if (href !== undefined) {
    /* The props are typed for a button; what the link takes of them is what every element has (a button's own, such as `form`, mean nothing here). */
    const { disabled, ...anchorRest } = rest;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        href={disabled ? undefined : href}
        target={target}
        rel={rel}
        aria-disabled={disabled || undefined}
        aria-busy={busy || undefined}
        {...(anchorRest as React.HTMLAttributes<HTMLElement>)}
      >
        {body}
      </a>
    );
  }
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type={type} className={classes} aria-busy={busy || undefined} {...rest}>
      {body}
    </button>
  );
});
Button.displayName = 'Button';
