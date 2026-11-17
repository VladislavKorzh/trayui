import * as React from 'react';
import { cx, useControlled } from '../lib/util';
import { Checkbox } from './Checkbox';

export interface NotificationChannel {
  /** The channel's identity in the value: 'email', 'push', 'sms'. */
  key: string;
  /** The column head: "Email", "Push", "Text". For a channel not set up yet, a link such as "Add a phone number", with `disabled`. */
  label: React.ReactNode;
  /** How the channel ends each checkbox's name, after the event: "by email", "by text message". Default "by " and the key. */
  spoken?: string;
  /** Turns off the whole column: a channel the person has not set up. Say so in its head. */
  disabled?: boolean;
}

export interface NotificationEvent {
  /** The event's identity in the value: 'order-new'. */
  key: string;
  /** What happens, worded as an event: "A new order arrives". It also begins each checkbox's name. */
  title: string;
  /** One line under it, in muted type: how often, or why it cannot be turned off. */
  description?: React.ReactNode;
  /** Channels that are always on for this event (a failed payment, a security alert): checked and disabled. Say why in `description`. */
  locked?: string[];
  /** Channels this event cannot use: disabled and empty. */
  unavailable?: string[];
}

export interface NotificationGroup {
  /** The group's heading row: "Orders", "Account". Leave it out for a single group with no heading. */
  label?: React.ReactNode;
  /** The events in the group, one row each. */
  events: NotificationEvent[];
}

/** Which channels are on for each event: `{ 'order-new': ['push'], 'courier-failed': ['email', 'push', 'sms'] }`. */
export type NotificationValue = Record<string, string[]>;

export interface NotificationChange {
  /** The event of the checkbox that changed. */
  event: string;
  /** The channel of the checkbox that changed. */
  channel: string;
  /** Its new state. */
  checked: boolean;
}

export interface NotificationPreferencesProps extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'children' | 'onChange' | 'defaultValue'> {
  /** The ways to be told, across the top: three or four fit. With more, give each event a row of Switches in a Settings Section. */
  channels: NotificationChannel[];
  /** The events down the side, in groups. */
  groups: NotificationGroup[];
  /** The head of the first column. Default "Tell me when". */
  heading?: React.ReactNode;
  /** Which channels are on, for a controlled grid. Pass it with `onChange`. Locked channels count as on whatever it says. */
  value?: NotificationValue;
  /** Which channels are on at first, for an uncontrolled grid. Default none: never pre-check marketing email. */
  defaultValue?: NotificationValue;
  /** Called with the whole new value and the one change, the moment a box is checked or unchecked. Save it then and confirm with a quiet Toast. */
  onChange?: (value: NotificationValue, change: NotificationChange) => void;
}

/**
 * Notification preferences is a grid of checkboxes: what can happen down the side, the ways to be told across the top.
 * Each change saves at once. Every checkbox is named by its row and its column: "A new order arrives, by email".
 * It sits in a wrapper that scrolls sideways on a phone; `className` and the ref go to the `<table>`.
 */
export const NotificationPreferences = React.forwardRef<HTMLTableElement, NotificationPreferencesProps>(function NotificationPreferences(
  { channels, groups, heading = 'Tell me when', value, defaultValue = {}, onChange, className, ...rest },
  ref,
) {
  const [current, setCurrent] = useControlled<NotificationValue>(value, defaultValue);
  const toggle = (event: string, channel: string, checked: boolean) => {
    const on = current[event] ?? [];
    const next = { ...current, [event]: checked ? (on.includes(channel) ? on : [...on, channel]) : on.filter((c) => c !== channel) };
    setCurrent(next);
    onChange?.(next, { event, channel, checked });
  };
  const span = channels.length + 1;
  return (
    <div className="tray-table-wrap">
      <table ref={ref} className={cx('tray-matrix', className)} {...rest}>
        <thead>
          <tr>
            <th scope="col">{heading}</th>
            {channels.map((c) => (
              <th key={c.key} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        {/* a <tbody> per group, headed by a scope="rowgroup" cell that names its own rows */}
        {groups.map((g, gi) => (
          <tbody key={gi}>
            {g.label != null ? (
              <tr className="tray-matrix__group">
                <th scope="rowgroup" colSpan={span}>
                  {g.label}
                </th>
              </tr>
            ) : null}
            {g.events.map((ev) => (
              <tr key={ev.key}>
                <th scope="row">
                  <b>{ev.title}</b>
                  {ev.description != null ? <small>{ev.description}</small> : null}
                </th>
                {channels.map((c) => {
                  const locked = !!ev.locked?.includes(c.key);
                  const off = !!c.disabled || !!ev.unavailable?.includes(c.key);
                  return (
                    <td key={c.key}>
                      <Checkbox
                        aria-label={`${ev.title}, ${c.spoken ?? 'by ' + c.key}`}
                        checked={locked || (!off && !!current[ev.key]?.includes(c.key))}
                        disabled={locked || off}
                        onCheckedChange={(checked) => toggle(ev.key, c.key, checked)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
});
NotificationPreferences.displayName = 'NotificationPreferences';
