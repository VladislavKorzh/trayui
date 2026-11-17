---
category: Onboarding
keywords: [feedback widget, feedback, nps, net promoter score, survey, rating, scale, csat]
---
# Feedback Widget

The feedback widget asks one question with a row of numbers, then offers a box for the reason, then says thanks.

## Use
```tsx
<FeedbackWidget
  question="How likely are you to recommend Counter to another farm?"
  lowLabel="Not at all"
  highLabel="Very"                                   // scale '0-10' is the default
  thanks="Thank you. Oksana reads every answer."
  onComplete={({ rating, comment }) => postAnswer(rating, comment)}
/>

<FeedbackWidget question="How easy was packing today?" scale="1-5"
  lowLabel="Hard" highLabel="Easy" reasonLabel="What got in the way?" />
```

## Scales
`0-10` for "would you recommend", `1-5` for "how was it". The numbers are tiles; the chosen one turns solid ink. Name both ends with `lowLabel` and `highLabel`. The eleven tiles of the 0 to 10 scale want room: give that widget a wide column, or `style={{ inlineSize: 'auto' }}` in a row.

## How it works
Choosing a number opens the box for the reason, which is always optional. Sending hides the question, shows `thanks` and moves the focus to it, and `onComplete` receives `{ rating, comment }`: post the answer there.

## Do and don't
- Do ask after the person finished something, not while they work.
- Do let it be closed without answering, and do not ask again for a few months.
- Don't use faces or stars for the scale. Numbers with named ends are read the same by everyone.
- Don't make the reason required.
