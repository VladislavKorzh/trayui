# Banner

A banner is one line across the top of a page or a section, about the whole product or the whole account: a trial that is ending, planned maintenance, a payment that failed. Also called an announcement bar or a site-wide notice.

## Markup
```html
<div class="tray-banner" role="status" data-dismissable>
  <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-clock"/></svg>
  <p class="tray-banner__text"><b>The trial ends in 5 days.</b> Choose a plan to keep your orders.</p>
  <div class="tray-banner__actions">
    <a class="tray-btn tray-btn--dark tray-btn--xs" href="/billing">Choose a plan</a>
    <button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-tray="dismiss" aria-label="Dismiss">…</button>
  </div>
</div>
```
| Class | Use |
| --- | --- |
| `tray-banner` | On a tray: news that needs no action. |
| `tray-banner tray-island` | Yellow: the one thing the account should do next. At most one on a page. |
| `tray-banner tray-inverse` | Ink: the product speaking, such as maintenance or a new version. |
| `tray-banner--edge` | Square corners and centred text, for a banner that spans the very top of the window. |

`data-tray="dismiss"` on the close button hides the block that carries `data-dismissable` and fires `tray:close` on it: remember the dismissal there. A banner that reports a problem takes `role="alert"`; the rest take `role="status"`.

## Accessibility
`role="alert"` interrupts the screen reader and `role="status"` waits its turn, and either is read only if the banner appears while the page is open. The icon is `aria-hidden`: the bold fact says what matters, and a problem is said in words as well as in `danger`. The dismiss button is an icon button and needs its `aria-label`. Once it is pressed, focus moves on to the next control after the banner, as `Tab` would go, so it is not dropped to the top of the page. A dismissed banner fades out, in a tenth of a second under `prefers-reduced-motion: reduce`.

## Do and don't
- Do start with the fact in bold, then what to do, in one sentence each.
- Do give it one action at most, as a small button.
- Don't use it for the result of what the person just did: that is a Toast. For a problem in one section, use an Alert.
- Don't stack banners. Show the most urgent one.
