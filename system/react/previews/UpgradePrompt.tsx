import { Table, UpgradePrompt } from 'trayui-react';

const reports = [
  { report: 'By product', period: 'October 2026', orders: '771', revenue: '$16,010' },
  { report: 'By city', period: 'October 2026', orders: '771', revenue: '$16,010' },
  { report: 'By courier', period: 'October 2026', orders: '604', revenue: '$13,280' },
  { report: 'Returning customers', period: 'October 2026', orders: '470', revenue: '$9,930' },
  { report: 'Refunds', period: 'October 2026', orders: '5', revenue: '$148' },
];

export function CardAndAlerts() {
  return (
    <div className="tray-bento" style={{ alignItems: 'start' }}>
      <UpgradePrompt
        className="tray-span-6"
        title="Courier tracking is part of Shop"
        description="See where every box is and tell the customer before they ask."
        action={{ label: 'Upgrade to Shop', href: '#' }}
        secondaryAction={{ label: 'Compare plans', href: '#' }}
      />
      <div className="tray-stack tray-span-6">
        <UpgradePrompt
          variant="alert"
          icon="zap"
          title="You have used all 50 orders this month"
          description="New orders wait until 1 December, or move to Shop for 1,000 a month."
          action={{ label: 'Upgrade to Shop', href: '#' }}
        />
        <UpgradePrompt variant="alert" tone="neutral" title="Roles are part of Market" description="Ask Oksana Franko, the owner of this workspace, to change the plan." />
      </div>
    </div>
  );
}

export function Locked() {
  return (
    <UpgradePrompt
      variant="locked"
      icon="chart-column"
      title="Reports are part of Shop"
      description="Orders and revenue by product, city and courier."
      action={{ label: 'Upgrade to Shop', href: '#' }}
    >
      <Table
        aria-label="Reports"
        columns={[
          { key: 'report', header: 'Report', rowHeader: true },
          { key: 'period', header: 'Period' },
          { key: 'orders', header: 'Orders', numeric: true },
          { key: 'revenue', header: 'Revenue', numeric: true },
        ]}
        rows={reports}
      />
    </UpgradePrompt>
  );
}
