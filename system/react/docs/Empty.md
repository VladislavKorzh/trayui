---
category: Feedback
keywords: [empty, empty state, no data, no results, zero state, blank slate, nothing found]
---
# Empty

An empty state fills the place where content will be: an icon tile, a title, one sentence, and the action that makes the first item.

## Use
```tsx
<Card>
  <Empty icon="inbox" title="No orders yet" description="When someone orders a jar it shows up here."
         actions={<Button size="sm">Create an order</Button>} />
</Card>

<Empty icon="search" title='Nothing matches "truffle"' description="Check the spelling, or look through all the notes."
       actions={<Button variant="quiet" size="sm">Clear the search</Button>} />

<Empty size="sm" title="No order matches that filter" description="Check the spelling, or clear the filter." /> {/* inside a table row */}
```

## Three kinds
- First use: nothing has been made yet. Explain what will appear and offer the action ('inbox').
- No results: a search or filter matched nothing. Say so and offer to clear it ('search').
- All done: the list is empty because the work is finished. No action needed ('circle-check').

It is centred, with text at most 36 characters wide. `size="sm"` drops the heading type for an empty row inside a table or a small card.

## Do and don't
- Do keep the same container as the full state, so the page does not jump.
- Do offer one primary action at most.
- Don't blame the person ("You have no orders").
- Don't use an illustration that needs explaining; the icon tile is enough.
