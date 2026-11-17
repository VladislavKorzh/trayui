import { PlanComparison } from 'trayui-react';

export function Comparison() {
  return (
    <PlanComparison
      aria-label="What each plan includes"
      plans={[
        { name: 'Stall', price: '$0' },
        { name: 'Shop', price: '$29 a month', featured: true },
        { name: 'Market', price: '$79 a month' },
      ]}
      rows={[
        { group: 'Orders', feature: 'Orders a month', values: [50, 1000, 'Unlimited'] },
        { feature: 'Printable labels', values: [true, true, true] },
        { feature: 'Courier tracking', values: [false, true, true] },
        { group: 'Team', feature: 'People', values: ['One', 'Five', 'Twenty'] },
        { feature: 'Roles', values: [false, false, true] },
      ]}
    />
  );
}

export function TheirCurrentPlan() {
  return (
    <div className="tray-stack">
      <p className="tray-demo-note">The tray marks the plan the workspace is on.</p>
      <PlanComparison
        aria-label="Data on each plan"
        plans={[
          { name: 'Stall', price: '$0' },
          { name: 'Shop', price: '$29 a month' },
          { name: 'Market', price: '$79 a month', featured: true },
        ]}
        rows={[
          { group: 'Data', feature: 'Exports', values: [false, 'Spreadsheet', 'Spreadsheet and API'] },
          { feature: 'History kept', values: ['90 days', 'Two years', 'For good'] },
        ]}
      />
    </div>
  );
}
