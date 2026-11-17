---
category: Display
keywords: [accordion, faq, questions, expandable, disclosure, details, collapse]
---
# Accordion

An accordion is a list of questions that open one at a time: hairline rows, a bold question, a plus tile that turns into a cross.

## Use
```tsx
<Accordion defaultValue={['taste']} items={[
  { value: 'taste', title: 'What does it taste like?', content: 'Mild and earthy, with mushroom notes.' },
  { value: 'keep', title: 'How long does a jar keep?', content: 'Up to three months in the fridge.' },
]} />

<Accordion size="sm" multiple items={[                     /* settings and filters; several may stay open */
  { title: 'Delivery', content: 'Courier, chilled box, 14:00 to 18:00.' },
  { title: 'Payment', content: 'Card, on delivery.' },
]} />

<Accordion multiple value={open} onChange={setOpen} items={items} /> {/* controlled: the open values */}
```

## Details
- It is the browser's own `<details>`: the answers are searchable with find-in-page, and an item the browser opens itself is reported through `onChange`.
- By default opening one item closes the others. `multiple` lets several stay open.
- `size="md"` (the default) sets the questions in `subtitle` type for a page of questions; `size="sm"` sets them in `control` type, for settings and filters.
- Answers are `ink-soft` and at most 60 characters wide. A string answer is one paragraph; pass elements for more.
- On a card, the tiles turn white by themselves.

## Do and don't
- Do write the title as the question a person would ask.
- Do open the first item when the answers are the point of the page.
- Don't hide anything a person must read to finish a task.
- Don't nest accordions.
