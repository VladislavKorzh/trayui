import { Button, Icon, NavigationMenu, type NavigationLink } from 'trayui-react';

const links: NavigationLink[] = [
  {
    label: 'Shop',
    panel: {
      feature: { title: 'White caviar', description: 'Three jar sizes, delivered chilled.', meta: 'From $39', href: '#' },
      links: [
        { label: 'Jars', description: '30, 50 and 100 g', icon: 'shopping-bag', href: '#' },
        { label: 'Gift boxes', description: 'A jar, a card and a note from you', icon: 'heart', href: '#' },
        { label: 'Delivery and pickup', description: 'Courier in a chilled box, or the farm shop', icon: 'truck', href: '#' },
      ],
    },
  },
  { label: 'The farm', href: '#' },
  { label: 'Field notes', href: '#', current: true },
  { label: 'Questions', href: '#' },
];

function ThemeToggle() {
  return (
    <button className="tray-toggle tray-toggle--icon" type="button" data-tray="toggle" aria-pressed="false" aria-label="Dark theme">
      <span data-when="off">
        <Icon name="moon" />
      </span>
      <span data-when="on">
        <Icon name="sun" />
      </span>
    </button>
  );
}

export function ShopOpen() {
  return (
    <div className="tray-stage tray-stage--page tray-stage--start" style={{ minHeight: 340, padding: 0 }}>
      <NavigationMenu
        style={{ width: '100%' }}
        brand="Perly"
        brandHref="#"
        links={links}
        defaultOpen="Shop"
        actions={
          <>
            <ThemeToggle />
            <Button size="sm" href="#">Order a jar</Button>
          </>
        }
      />
    </div>
  );
}

export function Closed() {
  return (
    <NavigationMenu
      brand="Perly"
      brandHref="#"
      links={[
        { label: 'Shop', href: '#', current: true },
        { label: 'The farm', href: '#' },
        { label: 'Field notes', href: '#' },
        { label: 'Questions', href: '#' },
      ]}
      actions={<Button size="sm" href="#">Order a jar</Button>}
    />
  );
}

export function ListPanel() {
  return (
    <div className="tray-stage tray-stage--page tray-stage--start" style={{ minHeight: 300, padding: 0 }}>
      <NavigationMenu
        style={{ width: '100%' }}
        brand="Counter"
        brandHref="#"
        defaultOpen="Product"
        links={[
          {
            label: 'Product',
            panel: {
              links: [
                { label: 'Orders', description: 'Every jar, from cart to doorstep', icon: 'inbox', href: '#' },
                { label: 'Batches', description: 'What was packed, and what is left', icon: 'package', href: '#' },
              ],
            },
          },
          { label: 'Pricing', href: '#' },
          { label: 'Changelog', href: '#' },
        ]}
        actions={
          <>
            <Button size="sm" variant="ghost" href="#">Sign in</Button>
            <Button size="sm" href="#">Start free</Button>
          </>
        }
      />
    </div>
  );
}
