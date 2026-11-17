import { Avatar, Badge, HoverCard } from 'trayui-react';

export function Person() {
  return (
    <div style={{ minBlockSize: 260 }}>
      <p>
        Packed by{' '}
        <HoverCard defaultOpen trigger={<a href="#">Oksana Franko</a>}>
          <span className="tray-stack" style={{ display: 'grid' }}>
            <span className="tray-row tray-row--sm" style={{ gap: 'var(--space-3)' }}>
              <Avatar initials="OF" size="lg" />
              <span>
                <span className="control" style={{ display: 'block' }}>Oksana Franko</span>
                <span className="caption tray-muted">Farm manager, since 2021</span>
              </span>
            </span>
            <span className="tray-pop__text" style={{ display: 'block' }}>Runs the night walks and signs off every batch before it is packed.</span>
            <span className="tray-row tray-row--sm"><span className="tray-chip">Bed A</span><span className="tray-chip">Bed B</span></span>
          </span>
        </HoverCard>{' '}
        on 14 November.
      </p>
    </div>
  );
}

export function Order() {
  return (
    <div style={{ minBlockSize: 180 }}>
      <p>
        Dana Kovalenko asked about{' '}
        <HoverCard defaultOpen trigger={<a href="#">PL-20431</a>}>
          <span className="tray-stack tray-stack--sm">
            <span className="tray-row tray-row--between">
              <span className="tray-pop__title">PL-20431</span>
              <Badge tone="success" icon="circle-check">Paid</Badge>
            </span>
            <span className="tray-pop__text">3 jars of 50 g to Kyiv. It leaves with today's courier.</span>
          </span>
        </HoverCard>{' '}
        this morning.
      </p>
    </div>
  );
}
