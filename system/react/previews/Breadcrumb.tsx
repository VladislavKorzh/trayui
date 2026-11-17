import { Breadcrumb } from 'trayui-react';

export function Trail() {
  return (
    <Breadcrumb
      items={[
        { label: 'Orders', href: '#' },
        { label: 'November', href: '#' },
        { label: 'PL-20418' },
      ]}
    />
  );
}

export function Shortened() {
  return (
    <Breadcrumb
      label="Breadcrumb, shortened"
      maxItems={3}
      items={[
        { label: 'Farm', href: '#' },
        { label: 'Beds', href: '#' },
        { label: 'Bed A', href: '#' },
        { label: 'Night walk, 12 June' },
      ]}
    />
  );
}

export function BackLink() {
  return (
    <Breadcrumb
      back
      items={[
        { label: 'Journal', href: '#' },
        { label: 'All field notes', href: '#' },
        { label: 'Night walk, 12 June' },
      ]}
    />
  );
}
