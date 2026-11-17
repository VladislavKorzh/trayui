---
category: Display
keywords: [description list, details, key value, properties, attributes, definition list, summary, facts]
---
# Description List

A description list sets out the facts about one thing as pairs: the name of the fact in soft ink at the start edge, its value beside it, a hairline between rows.

## Use
```tsx
<DescriptionList items={[
  { term: 'Customer', value: <a href="/customers/dk">Dana Kovalenko</a> },
  { term: 'Status', value: <Badge>To pack</Badge> },
  { term: 'Tracking number', value: 'PL20431UA', numeric: true, copy: 'Copy the tracking number' },   // a copy button after it
  { term: 'Gift note' },                                         // no value: "None", muted
  { term: 'Total', value: '$118.00', numeric: true },
]} />

<Card title="Plan">
  <DescriptionList plain stack items={[{ term: 'Current plan', value: 'Shop, monthly' }, { term: 'Paid with', value: 'Card ending 4242' }]} />
</Card>
```

## Forms
| Props | Use |
| --- | --- |
| (none) | Ruled rows, 56px tall at least: the term in a 12rem column, the value beside it. Below 34rem the value drops under its term. |
| `stack` | The term over its value at every width, for a narrow column. |
| `plain` | No rules and tight rows, for three or four facts inside a card. |

## Values
A value may hold text, a Badge, a link, or a small ghost button. `numeric` sets it in tabular figures. `copy` adds a button that copies the value's text, named by the string you give. An empty value says `emptyText`, "None", in muted type.

## Do and don't
- Do write "None" or "Not set" for an empty value; it is the default.
- Do put the most important facts first.
- Don't use it for values a person edits in place: that is a form, or a Settings Section.
- Don't use it to compare several things. That is a Table.
