import * as React from 'react';
import type { IconName } from '../icons';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { Icon } from './Icon';

export type AlertTone = 'neutral' | 'danger' | 'success' | 'accent';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * 'neutral' is information on the grey tray (the default). 'danger' says something failed and needs the person: the icon and title turn red.
   * 'success' confirms a finished step in place. 'accent' is the yellow surface for the one thing to act on now, once per screen.
   */
  tone?: AlertTone;
  /** The icon in the tile. Default by tone: 'info', 'circle-alert' for danger, 'circle-check' for success, 'info' for accent. */
  icon?: IconSource;
  /** What happened, on one line: "The card was declined". */
  title: React.ReactNode;
  /** What to do next, in one or two sentences, under the title in soft ink. */
  children?: React.ReactNode;
  /** Small buttons under the text (size 'xs'): "Try another card", "Pay on delivery". */
  actions?: React.ReactNode;
  /** One button at the end of the row, beside the text, such as a dark "Order a jar" on the accent alert. */
  end?: React.ReactNode;
  /** 'alert' interrupts a screen reader: for an error that appears after an action. 'status' waits its turn. Default 'alert' for danger, 'status' otherwise. */
  role?: 'alert' | 'status';
}

const defaultIcon: Record<AlertTone, IconName> = { neutral: 'info', danger: 'circle-alert', success: 'circle-check', accent: 'info' };

/**
 * An alert is a message that stays in the page until its cause is gone: a tray row with an icon tile, a title and a sentence.
 * It belongs to a page or a card; use a Toast for something that already happened, and a Field error for one field.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert({ tone = 'neutral', icon, title, actions, end, role, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx('tray-alert', tone !== 'neutral' && `tray-alert--${tone}`, className)} role={role ?? (tone === 'danger' ? 'alert' : 'status')} {...rest}>
      <span className="tray-alert__icon">
        <Icon name={icon ?? defaultIcon[tone]} />
      </span>
      <div className="tray-alert__body">
        <p className="tray-alert__title">{title}</p>
        {children != null ? <p className="tray-alert__text">{children}</p> : null}
        {actions != null ? <div className="tray-alert__actions">{actions}</div> : null}
      </div>
      {end}
    </div>
  );
});
Alert.displayName = 'Alert';
