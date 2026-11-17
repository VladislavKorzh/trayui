import * as React from 'react';
import { OnboardingChecklist, type ChecklistTask } from 'trayui-react';

const firstOrder: ChecklistTask[] = [
  { title: 'Create the workspace', done: true },
  { title: 'Add your products', done: true },
  { title: 'Choose the courier days', description: 'Orders placed after the cut-off wait for the next courier day.', action: 'Choose the days' },
  { title: 'Print a test label', description: 'Check that the printer by the packing table is found.', action: 'Print a label' },
  { title: 'Invite the people who pack', description: "They see today's orders on their phones.", action: 'Invite people' },
];

export function NextTask() {
  return (
    <OnboardingChecklist
      title="Get ready for the first order"
      tasks={firstOrder}
      doneText="Everything is set. The first order will appear on the Orders page."
    />
  );
}

export function Complete() {
  return (
    <OnboardingChecklist
      title="Get ready for the first order"
      tasks={firstOrder.map((t) => ({ ...t, done: true }))}
      doneText="Everything is set. The first order will appear on the Orders page."
      style={{ maxWidth: 560 }}
    />
  );
}

/** Tasks done elsewhere in the product: `done` comes from the app's own state, and the link leads to where the task is done. */
export function FromAppState() {
  const [shop, setShop] = React.useState(false);
  return (
    <div className="tray-stack" style={{ maxWidth: 560 }}>
      <OnboardingChecklist
        title="Open the shop"
        progressLabel="Ready"
        tasks={[
          { title: 'Add the 50 g jar', done: true },
          { title: 'Connect the shop page', description: 'Customers order from perly.counter.example.', action: 'Connect the shop', completes: false, onAction: () => setShop(true), done: shop },
          { title: 'Take a test order', description: 'Order a 30 g jar yourself and cancel it.', action: 'Take a test order' },
        ]}
      />
      <p className="tray-demo-note">"Connect the shop" sets the task done from the app's own state.</p>
    </div>
  );
}
