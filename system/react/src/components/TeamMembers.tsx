import * as React from 'react';
import { cx, useUid } from '../lib/util';
import { SectionHead } from '../lib/account';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { NativeSelect } from './NativeSelect';
import { Table } from './Table';

export interface TeamMember {
  /** Tells the people apart, for React keys and your handlers. Default: the email. */
  id?: string;
  /** The person's name: "Bohdan Savchuk". */
  name: string;
  /** Their email, in muted type under the name. */
  email: string;
  /** One or two initials for the avatar. Default: the first letters of the first two words of the name. */
  initials?: string;
  /** A photo for the avatar, in place of the initials. */
  avatar?: string;
  /** Their role: one of `roles`. */
  role: string;
  /** 'active' (the default) has joined; 'invited' has not accepted yet: the row shows "Invited" and offers "Send again" in place of the last-seen time. */
  status?: 'active' | 'invited';
  /** When they were last seen: "Now", "Today, 08:30", "12 November". */
  lastSeen?: React.ReactNode;
  /** Marks the signed-in person: "(you)" after the name and an ink avatar. */
  you?: boolean;
  /** Shows the role as text and offers no remove button: the owner, whose role cannot be changed here. */
  locked?: boolean;
}

export interface TeamMembersProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The people, one row each. */
  members: TeamMember[];
  /** The roles offered in each person's role menu. Default Owner, Manager, Packer, Viewer. */
  roles?: string[];
  /** The title above the table: "Team". */
  title?: React.ReactNode;
  /** One line under the title, the seats in words: "4 of 5 seats are taken." */
  description?: React.ReactNode;
  /** The button at the end of the head that opens the Invite Form: `<Button size="sm" icon="user-plus">Invite people</Button>`. */
  action?: React.ReactNode;
  /** Called with the person and the new role the moment a role menu changes. Save it at once and confirm with a Toast. Never let the last owner be demoted. */
  onRoleChange?: (member: TeamMember, role: string) => void;
  /** Called when a person's remove button is pressed. Ask first, in an Alert Dialog that names them. */
  onRemove?: (member: TeamMember) => void;
  /** Called when "Send again" is pressed on an invitation. */
  onResend?: (member: TeamMember) => void;
  /** The words of an invited person's link. Default "Send again". */
  resendLabel?: string;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/**
 * Team members is the table of people in a workspace: who they are, their role, whether they have joined, and when they were last seen.
 * Each person's role is a small menu that saves at once; an invitation not yet accepted shows "Invited" and offers "Send again".
 */
export const TeamMembers = React.forwardRef<HTMLDivElement, TeamMembersProps>(function TeamMembers(
  { members, roles = ['Owner', 'Manager', 'Packer', 'Viewer'], title, description, action, onRoleChange, onRemove, onResend, resendLabel = 'Send again', className, ...rest },
  ref,
) {
  const headId = useUid('team');
  return (
    <div ref={ref} className={cx('tray-stack', className)} {...rest}>
      <SectionHead id={headId} title={title} description={description} action={action} />
      <Table aria-labelledby={title != null ? headId : undefined} aria-label={title == null ? 'Team members' : undefined}>
        <thead>
          <tr>
            <th scope="col">Person</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Last seen</th>
            <th scope="col">
              <span className="tray-vh">Remove</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const invited = m.status === 'invited';
            const name = m.you ? `${m.name} (you)` : m.name;
            return (
              <tr key={m.id ?? m.email}>
                <th scope="row">
                  <span className="tray-person">
                    <Avatar size="sm" tone={m.you ? 'ink' : 'tray'} initials={m.initials ?? initialsOf(m.name)} src={m.avatar} />
                    <span className="tray-person__text">
                      <b>{name}</b>
                      <small>{m.email}</small>
                    </span>
                  </span>
                </th>
                <td>
                  {m.locked ? (
                    <span className="tray-soft">{m.role}</span>
                  ) : (
                    <NativeSelect
                      key={m.role}
                      size="sm"
                      style={{ inlineSize: '9.5rem' }}
                      aria-label={`Role of ${m.name}`}
                      options={roles.includes(m.role) ? roles : [...roles, m.role]}
                      defaultValue={m.role}
                      onChange={(e) => onRoleChange?.(m, e.target.value)}
                    />
                  )}
                </td>
                <td>{invited ? <Badge tone="off">Invited</Badge> : <Badge>Active</Badge>}</td>
                <td className="tray-soft">
                  {invited ? (
                    <Button variant="link" style={{ minBlockSize: 0 }} onClick={() => onResend?.(m)}>
                      {resendLabel}
                      {/* every invitation has the same link: its name says whose it is */}
                      <span className="tray-vh"> to {m.name}</span>
                    </Button>
                  ) : (
                    m.lastSeen
                  )}
                </td>
                <td data-num="">
                  {m.locked ? null : <Button variant="ghost" size="xs" icon="trash-2" aria-label={`Remove ${m.name}`} onClick={() => onRemove?.(m)} />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
});
TeamMembers.displayName = 'TeamMembers';
