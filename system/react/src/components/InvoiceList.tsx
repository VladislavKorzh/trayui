'use client';
import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { Badge, type BadgeTone } from './Badge';
import { Button } from './Button';
import { Table, type TableColumn, type TableProps, type TableRow } from './Table';

/** Whether an invoice was paid. */
export type InvoiceStatus = 'paid' | 'due' | 'failed';

/** One past or coming invoice. */
export interface Invoice {
  /** The invoice number, the row's head: "CN-0042". */
  number: string;
  /** The date, in full: "1 November 2026". */
  date: React.ReactNode;
  /** 'paid' ('circle-check', success), 'due' ('clock', neutral) or 'failed' ('circle-x', danger). Always an icon and a word. */
  status: InvoiceStatus;
  /** The amount, right-aligned in tabular figures: "$39.00". A refund says "Refund" in words, never only a minus. */
  amount: React.ReactNode;
  /** The PDF's address, for the download button. Say in the page when it opens in a new tab. */
  href?: string;
  /** For a failed invoice: where "Pay now" goes. Without it the button calls `onPay`. */
  payHref?: string;
}

export interface InvoiceListProps extends Omit<TableProps, 'columns' | 'rows' | 'rowKey' | 'footer' | 'children'> {
  /** The invoices, newest first. For more than a year of them, put a Pagination under the table rather than a long scroll. */
  invoices: Invoice[];
  /** The table's title above it. Default "Invoices". Pass `null` and an `aria-label` when a heading already names it. */
  caption?: React.ReactNode;
  /** Called with an invoice when its download button is pressed and it has no `href`. */
  onDownload?: (invoice: Invoice) => void;
  /** Called with a failed invoice when its "Pay now" button is pressed and it has no `payHref`. */
  onPay?: (invoice: Invoice) => void;
  /** The column heads, in order: invoice, date, status, amount, and the hidden head of the buttons. */
  headers?: { number?: string; date?: string; status?: string; amount?: string; action?: string };
  /** The status words. Default "Paid", "Due", "Failed". */
  statusLabels?: Partial<Record<InvoiceStatus, string>>;
  /** The words of the button on a failed invoice. Default "Pay now". */
  payLabel?: string;
}

const STATUS: Record<InvoiceStatus, { tone: BadgeTone; icon: IconSource; text: string }> = {
  paid: { tone: 'success', icon: 'circle-check', text: 'Paid' },
  due: { tone: 'neutral', icon: 'clock', text: 'Due' },
  failed: { tone: 'danger', icon: 'circle-x', text: 'Failed' },
};

/**
 * The invoice list is the table of past invoices: number, date, amount, whether it was paid, and a button to download each.
 * A failed invoice gets a "Pay now" button in place of the download. It is a Table: `className`, `aria-label` and the ref go to the `<table>`.
 */
export const InvoiceList = React.forwardRef<HTMLTableElement, InvoiceListProps>(function InvoiceList(
  { invoices, caption = 'Invoices', onDownload, onPay, headers, statusLabels, payLabel = 'Pay now', ...rest },
  ref,
) {
  const columns: TableColumn[] = [
    { key: 'number', header: headers?.number ?? 'Invoice', rowHeader: true },
    { key: 'date', header: headers?.date ?? 'Date' },
    {
      key: 'status',
      header: headers?.status ?? 'Status',
      render: (_row, i) => {
        const status = invoices[i].status;
        const s = STATUS[status];
        return (
          <Badge tone={s.tone} icon={s.icon}>
            {statusLabels?.[status] ?? s.text}
          </Badge>
        );
      },
    },
    { key: 'amount', header: headers?.amount ?? 'Amount', numeric: true },
    {
      key: 'action',
      header: <span className="tray-vh">{headers?.action ?? 'Action'}</span>,
      numeric: true,
      render: (_row, i) => {
        const inv = invoices[i];
        if (inv.status === 'failed') {
          return (
            <Button variant="quiet" size="xs" href={inv.payHref} onClick={inv.payHref === undefined && onPay ? () => onPay(inv) : undefined}>
              {payLabel}
            </Button>
          );
        }
        if (inv.href === undefined && !onDownload) return null;
        return (
          <Button
            variant="ghost"
            size="xs"
            icon="download"
            href={inv.href}
            onClick={inv.href === undefined && onDownload ? () => onDownload(inv) : undefined}
            aria-label={`Download invoice ${inv.number}`}
          />
        );
      },
    },
  ];
  const rows: TableRow[] = invoices.map((inv) => ({ number: inv.number, date: inv.date, amount: inv.amount }));
  return <Table ref={ref} caption={caption} columns={columns} rows={rows} rowKey="number" {...rest} />;
});
InvoiceList.displayName = 'InvoiceList';
