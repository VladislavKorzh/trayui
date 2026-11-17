import { Card, Skeleton } from 'trayui-react';

export function ListAndCard() {
  return (
    <div className="tray-bento" aria-busy="true">
      <span className="tray-vh">Loading orders</span>
      <div className="tray-stack tray-span-6" aria-hidden="true">
        <div className="tray-row" style={{ gap: 'var(--space-3)', flexWrap: 'nowrap' }}>
          <Skeleton shape="avatar" />
          <div className="tray-stack tray-stack--sm" style={{ flex: 1 }}>
            <Skeleton shape="text" width="60%" height={16} />
            <Skeleton shape="text" width="35%" height={12} />
          </div>
        </div>
        <Skeleton shape="text" height={14} />
        <Skeleton shape="text" width="88%" height={14} />
        <Skeleton shape="text" width="52%" height={14} />
      </div>
      <Card className="tray-stack tray-span-6" style={{ padding: 'var(--space-6)' }} aria-hidden="true">
        <Skeleton shape="text" width="45%" height={24} />
        <Skeleton height={56} radius="input" />
        <Skeleton width="9rem" height={48} radius="control" />
      </Card>
    </div>
  );
}

export function TableRows() {
  return (
    <div className="tray-stack" aria-busy="true" style={{ maxWidth: 640 }}>
      <span className="tray-vh">Loading the season record</span>
      {[72, 48, 64, 56].map((w, i) => (
        <div key={i} className="tray-row" style={{ flexWrap: 'nowrap' }} aria-hidden="true">
          <Skeleton shape="text" width={`${w * 0.4}%`} height={14} />
          <Skeleton width={72} height={28} radius="chip" />
          <span style={{ flex: 1 }} />
          <Skeleton shape="text" width={56} height={14} />
        </div>
      ))}
    </div>
  );
}
