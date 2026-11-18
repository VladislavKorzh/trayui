---
category: Marketing
keywords: [feature grid, features, bento, benefits, product features, cards, marketing section]
---
# Feature Grid

The feature grid tells what the product does in a few cards of unequal size: each one a small icon tile, a title, and two lines.

## Use
```tsx
<FeatureGrid
  aria-label="What Counter does"
  features={[
    { icon: 'inbox', title: 'One list for every order', span: 7,
      text: 'From the shop, the phone and the market stall, in the order they must leave.',
      end: <ul className="tray-items" role="list"><Item size="sm" title="PL-20431, Dana Kovalenko" end={<Badge>To pack</Badge>} /></ul> },
    { icon: 'truck', title: 'The courier knows before you call', span: 5, tone: 'inverse',
      text: 'A packed order books its own pickup for the next courier day.' },
    { icon: 'receipt-text', title: 'Labels that print themselves', span: 4, text: "One label per box." },
    { icon: 'package', title: 'Stock by batch', span: 4, text: 'Know how many jars are left.' },
    { icon: 'users', title: 'A screen for the people who pack', span: 4, text: "Today's orders on a phone." },
  ]}
/>
```

## Layout
It is the Bento grid with Cards. Give each card a `span` of 4, 5, 6, 7 or 8 columns so that each row adds up to 12; below 56rem every card takes the full width. The most important feature gets the largest card and may show a piece of the product in `end`, which sits at the bottom of the card. One card may be `tone: 'inverse'` for rhythm; yellow stays with the page's call to action.

## Do and don't
- Do give the cards different sizes: the important feature gets the room.
- Do write the title as what the person can do.
- Don't make a row of three equal cards with an icon each. That is the layout every template has.
- Don't use more than six cards. The rest belong to a features page.
