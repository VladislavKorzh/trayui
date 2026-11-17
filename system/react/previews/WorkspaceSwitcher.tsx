import * as React from 'react';
import { Card, WorkspaceSwitcher, type Workspace } from 'trayui-react';

const workspaces: Workspace[] = [
  { value: 'perly', name: 'Perly Farm', detail: 'Shop plan' },
  { value: 'meadow', name: 'Meadow Bakery', detail: 'You are a packer here' },
  { value: 'hill', name: 'Hill Cheese', detail: 'Free plan' },
];

export function Open() {
  return (
    <div className="tray-row" style={{ alignItems: 'flex-start', minBlockSize: 340 }}>
      <Card style={{ inlineSize: '19rem', padding: 'var(--space-4)', borderRadius: 'var(--radius-panel)' }}>
        <WorkspaceSwitcher workspaces={workspaces} defaultValue="perly" defaultOpen />
      </Card>
      <div className="tray-stack" style={{ inlineSize: '19rem' }}>
        <p className="caption tray-muted">On the page, and for a person with a role</p>
        <WorkspaceSwitcher workspaces={workspaces} defaultValue="meadow" createLabel={false} />
      </div>
    </div>
  );
}

export function Controlled() {
  const [workspace, setWorkspace] = React.useState('perly');
  const name = workspaces.find((w) => w.value === workspace)?.name;
  return (
    <div className="tray-row" style={{ alignItems: 'center' }}>
      <Card style={{ inlineSize: '19rem', padding: 'var(--space-4)', borderRadius: 'var(--radius-panel)' }}>
        <WorkspaceSwitcher workspaces={workspaces} value={workspace} onChange={setWorkspace} />
      </Card>
      <p className="tray-soft" style={{ maxInlineSize: '24rem' }}>
        {name} is open. Choose another workspace from the list: the menu closes and the page would load that workspace.
      </p>
    </div>
  );
}
