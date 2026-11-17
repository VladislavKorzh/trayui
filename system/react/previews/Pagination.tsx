import * as React from 'react';
import { Pagination } from 'trayui-react';

export function Numbers() {
  return <Pagination pageCount={12} defaultPage={2} href={(p) => '#page-' + p} />;
}

export function Compact() {
  return <Pagination compact label="Pages, compact" pageCount={12} defaultPage={1} href={(p) => '#page-' + p} />;
}

export function WithItemCount() {
  const [page, setPage] = React.useState(6);
  const from = (page - 1) * 20 + 1;
  const to = Math.min(page * 20, 236);
  return (
    <div className="tray-row tray-row--between">
      <p className="tray-soft">
        {from}–{to} of 236 orders
      </p>
      <Pagination pageCount={12} page={page} onPageChange={setPage} />
    </div>
  );
}
