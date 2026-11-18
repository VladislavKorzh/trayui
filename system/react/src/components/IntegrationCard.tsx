'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { Button } from './Button';
import { Icon } from './Icon';
import { Switch } from './Switch';

export interface IntegrationLink {
  /** The link's words: "Settings", "Compare plans". */
  label: string;
  /** Where it goes: the integration's own settings, or the plans. */
  href: string;
}

export interface IntegrationCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The service, named by what it does for the person: "Courier tracking", "Accounting export". It also names the switch. */
  title: string;
  /** One sentence on what connecting it does, in the person's words: "Sends each paid order to your books at the end of the day." */
  description?: React.ReactNode;
  /** An icon for what the service does, in the 48px tile, when you may not use its logo: 'truck', 'receipt-text', 'mail'. Default 'plug'. */
  icon?: IconSource;
  /** The service's own logo, in place of the icon, when you have the right to use it. */
  logo?: string;
  /**
   * A small quiet button at the end of the head, for a connection that needs the other service: "Connect", "Fix", "Upgrade".
   * Left out, the head holds a Switch that turns the connection on and off in place.
   */
  action?: string;
  /** Called when the `action` button is pressed. */
  onAction?: (event: React.MouseEvent<HTMLElement>) => void;
  /** With no `action`: whether the switch is on, for a controlled card. Pass it with `onCheckedChange`. */
  checked?: boolean;
  /** With no `action`: whether the switch starts on, for an uncontrolled card. Default false. */
  defaultChecked?: boolean;
  /** Called with the new state the moment the switch moves. Save it then: the switch has no submit button. */
  onCheckedChange?: (checked: boolean) => void;
  /** The state in words at the foot: "On since 2 November", "Not connected", "On the Market plan". */
  status?: React.ReactNode;
  /** A failed connection, said plainly, with what to do: "The address needs to be confirmed again". It replaces `status`, in danger with an icon. */
  error?: React.ReactNode;
  /** A link at the end of the foot: the integration's settings, or the plans that have it. */
  link?: IntegrationLink;
}

/**
 * An integration card stands for one outside service the product can work with: its mark, its name, what connecting it does,
 * and the control that connects it. Put several in a `<div className="tray-integrations">`, a grid of cards at least 17rem wide that fill the row.
 */
export const IntegrationCard = React.forwardRef<HTMLElement, IntegrationCardProps>(function IntegrationCard(
  { title, description, icon = 'plug', logo, action, onAction, checked, defaultChecked, onCheckedChange, status, error, link, className, ...rest },
  ref,
) {
  return (
    <article ref={ref} className={cx('tray-integration', className)} {...rest}>
      <div className="tray-integration__head">
        <span className="tray-integration__icon">{logo ? <img src={logo} alt="" /> : <Icon name={icon} />}</span>
        {action != null ? (
          // the same word is on every card, so the name holds the service too, after the word: "Connect Chat alerts"
          <Button variant="quiet" size="xs" aria-label={`${action} ${title}`} onClick={onAction}>
            {action}
          </Button>
        ) : (
          <Switch
            aria-label={title}
            checked={checked}
            defaultChecked={checked === undefined ? defaultChecked : undefined}
            onCheckedChange={onCheckedChange}
          />
        )}
      </div>
      <div className="tray-integration__text">
        <b>{title}</b>
        {description != null ? <p>{description}</p> : null}
      </div>
      {status != null || error != null || link ? (
        <div className="tray-integration__foot">
          {error != null ? (
            <span className="tray-danger">
              <Icon name="circle-alert" size="sm" /> {error}
            </span>
          ) : (
            <span>{status}</span>
          )}
          {link ? (
            <a href={link.href} aria-label={`${link.label} for ${title}`}>
              {link.label}
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
});
IntegrationCard.displayName = 'IntegrationCard';
