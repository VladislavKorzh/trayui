import { Footer } from 'trayui-react';

export function FourColumns() {
  return (
    <Footer
      style={{ paddingBlockStart: 'var(--space-4)' }}
      brand="Counter"
      brandHref="#"
      tagline="The order desk for small farms and food makers."
      columns={[
        {
          title: 'Product',
          links: [
            { label: 'Features', href: '#' },
            { label: 'Pricing', href: '#' },
            { label: 'What is new', href: '#' },
            { label: 'Status', href: '#' },
          ],
        },
        {
          title: 'Help',
          links: [
            { label: 'Getting started', href: '#' },
            { label: 'Guides', href: '#' },
            { label: 'Contact us', href: '#' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About', href: '#' },
            { label: 'Field notes', href: '#' },
            { label: 'Work with us', href: '#' },
          ],
        },
        {
          title: 'Developers',
          links: [
            { label: 'API reference', href: '#' },
            { label: 'Webhooks', href: '#' },
          ],
        },
      ]}
      copyright="© 2026 Counter. An invented product for these examples."
      legal={[
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'Cookies', href: '#' },
      ]}
    />
  );
}

export function TwoColumns() {
  return (
    <Footer
      style={{ paddingBlockStart: 'var(--space-4)' }}
      brand="Perly Farm"
      brandHref="#"
      tagline="Snail caviar from our own farm, in jars of 30, 50 and 100 g."
      columns={[
        {
          title: 'Shop',
          links: [
            { label: 'All jars', href: '#' },
            { label: 'Gift boxes', href: '#' },
            { label: 'Delivery', href: '#' },
          ],
        },
        {
          title: 'Farm',
          links: [
            { label: 'How we farm', href: '#' },
            { label: 'Field notes', href: '#' },
            { label: 'Contact', href: '#' },
          ],
        },
      ]}
      copyright="© 2026 Perly Farm. An invented farm for these examples."
      legal={[
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
      ]}
    />
  );
}
