import * as React from 'react';
import { UserMenu, type MenuItem } from 'trayui-react';

export function Open() {
  return (
    <div className="tray-row" style={{ justifyContent: 'flex-end', alignItems: 'flex-start', minBlockSize: 470, paddingInlineEnd: 'var(--space-6)' }}>
      <UserMenu
        name="Oksana Franko"
        email="oksana@perly.example"
        defaultOpen
        items={[
          { label: 'Profile', icon: 'user', href: '#' },
          { label: 'Billing', icon: 'credit-card', href: '#', shortcut: 'Shop plan' },
          { label: 'Settings', icon: 'settings', href: '#' },
          { type: 'checkbox', label: 'Dark theme', icon: 'moon' },
          { type: 'separator' },
          { label: 'Help', icon: 'life-buoy', href: '#' },
          { label: 'Sign out', icon: 'log-out' },
        ]}
      />
    </div>
  );
}

export function ThemeAndSignOut() {
  const [dark, setDark] = React.useState(true);
  const [said, setSaid] = React.useState('');
  const items: MenuItem[] = [
    { label: 'Profile', icon: 'user', href: '#' },
    { type: 'checkbox', label: 'Dark theme', icon: 'moon', checked: dark, onCheckedChange: setDark },
    { type: 'separator' },
    { label: 'Sign out', icon: 'log-out', value: 'sign-out' },
  ];
  return (
    <div className="tray-row tray-row--between" style={{ alignItems: 'flex-start', minBlockSize: 330, paddingInlineEnd: 'var(--space-6)' }}>
      <p className="tray-soft" style={{ maxInlineSize: '30rem' }}>
        {said || `The page holds the theme item: it is ${dark ? 'on' : 'off'}. In a product it sets data-theme on the page.`}
      </p>
      <UserMenu
        name="Dana Kovalenko"
        email="dana@perly.example"
        initials="DK"
        defaultOpen
        items={items}
        onSelect={(value) => setSaid(value === 'sign-out' ? 'Dana would be signed out now.' : `Chose ${value}.`)}
      />
    </div>
  );
}
