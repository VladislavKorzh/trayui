---
category: App shell
keywords: [user menu, account menu, profile menu, avatar menu, sign out, log out, theme toggle]
---
# User Menu

The user menu opens from the avatar at the end of the top bar: who is signed in, then the account's pages, the theme, help and signing out.

## Use
```tsx
<UserMenu
  name="Oksana Franko" email="oksana@perly.example"         // initials come from the name, or pass initials / src
  items={[
    { label: 'Profile', icon: 'user', href: '/profile' },
    { label: 'Billing', icon: 'credit-card', href: '/billing', shortcut: 'Shop plan' },   // a muted note at the end
    { type: 'checkbox', label: 'Dark theme', icon: 'moon', checked: dark, onCheckedChange: setDark },
    { type: 'separator' },
    { label: 'Help', icon: 'life-buoy', href: '/help' },
    { label: 'Sign out', icon: 'log-out', onSelect: signOut },
  ]}
/>

<TopBar title="Orders" end={<UserMenu name="Oksana Franko" items={account} />} />   {/* its place */}
```

## Parts
- **Avatar**: a button named "Account: Oksana Franko, OF": the initials it shows end its name, so a person who says what they see reaches it (WCAG 2.5.3). With a photo it is "Account: Oksana Franko".
- **Head**: the person again, with their name in bold over their e-mail, then a rule.
- **Items** (`items`): the Dropdown Menu's items. Actions close the menu and report through `onSelect`; a checkbox item such as "Dark theme" stays open and reports through `onCheckedChange`. Set `data-theme="dark"` on the page there.

It opens at the avatar's end edge (`align="end"`), for the end of the top bar. `open`, `defaultOpen` and `onOpenChange` hold or follow the open state.

## Do and don't
- Do order the menu: the person, their pages, preferences, help, sign out last.
- Do show the e-mail, so a person with two accounts can tell them apart.
- Don't colour "Sign out" red. It destroys nothing.
- Don't put workspace settings here: they sit in the sidebar.
