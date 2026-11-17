# Invoice List

The invoice list is the table of past invoices: number, date, amount, whether it was paid, and a button to download each.

## Markup
```html
<div class="tray-table-wrap">
  <table class="tray-table">
    <caption>Invoices</caption>
    <thead><tr>
      <th scope="col">Invoice</th><th scope="col">Date</th><th scope="col">Status</th>
      <th scope="col" data-num>Amount</th><th scope="col"><span class="tray-vh">Download</span></th>
    </tr></thead>
    <tbody><tr>
      <th scope="row">CN-0042</th>
      <td>1 November 2026</td>
      <td><span class="tray-badge tray-badge--success">… Paid</span></td>
      <td data-num>$39.00</td>
      <td data-num><a class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" href="/invoices/CN-0042.pdf" aria-label="Download invoice CN-0042">…</a></td>
    </tr></tbody>
  </table>
</div>
```
It is a Table. The status is a Badge with an icon and a word: `circle-check` "Paid" in `success`, `clock` "Due" in ink, `circle-x` "Failed" in `danger`. A failed invoice gets a "Pay now" button in place of the download.

For more than a year of invoices, put a Pagination under the table rather than a scroll.

## Accessibility
It is a real `<table>`: the `<caption>` names it, and `scope="col"` and `scope="row"` tie each cell to its column and its invoice number. The last column's head is hidden text, so that column is named too. Each download is an icon link whose `aria-label` carries the invoice number ("Download invoice CN-0042"). The status is an icon and a word, so `success` and `danger` are never the only sign.

## Do and don't
- Do right-align the amounts and use tabular numerals (`data-num`).
- Do name each download button with its invoice number.
- Don't open the PDF in the same tab without saying so.
- Don't show refunds as negative invoices without the word "Refund".
