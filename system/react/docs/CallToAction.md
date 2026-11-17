---
category: Marketing
keywords: [call to action, cta, signup, banner, offer, newsletter, subscribe, closing section]
---
# Call to Action

The call to action closes a page: one yellow card with the offer in a headline and the button that takes it.

## Use
```tsx
<CallToAction
  title="Pack tomorrow's orders with Counter"
  description="Free for 14 days. Your products and customers stay yours."
  actions={<>
    <Button variant="dark" href="/signup">Start free</Button>   {/* on yellow the main button is dark */}
    <Button variant="quiet" href="/contact">Talk to us</Button>
  </>}
/>

<CallToAction                                                    // an email form, on a grey card
  title="One letter a month about running a small food business" titleSize="title"
  email={{ action: 'Subscribe', placeholder: 'you@farm.example', onSubmit: (email) => subscribe(email) }}
/>
```

## Forms
With `actions` it is the yellow card (`tone="accent"`): the text at the start edge, the buttons at the end edge on the same baseline, dropping under the text when there is no room. With `email` it is a grey card (`tone="tray"`) whose form is an Input Group with the yellow button inside; the browser checks the address before `onSubmit` receives it.

## Do and don't
- Do repeat the hero's offer in other words, with the same button label.
- Do keep it the only yellow card on its screen.
- Don't add a second call to action under it. The footer comes next.
- Don't ask a question in the headline.
