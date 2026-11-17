import { BillingSummary, Button } from 'trayui-react';

export function Active() {
  return (
    <BillingSummary
      plan="Shop"
      status="Active"
      price="$29"
      per="a month"
      renewal="Renews on 1 December 2026."
      actions={
        <>
          <Button size="md" href="#">Change plan</Button>
          <Button variant="ghost" size="md">Cancel plan</Button>
        </>
      }
      invoice={[
        { label: 'Date', value: '1 December 2026' },
        { label: 'Shop plan', value: '$29.00', numeric: true },
        { label: 'Two extra seats', value: '$10.00', numeric: true },
        { label: 'Total', value: '$39.00', numeric: true, strong: true },
        { label: 'Paid with', value: 'Card ending 4242' },
      ]}
      invoiceActions={
        <>
          <Button variant="quiet" size="sm" href="#">Change the card</Button>
          <Button variant="ghost" size="sm" href="#">All invoices</Button>
        </>
      }
    />
  );
}

export function TrialEnding() {
  return (
    <BillingSummary
      style={{ maxWidth: 440 }}
      plan="Market"
      status="Trial, 5 days left"
      price="$79"
      per="a month"
      renewal="The first charge is on 20 November 2026."
      actions={
        <>
          <Button size="md" href="#">Add a card</Button>
          <Button variant="ghost" size="md">Compare plans</Button>
        </>
      }
    />
  );
}
