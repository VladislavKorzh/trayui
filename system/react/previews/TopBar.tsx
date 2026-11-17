import * as React from 'react';
import { Badge, Button, Card, DropdownMenu, NotificationCenter, TopBar, UserMenu } from 'trayui-react';

export function OverThePage() {
  return (
    <TopBar
      breadcrumb={[{ label: 'Perly Farm', href: '#' }, { label: 'Orders', href: '#' }, { label: 'PL-20431' }]}
      search="Search orders"
      actions={[
        { icon: 'circle-help', label: 'Help' },
        { icon: 'bell', label: 'Notifications', count: 2 },
      ]}
      user={{ name: 'Oksana Franko', initials: 'OF' }}
    />
  );
}

export function OnACard() {
  return (
    <Card style={{ padding: 'var(--space-4) var(--space-5)' }}>
      <TopBar
        back={{ label: 'Back to orders', href: '#' }}
        title="Order PL-20431"
        end={
          <>
            <Button variant="quiet" size="sm" icon="share">Share</Button>
            <DropdownMenu
              variant="quiet"
              aria-label="More actions"
              align="end"
              items={[
                { label: 'Print the label', icon: 'file' },
                { label: 'Duplicate', icon: 'copy' },
              ]}
            />
          </>
        }
      >
        <Badge>To pack</Badge>
      </TopBar>
    </Card>
  );
}

export function WithMenus() {
  const [searches, setSearches] = React.useState(0);
  return (
    <div className="tray-stack" style={{ minBlockSize: 140 }}>
      <TopBar
        title="Customers"
        search="Search customers"
        onSearch={() => setSearches((n) => n + 1)}
        end={
          <>
            <NotificationCenter
              items={[
                { id: 'n1', actor: 'Dana Kovalenko', text: 'placed order PL-20431.', time: '4 minutes ago', initials: 'DK', href: '#', unread: true },
                { id: 'n2', actor: 'Bohdan Savchuk', text: 'joined the workspace as a packer.', time: '12 November', initials: 'BS', href: '#' },
              ]}
            />
            <UserMenu
              name="Oksana Franko"
              email="oksana@perly.example"
              items={[
                { label: 'Profile', icon: 'user', href: '#' },
                { type: 'separator' },
                { label: 'Sign out', icon: 'log-out' },
              ]}
            />
          </>
        }
      />
      <p className="tray-soft">
        {searches ? `The search was opened ${searches === 1 ? 'once' : searches + ' times'}: here it would open the Command panel.` : 'Press / or the search button: in a product it opens the Command panel.'} The bell and the avatar open their panels.
      </p>
    </div>
  );
}
