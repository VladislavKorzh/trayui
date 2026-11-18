---
category: Forms
keywords: [field, form, label, hint, error, validation]
---
# Field

A field is one question in a form: a label, its control, and one line of help or error beneath. The control inside is linked to the label and the message by itself. The label is a `<label for>` the control; for a group of inputs, such as Input OTP, it is a span the group is named by (`aria-labelledby`).

## Use
```tsx
<Field label="Email" hint="We send the receipt here.">
  <Input type="email" autoComplete="email" />
</Field>

<Field label="Phone" error="Enter the phone number with its area code.">
  <Input type="tel" />
</Field>

<Field label="Gift note" optional><Textarea /></Field>

<div className="tray-fields">                                  {/* two columns from 40rem */}
  <Field label="Name"><Input /></Field>
  <Field label="Phone"><Input type="tel" /></Field>
  <Field label="Address" full><Input /></Field>             {/* spans both columns */}
</div>

<Field label="Display name" layout="row"><Input /></Field>  {/* label beside the control, for settings */}
```

Group related fields in `<fieldset>` with `<legend className="tray-legend subtitle">`; `tray-form` spaces the groups and `tray-form__foot` holds the submit button above a hairline. For a set of checkboxes or radios use RadioGroup or a fieldset, not a Field.

## Do and don't
- Do say what to do in an error: "Enter the street and house number", not "Invalid value".
- Do validate when the person leaves the field or submits, never on every key.
- Don't show a hint and an error together; the error replaces the hint.
- Don't disable the submit button to signal errors.
