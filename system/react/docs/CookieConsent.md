---
category: Onboarding
keywords: [cookie consent, cookies, consent, gdpr, privacy, cookie banner, tracking]
---
# Cookie Consent

Cookie consent is a raised panel in the corner of the first visit: what is stored and why, and three equal ways to answer.

## Use
```tsx
<CookieConsent
  fixed                                          // pinned to the bottom start corner, over the page
  description="We keep you signed in with one cookie. With your leave, two more tell us which pages help."
  categories={[
    { name: 'necessary', label: 'Necessary', description: 'Signing in and the cart. Always on.', required: true },
    { name: 'statistics', label: 'Statistics', description: 'Which pages are opened, without your name.' },
  ]}
  onComplete={(choice) => saveConsent(choice)}  // { necessary: true, statistics: false }
/>
```

## Forms
With `fixed` the panel is pinned to the bottom start corner over the page, for the first visit. Without it the panel sits in the flow, for a settings page.

## How it works
"Choose which" folds out a switch for each category; a `required` one is on and cannot be turned off. "Only necessary" turns every optional switch off, "Accept all" turns them all on, and "Save my choice" keeps them as set. Each answer hides the panel and calls `onComplete` with each category's `name` and whether it is on. Store the choice there, load nothing optional before it, and stop rendering the panel.

Without `categories` the panel has only the two buttons.

## Do and don't
- Do give "Only necessary" and "Accept all" the same weight: both quiet, the same size, as the component draws them.
- Do say what each kind is for in one line.
- Don't use a yellow button here. Consent is not something to steer.
- Don't block the page behind the panel.
