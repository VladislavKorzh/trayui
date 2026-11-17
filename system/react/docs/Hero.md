---
category: Marketing
keywords: [hero, landing, header section, above the fold, headline, splash, marketing page, intro]
---
# Hero

The hero is the first screen of a product's public page: what it is in one headline, one sentence, one yellow button, and something real to look at beside them.

## Use
```tsx
<Hero
  title="Every order, packed on time"
  description="Counter is the order desk for small farms: orders in, labels out, the courier told."
  actions={<>
    <Button href="/signup">Start free</Button>
    <Button variant="quiet" href="/tour">See how it works</Button>
  </>}
  note="Free for 14 days. No card needed."
  media={<Typography variant="figure" unit="orders">38</Typography>}   // the yellow card
/>

<Hero title="Packed by two" titleSize="display" media={…} />             {/* four words or fewer */}
<Hero title="…" media={<img src="/farm.jpg" alt="…" />} mediaFlush />  {/* a photograph that fills the card */}
```

## Parts
Two Cards on the 12-column grid: the text takes seven columns and the media five; below 56rem they stack. The text card pushes the title to the top and the buttons to the bottom. The title is `headline` type by default; use `titleSize="display"` for four words or fewer.

The media card is the yellow one on this screen. Put in it a real number with its context (a Typography `figure`, a Badge, a Progress in steps), a screenshot of the product, or a photograph with `mediaFlush`. Use `mediaTone="tray"` or `"inverse"` only when another yellow card is in view.

## Do and don't
- Do keep the title under eight words and the sentence under twenty.
- Do show the product or its result. A real screen beats an illustration.
- Don't add a third button, a badge row or a list of features to the hero. They have their own sections.
- Don't put a number in the media card that you cannot back.
