---
category: Feedback
keywords: [spinner, loading, busy, progress indicator]
---
# Spinner

A spinner says that something is in progress and its length is unknown: an open ring in the text colour, always with words.

## Use
```tsx
<Spinner label="Sending the order" />
<Spinner size="sm" label="Checking the address" />
<Spinner size="lg" label="Loading the season" hideLabel />   {/* words kept for screen readers only */}
<Button busy>Placing the order</Button>                       {/* inside a button, use `busy` */}
```

## Do and don't
- Do say what is happening: "Sending the order", not "Loading".
- Do switch to Progress once the length is known.
- Don't cover the whole page with a spinner; load the part that changes.
