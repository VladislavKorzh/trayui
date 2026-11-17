---
category: Account
keywords: [team members, members, people, users, roles, workspace members, seats, invitations]
---
# Team Members

Team members is the table of people in a workspace: who they are, their role, whether they have joined, and when they were last seen.

## Use
```tsx
<TeamMembers
  title="Team"
  description="4 of 5 seats are taken."
  action={<Button size="sm" icon="user-plus">Invite people</Button>}   /* opens the Invite Form */
  roles={['Owner', 'Manager', 'Packer', 'Viewer']}
  members={[
    { name: 'Oksana Franko', email: 'oksana@perly.example', role: 'Owner', lastSeen: 'Now', you: true, locked: true },
    { name: 'Bohdan Savchuk', email: 'bohdan@perly.example', role: 'Packer', lastSeen: 'Today, 08:30' },
    { name: 'Andriy Tkachuk', email: 'andriy@perly.example', role: 'Packer', status: 'invited' },
  ]}
  onRoleChange={(member, role) => saveRole(member, role)}
  onRemove={(member) => askToRemove(member)}
  onResend={(member) => resend(member)}
/>
```

## Parts
Each row starts with the person: a small Avatar, the name in bold and the email under it. The role is a small Native Select named with the person ("Role of Bohdan Savchuk"). `you` adds "(you)" and an ink avatar; `locked` shows the role as text with no remove button, for the owner. An invitation that has not been accepted (`status: 'invited'`) shows "Invited" and offers "Send again" in place of the last-seen time.

Above the table go the seats in words and the button that opens the Invite Form.

## Behaviour
A role change calls `onRoleChange` at once: save it and confirm with a Toast. The remove button calls `onRemove`: ask first, in an Alert Dialog that names the person.

## Do and don't
- Do mark the signed-in person with "(you)" and show the owner's role as text: it cannot be changed here.
- Do save a role change at once and confirm it with a Toast.
- Don't let the last owner be removed or demoted.
- Don't show avatars without names.
