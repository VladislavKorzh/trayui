---
category: Layout
keywords: [carousel, slider, slideshow, scroller, cards row, gallery, horizontal scroll]
---
# Carousel

A carousel is one row of cards that scrolls sideways and snaps to each card, with previous and next buttons and a "2 / 5" count.

## Use
```tsx
<Carousel label="Field notes" previousLabel="Previous note" nextLabel="Next note">
  <Card href="/notes/may" tone="accent" title="The May peak" />
  <Card href="/notes/winter" tone="inverse" title="Closing the beds for winter" />
  <Card href="/notes/salt" title="Why we salt by hand" />
</Carousel>

<Carousel label="Jars" slideWidth="16rem">{jars.map((j) => <Card key={j.id} title={j.name} />)}</Carousel>
```

## Details
- Every child becomes one slide. The row is the browser's own scroll with snapping, so swipe, trackpad and the arrow keys work; the buttons step one slide at a time and disable at the ends.
- `slideWidth` sets the width of a slide. By default a slide takes 78% of the row, at most 22rem, so the next card always peeks in.
- The count under the row shows the first visible slide and the total, as numbers.

## Do and don't
- Do let the next slide show at the edge; it is the only hint that there is more.
- Do name the buttons after what they move through: "Next note", "Previous jar".
- Don't auto-advance. Nothing in the system moves on its own.
- Don't hide content that matters in slide four; a carousel is for browsing, not for must-read steps.
- Prefer a bento of cards when everything fits.
