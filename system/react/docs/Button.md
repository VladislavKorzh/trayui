---
category: Actions
keywords: [button, cta, action, link button]
---
# Button

A button starts an action; the yellow one is the single most important action in view.

## Use
```tsx
<Button>Order a jar</Button>                                   {/* primary: one per view */}
<Button variant="quiet">Details</Button>                       {/* the default for everything else */}
<Button variant="ghost" size="sm">Cancel</Button>
<Button variant="dark">Start free</Button>                     {/* the main action on a yellow card */}
<Button variant="danger">Delete order</Button>
<Button variant="quiet" icon="download">Export</Button>
<Button variant="quiet" icon="ellipsis" aria-label="More actions" /> {/* icon only: always an aria-label */}
<Button iconEnd="arrow-right" variant="quiet">Next</Button>
<Button end="$59">Order a jar</Button>                         {/* a value pushed to the far end */}
<Button busy>Sending the order</Button>
<Button href="/plans" variant="quiet">See the plans</Button>   {/* goes somewhere: renders a link */}
```

`busy` shows a spinner before the label and sets `aria-busy`. While it is set the button ignores presses: `onClick` is not called, its form is not sent again and a link does not go, and the button keeps focus, which `disabled` would drop. Set it while the work runs: `<Button type="submit" busy={sending}>Send the order</Button>`.

## Sizes
`lg` 64px for page actions, `md` 56px in a row with inputs, `sm` 48px in headers and toolbars, `xs` 40px in tables and dense rows.

## You provide
The label: a verb first, sentence case, no full stop ("Order a jar", "Save changes"). Never "OK", "Submit" or "Yes".

## Do and don't
- Do keep one primary button per view (the One Yellow Rule).
- Do use `variant="dark"` for the main action on a yellow surface.
- Don't put two yellow buttons side by side; make the second one quiet.
- Don't use the danger button for a routine "Remove filter".
