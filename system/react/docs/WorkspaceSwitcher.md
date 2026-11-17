---
category: App shell
keywords: [workspace switcher, team switcher, organization switcher, account switcher, project switcher, tenant picker]
---
# Workspace Switcher

The workspace switcher is the button at the top of the sidebar that says which workspace you are in and opens the list of the others.

## Use
```tsx
<WorkspaceSwitcher
  workspaces={[
    { value: 'perly', name: 'Perly Farm', detail: 'Shop plan' },
    { value: 'meadow', name: 'Meadow Bakery', detail: 'You are a packer here' },
  ]}
  value={workspace} onChange={setWorkspace}          // the menu closes on a choice
  onCreate={startNewWorkspace}                       // "New workspace", after a rule
/>

<Sidebar head={<WorkspaceSwitcher workspaces={workspaces} />} flushHead groups={groups} />   {/* its place */}
```

## Parts
- **Button**: the current workspace's tile in solid ink, its name in bold, and a second line under it (`detail`): the plan, or the person's role there. A chevron at the end.
- **List**: a small heading (`label`, default "Workspaces"), then one row per workspace with its own initials tile; the current one is ink and checked. The last row, after a rule, starts a new workspace (`createLabel`, `onCreate`; `createLabel={false}` leaves it out).

It is a Dropdown Menu: the workspaces are radio items, Enter or the down arrow opens it, the arrows move, Escape closes it. In a collapsed sidebar it shrinks to its tile and keeps the workspace's name for screen readers.

## Do and don't
- Do give each workspace its own initials tile, or its logo with `src`.
- Do end the list with "New workspace", after a rule.
- Don't put account actions (profile, sign out) here. They belong to the User Menu.
- Don't show the switcher to someone who has one workspace and cannot create another: show the name as text.
