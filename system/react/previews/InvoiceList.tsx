import { Card, InvoiceList } from 'trayui-react';

export function Invoices() {
  return (
    <InvoiceList
      invoices={[
        { number: 'CN-0043', date: '1 December 2026', status: 'due', amount: '$39.00', href: '#' },
        { number: 'CN-0042', date: '1 November 2026', status: 'paid', amount: '$39.00', href: '#' },
        { number: 'CN-0041', date: '1 October 2026', status: 'failed', amount: '$29.00', payHref: '#' },
        { number: 'CN-0040', date: '1 September 2026', status: 'paid', amount: '$29.00', href: '#' },
      ]}
    />
  );
}

export function CompactInACard() {
  return (
    <Card title="Billing history" description="Perly Farm, Shop plan." style={{ maxWidth: 640 }}>
      <InvoiceList
        caption={null}
        aria-label="Invoices"
        compact
        invoices={[
          { number: 'CN-0039', date: '1 August 2026', status: 'paid', amount: '$29.00', href: '#' },
          { number: 'CN-0038', date: '1 July 2026', status: 'paid', amount: '$29.00', href: '#' },
          { number: 'CN-0037', date: '1 June 2026', status: 'paid', amount: '$29.00', href: '#' },
        ]}
      />
    </Card>
  );
}
