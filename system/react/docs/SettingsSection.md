---
category: Account
keywords: [settings section, settings page, preferences, settings row, account settings, workspace settings, danger zone]
---
# Settings Section

A settings section is one topic of a settings page: its name and a line of explanation in a narrow column at the start edge, its controls on a card beside it.

## Use
```tsx
<SettingsSection
  title="Orders"
  description="How new orders reach the packing table. These save as you change them."
  rows={[
    { title: 'Print a label for every order', description: 'On the printer by the packing table.', control: <Switch defaultChecked onCheckedChange={save} /> },
    { title: 'Hold orders placed after', description: 'Later orders go to the next courier day.',
      control: <NativeSelect size="sm" options={['12:00', '14:00', '16:00']} defaultValue="14:00" /> },
    { title: 'Courier days', description: 'Tuesday, Thursday and Saturday.', control: <Button variant="quiet" size="xs">Change</Button> },
  ]}
/>

<form onSubmit={save}>                                   {/* a section that is a form */}
  <SettingsSection title="Workspace" description="The name and address printed on labels and invoices." footer note="Unsaved changes">
    <div className="tray-fields">
      <Field label="Name"><Input defaultValue="Perly Farm" /></Field>
      <Field label="Return address" full><Input /></Field>
    </div>
  </SettingsSection>
</form>
```

## Parts
- The intro: the title and one line on what the section covers, in a 17rem column. Two columns from 56rem up, one below.
- The card: `rows` (one setting each: the name in bold, a line under it, the control at the end edge, ruled between), or `children` such as a two-column `tray-fields` grid of Fields.
- The control: a Switch, a small NativeSelect, a small Input, or a quiet `xs` Button that opens a Dialog. A Switch, NativeSelect, Input or InputGroup is named by the row's title by itself.
- The foot, for a section that is a form: `footer` (true) draws the `note`, "Discard" (a reset button) and "Save" (a submit button). Pass your own buttons instead when needed.

Sections that follow each other get a hairline between them. A section that deletes or transfers things comes last, with `danger` buttons and a title that says what is lost.

## Do and don't
- Do name a switch by what happens when it is on.
- Do save a switch at once and a text field with the "Save" button; never mix the two in one card.
- Don't hide a setting's effect in a tooltip. The line under the name is where it goes.
- Don't put more than seven rows in a card. Split the topic.
