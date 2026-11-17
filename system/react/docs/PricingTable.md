---
category: Billing
keywords: [pricing table, pricing, plans, plan cards, tiers, subscription, monthly yearly, billing period, upgrade]
---
# Pricing Table

The pricing table sets the plans side by side: a card each with the name, the price as the largest thing on it, who it is for, one button, and what is included. One plan is yellow.

## Use
```tsx
<PricingTable
  periodNote="Two months free on yearly"                   // a badge beside the Monthly / Yearly switch
  plans={[
    { id: 'stall', name: 'Stall', price: '$0', per: 'forever', text: 'For a first season at the market.',
      action: 'Start free', href: '/signup?plan=stall',
      features: ['50 orders a month', 'One person', { text: 'No courier tracking', off: true }] },
    { id: 'shop', name: 'Shop', badge: 'Most chosen', featured: true,              // the yellow card, ink button
      price: { monthly: '$29', yearly: '$24' },                                     // follows the switch
      per: { monthly: 'a month', yearly: 'a month, billed yearly' },
      text: 'For a farm that ships every day.', action: 'Start with Shop', href: '/signup?plan=shop',
      features: ['1,000 orders a month', 'Five people', 'Courier tracking'] },
  ]}
/>

<PricingTable plans={plans} period={period} onPeriodChange={setPeriod} />   {/* controlled */}
<PricingTable plans={plans} onSelect={(id) => choosePlan(id)} />              {/* buttons without href */}
```

## Parts
- The switch: a Toggle Group of Monthly and Yearly, centred above the cards, with an optional badge that says what the longer period saves. It shows by itself when a plan has a price per period.
- A plan card: the name (with an ink badge on the recommended plan), the price in `headline` size with what it is per, one sentence on who it is for, one button, and the list of what is included.
- The included list: a check per line; `{ text, off: true }` draws a dash in muted ink for something the plan lacks.
- The featured plan is a yellow Card with a dark button; the others are grey with quiet buttons.

## Behaviour
The system's `pricing` behaviour swaps every price and "per" text that has one text per period when the switch changes; the monthly (or `defaultPeriod`) text is in the markup from the start. `onPeriodChange` reports the chosen period; pass `period` to control it.

## Layout
The cards share the row from 17rem each and wrap below that. Three plans need about 900px; the table reads best at 1040px or wider.

## Do and don't
- Do keep to two, three or four plans, cheapest first.
- Do say what the price is per: "a month", "a month, billed yearly".
- Don't make every plan yellow, and don't make the dearest one yellow by habit.
- Don't hide a limit in a footnote: put the number in the list.
