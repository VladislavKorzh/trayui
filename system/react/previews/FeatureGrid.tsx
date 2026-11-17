import { Badge, FeatureGrid, Item } from 'trayui-react';

export function Bento() {
  return (
    <FeatureGrid
      features={[
        {
          icon: 'inbox',
          title: 'One list for every order',
          text: 'From the shop, the phone and the market stall, in the order they must leave.',
          span: 7,
          end: (
            <ul className="tray-items">
              <Item size="sm" title="PL-20431, Dana Kovalenko" end={<Badge>To pack</Badge>} />
              <Item size="sm" title="PL-20418, Ivan Petrenko" end={<Badge tone="ink">With the courier</Badge>} />
            </ul>
          ),
        },
        { icon: 'truck', title: 'The courier knows before you call', text: 'A packed order books its own pickup for the next courier day.', span: 5, tone: 'inverse' },
        { icon: 'receipt-text', title: 'Labels that print themselves', text: "One label per box, with the courier's code on it.", span: 4 },
        { icon: 'package', title: 'Stock by batch', text: 'Know how many jars of the autumn batch are left.', span: 4 },
        { icon: 'users', title: 'A screen for the people who pack', text: "Today's orders on a phone, one tap to mark each done.", span: 4 },
      ]}
    />
  );
}

export function TwoByTwo() {
  return (
    <FeatureGrid
      features={[
        { icon: 'chart-column', title: 'See which jars sell', text: 'The 50 g jar outsold the 30 g by two to one in October.', span: 8 },
        { icon: 'bell', title: 'Know when stock runs low', text: 'A note when a batch has ten jars left.', span: 4 },
        { icon: 'receipt-text', title: 'Invoices without typing', text: "Every order makes its own invoice, in your shop's name.", span: 5, tone: 'inverse' },
        { icon: 'calendar', title: 'Courier days you choose', text: 'Orders after the cut-off wait for the next courier day.', span: 7 },
      ]}
    />
  );
}
