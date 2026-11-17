import * as React from 'react';
import { Button, TeamMembers, type TeamMember } from 'trayui-react';

const team: TeamMember[] = [
  { name: 'Oksana Franko', email: 'oksana@perly.example', role: 'Owner', lastSeen: 'Now', you: true, locked: true },
  { name: 'Bohdan Savchuk', email: 'bohdan@perly.example', role: 'Packer', lastSeen: 'Today, 08:30' },
  { name: 'Daryna Koval', email: 'daryna@perly.example', role: 'Manager', lastSeen: '12 November' },
  { name: 'Andriy Tkachuk', email: 'andriy@perly.example', role: 'Packer', status: 'invited' },
];

export function Team() {
  return (
    <TeamMembers
      title="Team"
      description="4 of 5 seats are taken."
      action={<Button size="sm" icon="user-plus">Invite people</Button>}
      members={team}
    />
  );
}

export function RolesThatSave() {
  const [members, setMembers] = React.useState(team.slice(0, 3));
  const [note, setNote] = React.useState('Change a role: it saves at once.');
  return (
    <div className="tray-stack">
      <TeamMembers
        members={members}
        onRoleChange={(m, role) => {
          setMembers((all) => all.map((x) => (x.email === m.email ? { ...x, role } : x)));
          setNote(`${m.name} is now ${role.toLowerCase()}.`);
        }}
        onRemove={(m) => setNote(`Remove ${m.name}? Ask first, in an Alert Dialog.`)}
      />
      <p className="tray-demo-note" role="status">{note}</p>
    </div>
  );
}
