---
category: Forms
keywords: [tag input, tags, chips, multiple emails, token field, multi value, recipients, keywords]
---
# Tag Input

A tag input takes several short values in one field: each becomes a chip that can be removed, and the caret waits after the last one.

## Use
```tsx
<Field label="Order tags" hint="Press Enter or a comma after each one.">
  <TagInput name="tags" placeholder="Add a tag" defaultValue={['gift', 'chilled']} />
</Field>

<Field label="Send the report to" error={wrong ? `“${wrong}” is not a full email address.` : undefined}>
  <TagInput pattern="email" max={3} value={to} onChange={(values, valid) => setTo(values)} />
</Field>
```

## Behaviour
Enter or a comma turns what was typed into a chip; so does leaving the field. Backspace in the empty field removes the last chip, and each chip's x removes that one. A pasted list is split on commas, semicolons and spaces. Repeats are ignored. Additions and removals are announced to screen readers.

- `pattern="email"`: a value that is not an email address becomes a danger chip, and the tray takes the danger ring. It stays in the field so it can be seen and removed.
- `max`: no more values are taken once the field holds that many.
- `onChange(values, valid)` runs at every addition and removal. `valid` is false while a danger chip is in the field.
- `name` sends the values with a form, joined by commas, from a hidden input.

With a controlled `value`, the field shows what you pass: set it to `[]` to clear the chips after a send. The chips are drawn again whenever the value you pass differs from what the field holds.

## In a Field
The Field's label points at the text input, and its hint or error is read with it. A Field `error` (or `invalid`) rings the whole tray. Say which value is wrong in the error: "“books@perly” is not a full email address."

`ref` and the native props (`placeholder`, `type`, `aria-*`) go to the text input; `className` and `style` go to the tray.

## Do and don't
- Do say under the field how a value is added.
- Do keep wrong values as chips so they can be seen and removed.
- Don't use it to choose from a known list: that is a Combobox or checkboxes.
- Don't use it for long text. A chip holds a word or an address.
