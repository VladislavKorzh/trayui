# Label

A label names a control in plain words, above it, in `label` type.

## Markup
`<label class="tray-label" for="id">`. Mark the fields that may be left empty: add `<span class="tray-label__opt">(optional)</span>`. Fields without it are required, so no asterisks are needed. Inside a Checkbox, Radio or Switch the text is the label already; use `tray-label--inline` when a label sits on the same line as its control.

## You provide
Two or three words in sentence case, no colon: "Delivery address", "Phone". Say what goes in the field, not how ("Phone", not "Enter your phone number").

## Do and don't
- Do keep every control labelled, including a search field (`tray-vh` hides a label visually when an icon already says it).
- Don't use the placeholder as the label: it vanishes on typing and is set in the lightest ink.
- Don't set labels in capitals or with tracking (the Plain Sentence Rule).
