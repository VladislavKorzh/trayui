---
category: Billing
keywords: [invoice list, invoices, billing history, receipts, payments, statements, download invoice]
---
# Invoice List

The invoice list is the table of past invoices: number, date, amount, whether it was paid, and a button to download each.

## Use
```tsx
<InvoiceList
  invoices={[
    { number: 'CN-0043', date: '1 December 2026', status: 'due', amount: '$39.00', href: '/invoices/CN-0043.pdf' },
    { number: 'CN-0042', date: '1 November 2026', status: 'paid', amount: '$39.00', href: '/invoices/CN-0042.pdf' },
    { number: 'CN-0041', date: '1 October 2026', status: 'failed', amount: '$29.00' },   // "Pay now" instead
  ]}
  onPay={(invoice) => retry(invoice.number)}
/>

<InvoiceList caption={null} aria-label="Invoices" compact invoices={invoices} />      {/* inside a titled Card */}
```

## Parts
It is a Table with the caption "Invoices". The invoice number heads each row; the amount is right-aligned in tabular figures. The status is a Badge with an icon and a word: 'paid' ("Paid", success), 'due' ("Due"), 'failed' ("Failed", danger). Each row ends with a ghost download button named after its invoice; a failed invoice gets a quiet "Pay now" button in its place.

Give each invoice an `href` to its PDF, or handle `onDownload`. For more than a year of invoices, put a Pagination under the table rather than a long scroll.

## Do and don't
- Do right-align the amounts and keep them in tabular figures.
- Do name each download button with its invoice number (it is done for you).
- Don't open the PDF in the same tab without saying so.
- Don't show refunds as negative invoices without the word "Refund".
