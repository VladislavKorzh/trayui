'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx, useTrayEvent, useBehaviour, useForwardedRef } from '../lib/util';
import { Button } from './Button';
import { Icon } from './Icon';

export type BannerTone = 'tray' | 'accent' | 'inverse' | 'danger';

export interface BannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * 'tray' (the default): news that needs no action. 'accent' is yellow: the one thing the account should do next, at most one on a page.
   * 'inverse' is ink: the product speaking, such as maintenance or a new version. 'danger' reports a problem: the icon and the fact turn red and it is announced at once.
   */
  tone?: BannerTone;
  /** The icon at the start: 'clock' for a trial, 'megaphone' for news, 'settings' for maintenance, 'circle-alert' for a problem. */
  icon?: IconSource;
  /** The fact, in bold, first: "The trial ends in 5 days." */
  title?: React.ReactNode;
  /** What to do about it, one sentence after the fact: "Choose a plan to keep your orders." */
  children?: React.ReactNode;
  /** One action at most, as a small button: `<Button variant="dark" size="xs" href="/billing">Choose a plan</Button>` on yellow, or a link. */
  action?: React.ReactNode;
  /** Adds a close button that hides the banner. Remember the dismissal in `onDismiss`, so it does not come back. */
  dismissible?: boolean;
  /** Called when the close button hides the banner. */
  onDismiss?: () => void;
  /** The close button's name for screen readers. Default 'Dismiss'. */
  dismissLabel?: string;
  /** Square corners and centred text, for a banner across the very top of the window. */
  edge?: boolean;
}

/**
 * A banner is one line across the top of a page or a section, about the whole product or the whole account: a trial that is ending, planned maintenance, a payment that failed.
 * Show one at a time, the most urgent. The result of what the person just did is a Toast; a problem in one section is an Alert.
 */
export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(function Banner(
  { tone = 'tray', icon, title, children, action, dismissible, onDismiss, dismissLabel = 'Dismiss', edge, role, className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef(forwarded);
  // The system's `dismiss` behaviour hides the banner (it owns `hidden`) and reports tray:close on it.
  useTrayEvent(ref, 'close', () => onDismiss?.(), { own: true });
  useBehaviour(ref, [dismissible]);
  const danger = tone === 'danger';
  const close = dismissible ? <Button variant="ghost" size="xs" icon="x" aria-label={dismissLabel} data-tray="dismiss" /> : null;
  const tail = action != null || close ? (
    edge ? (
      <>
        {action}
        {close}
      </>
    ) : (
      <div className="tray-banner__actions">
        {action}
        {close}
      </div>
    )
  ) : null;
  return (
    <div
      ref={ref}
      className={cx('tray-banner', tone === 'accent' && 'tray-island', tone === 'inverse' && 'tray-inverse', edge && 'tray-banner--edge', className)}
      role={role ?? (danger ? 'alert' : 'status')}
      data-dismissable={dismissible ? '' : undefined}
      {...rest}
    >
      {icon ? <Icon name={icon} className={danger ? 'tray-danger' : undefined} /> : null}
      <p className="tray-banner__text">
        {title != null ? (
          <>
            <b className={danger ? 'tray-danger' : undefined}>{title}</b>
            {children != null ? ' ' : null}
          </>
        ) : null}
        {children}
      </p>
      {tail}
    </div>
  );
});
Banner.displayName = 'Banner';
