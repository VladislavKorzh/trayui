---
category: Forms
keywords: [textarea, text area, multiline, comment, note, message, character count]
---
# Textarea

A textarea takes several lines of text, in the same fill and corners as an input.

## Use
```tsx
<Field label="What went wrong" error="Tell us what happened, in a sentence or two.">
  <Textarea rows={3} />
</Field>

<Field label="Note for the courier" optional>
  {/* "39 / 140" as the person types; the hint shares the count's line */}
  <Textarea rows={2} maxLength={140} showCount hint="Door codes, landmarks, a safe place." />
</Field>

<Textarea rows={6} value={review} onChange={(e) => setReview(e.target.value)} aria-label="Review" />
```

## Count
`showCount` with `maxLength` prints the count at the end of the line under the field and keeps it current as the person types, also when a controlled `value` is changed from code. When the textarea counts, give the hint to the Textarea, not to the Field, so the hint and the count share one line. An error on the Field replaces that hint.

## You provide
A label that says what to write, and `rows` matched to the expected answer: two for a courier note, six for a review. It grows by the handle in the corner, vertically only.

## Do and don't
- Do keep the hint to one line.
- Do show the count whenever there is a limit; don't stop typing at the limit without it.
- Don't use a textarea where one line is enough; that is an Input.
