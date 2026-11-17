import * as React from 'react';
import { PricingTable, type BillingPeriod, type PricingPlan } from 'trayui-react';

const plans: PricingPlan[] = [
  {
    id: 'stall',
    name: 'Stall',
    price: '$0',
    per: 'forever',
    text: 'For a first season at the market.',
    action: 'Start free',
    href: '#',
    features: ['50 orders a month', 'One person', 'Printable labels', { text: 'No courier tracking', off: true }],
  },
  {
    id: 'shop',
    name: 'Shop',
    badge: 'Most chosen',
    featured: true,
    price: { monthly: '$29', yearly: '$24' },
    per: { monthly: 'a month', yearly: 'a month, billed yearly' },
    text: 'For a farm that ships every day.',
    action: 'Start with Shop',
    href: '#',
    features: ['1,000 orders a month', 'Five people', 'Courier tracking', 'Exports to a spreadsheet'],
  },
  {
    id: 'market',
    name: 'Market',
    price: { monthly: '$79', yearly: '$66' },
    per: { monthly: 'a month', yearly: 'a month, billed yearly' },
    text: 'For several farms under one roof.',
    action: 'Start with Market',
    href: '#',
    features: ['Unlimited orders', 'Twenty people, with roles', 'Several workspaces', 'The API and webhooks'],
  },
];

export function Plans() {
  return (
    <div className="tray-stack">
      <PricingTable plans={plans} periodNote="Two months free on yearly" />
      <p className="tray-demo-note">Counter and its plans are invented for these examples.</p>
    </div>
  );
}

export function YearlyControlled() {
  const [period, setPeriod] = React.useState<BillingPeriod>('yearly');
  return (
    <div className="tray-stack">
      <PricingTable plans={plans.slice(1)} period={period} onPeriodChange={setPeriod} periodNote="Two months free on yearly" />
      <p className="tray-demo-note">Showing {period} prices. Counter and its plans are invented for these examples.</p>
    </div>
  );
}
