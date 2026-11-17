import { Button, Field, Input, InputGroup, NativeSelect, SettingsSection, Switch } from 'trayui-react';

export function FormWithSave() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <SettingsSection title="Workspace" description="The name and address printed on labels and invoices." footer note="Unsaved changes">
        <div className="tray-fields">
          <Field label="Name"><Input defaultValue="Perly Farm" /></Field>
          <Field label="Address of the shop"><InputGroup defaultValue="perly" suffix=".counter.example" /></Field>
          <Field label="Return address" full><Input defaultValue="Farm road 4, Kyiv region" /></Field>
        </div>
      </SettingsSection>
    </form>
  );
}

export function SwitchesThatSave() {
  return (
    <SettingsSection
      title="Orders"
      description="How new orders reach the packing table. These save as you change them."
      rows={[
        { title: 'Print a label for every order', description: 'On the printer by the packing table.', control: <Switch defaultChecked /> },
        {
          title: 'Hold orders placed after',
          description: 'Later orders go to the next courier day.',
          control: <NativeSelect size="sm" options={['12:00', '14:00', '16:00']} defaultValue="14:00" />,
        },
        { title: 'Ask before refunding over $100', description: 'The owner gets a notification to approve.', control: <Switch /> },
        { title: 'Courier days', description: 'Tuesday, Thursday and Saturday.', control: <Button variant="quiet" size="xs">Change</Button> },
      ]}
    />
  );
}

export function DangerLast() {
  return (
    <SettingsSection
      title="Delete the workspace"
      description="Orders, customers and invoices are removed for everyone, for good."
      rows={[
        {
          title: 'Export everything first',
          description: 'A spreadsheet of orders and customers, sent to the owner.',
          control: <Button variant="quiet" size="xs" icon="download">Export</Button>,
        },
        { title: 'Delete Perly Farm', description: 'You will be asked to type the workspace name.', control: <Button variant="danger" size="xs">Delete the workspace</Button> },
      ]}
    />
  );
}
