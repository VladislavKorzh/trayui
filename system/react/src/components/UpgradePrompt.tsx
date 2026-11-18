'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx, useIsoLayoutEffect } from '../lib/util';
import { Alert } from './Alert';
import { Button } from './Button';
import { Icon } from './Icon';

export type UpgradePromptVariant = 'card' | 'alert' | 'locked';

export interface UpgradePromptAction {
  /** The words: "Upgrade to Shop", "Compare plans". */
  label: string;
  /** Where it goes: it then renders a link. */
  href?: string;
  /** What it does, for a button. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface UpgradePromptProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * 'card' stands in place of a whole section the plan lacks (the default). 'alert' is one line inside a page, when a limit was reached:
   * it is the Alert. 'locked' floats a raised prompt over a dimmed picture of the feature, passed as `children`.
   */
  variant?: UpgradePromptVariant;
  /** Which plan has the feature, and the feature: "Courier tracking is part of Shop". */
  title: React.ReactNode;
  /** What the person gets, in their words, or what happens now: "See where every box is and tell the customer before they ask." */
  description?: React.ReactNode;
  /** The icon in the tile. Default 'lock'; 'zap' suits a reached limit, or an icon for the feature ('chart-column' for reports). */
  icon?: IconSource;
  /** The one button that gets the plan: yellow on the card, ink on the alert and on the locked prompt. Leave it out where the person cannot upgrade. */
  action?: UpgradePromptAction;
  /** A link beside the button: "Compare plans". On the alert, it stands alone when there is no `action`. */
  secondaryAction?: UpgradePromptAction;
  /** For variant 'alert': 'accent' (the default) is the yellow alert for a limit the person can lift now; 'neutral' tells a team member who cannot upgrade to ask the owner. */
  tone?: 'accent' | 'neutral';
  /** For variant 'locked': a picture of the feature, such as a Table of sample reports. It is dimmed, inert and hidden from screen readers. */
  children?: React.ReactNode;
  /** The heading level of the title on the card and the locked prompt. Default 3. */
  headingLevel?: 2 | 3 | 4;
}

function act(a: UpgradePromptAction, variant: 'primary' | 'dark' | 'link', size: 'lg' | 'md' | 'sm' | 'xs') {
  return (
    <Button variant={variant} size={size} href={a.href} onClick={a.onClick}>
      {a.label}
    </Button>
  );
}

/**
 * An upgrade prompt stands where a feature would be when the plan does not have it: what the feature does, which plan has it,
 * and one button to get it. It waits where the feature lives; it never interrupts a task.
 */
export const UpgradePrompt = React.forwardRef<HTMLDivElement, UpgradePromptProps>(function UpgradePrompt(
  { variant = 'card', title, description, icon = 'lock', action, secondaryAction, tone = 'accent', children, headingLevel = 3, className, role, ...rest },
  ref,
) {
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  // `inert` is set on the element itself: React 18 does not know the attribute and React 19 reads it as a boolean.
  const picture = React.useRef<HTMLDivElement | null>(null);
  useIsoLayoutEffect(() => {
    picture.current?.setAttribute('inert', '');
  }, [variant]);

  if (variant === 'alert') {
    return (
      <Alert
        ref={ref}
        tone={tone}
        icon={icon}
        title={title}
        className={className}
        role={role === 'alert' ? 'alert' : role === 'status' ? 'status' : undefined}
        actions={action ? act(action, 'dark', 'xs') : secondaryAction ? act(secondaryAction, 'link', 'lg') : undefined}
        {...rest}
      >
        {description}
      </Alert>
    );
  }

  if (variant === 'locked') {
    return (
      <div ref={ref} className={cx('tray-locked', className)} role={role} {...rest}>
        <div ref={picture} className="tray-locked__content" aria-hidden="true">
          {children}
        </div>
        <div className="tray-locked__prompt tray-raised tray-upsell">
          <span className="tray-upsell__icon">
            <Icon name={icon} />
          </span>
          <div className="tray-upsell__text">
            <H className="nav" style={{ fontWeight: 600, fontSize: '1.0625rem' }}>
              {title}
            </H>
            {description != null ? <p>{description}</p> : null}
          </div>
          {action || secondaryAction ? (
            <div className="tray-upsell__actions">
              {action ? act(action, 'dark', 'sm') : null}
              {secondaryAction ? act(secondaryAction, 'link', 'lg') : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cx('tray-card tray-upsell', className)} role={role} {...rest}>
      <span className="tray-upsell__icon">
        <Icon name={icon} />
      </span>
      <div className="tray-upsell__text">
        <H className="subtitle">{title}</H>
        {description != null ? <p>{description}</p> : null}
      </div>
      {action || secondaryAction ? (
        <div className="tray-upsell__actions">
          {action ? act(action, 'primary', 'md') : null}
          {secondaryAction ? act(secondaryAction, 'link', 'lg') : null}
        </div>
      ) : null}
    </div>
  );
});
UpgradePrompt.displayName = 'UpgradePrompt';
