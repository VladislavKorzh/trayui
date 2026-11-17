---
category: Feedback
keywords: [banner, announcement, notice bar, system message, trial banner, maintenance notice, top banner, alert bar]
---
# Banner

A banner is one line across the top of a page or a section, about the whole product or the whole account: a trial that is ending, planned maintenance, a payment that failed.

## Use
```tsx
<Banner tone="accent" icon="clock" title="The trial ends in 5 days."
        action={<Button variant="dark" size="xs" href="/billing">Choose a plan</Button>}
        dismissible onDismiss={rememberDismissal}>
  Choose a plan to keep your orders and your team.
</Banner>

<Banner icon="megaphone" title="Courier labels print in one click now." action={<Button variant="link" href="/changelog">What changed</Button>}>
  Open any order to try it.
</Banner>

<Banner tone="danger" icon="circle-alert" title="The last payment did not go through."
        action={<Button variant="quiet" size="xs" href="/billing">Update the card</Button>}>
  Update the card by 20 November to keep the Shop plan.
</Banner>

<Banner tone="accent" edge title="Two months free">on a yearly plan until 30 November.</Banner>   {/* across the top of the window */}
```

## Tones
`tray` (the default) for news that needs no action. `accent`, yellow, for the one thing the account should do next: at most one on a page. `inverse`, ink, for the product speaking, such as maintenance or a new version. `danger` for a problem: the icon and the fact turn red, and it is announced at once (`role="alert"`; the others are `role="status"`).

`edge` squares the corners and centres the text, for a banner that spans the very top of the window.

## Parts
The `icon`, the fact in bold (`title`), what to do about it (`children`), then one `action` as a small button or a link. `dismissible` adds a close button that hides the banner; remember the dismissal in `onDismiss`, so it does not come back.

## Do and don't
- Do start with the fact in bold, then what to do, in one sentence each.
- Do give it one action at most, as a small button.
- Don't use it for the result of what the person just did: that is a Toast. For a problem in one section, use an Alert.
- Don't stack banners. Show the most urgent one.
