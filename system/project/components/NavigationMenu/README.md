# Navigation Menu

The navigation menu is the header of a site: the wordmark, a strip of links, and one small primary action.

## Markup
```html
<header class="tray-nav">
  <a class="tray-wordmark" href="/">Perly</a>
  <nav class="tray-nav__strip" aria-label="Main"><ul class="tray-nav__links">
    <li class="tray-anchor" data-tray="popover">
      <button class="tray-tab" type="button">Shop …chevron-down…</button>
      <div class="tray-pop tray-pop--roomy">…a panel of links…</div>
    </li>
    <li><a class="tray-tab" href="/notes" aria-current="page">Field notes</a></li>
  </ul></nav>
  <div class="tray-nav__actions">…theme toggle, a small primary button…</div>
</header>
```
The links are Tabs in a tray strip. A link that has children is a button that opens a roomy panel under it: `tray-nav__panel` lays out one featured card and a list of two-line links (`tray-option tray-option--two`). The panel is a disclosure, not a menu: Tab moves through its links, Escape closes it.

## Behaviour
- From 76rem the header is one row. Below that the strip (`tray-nav__strip`) takes a second row of its own and scrolls sideways when its links do not fit (`data-tray="strip"` fades its end).
- The current section is marked with `aria-current`.

## Do and don't
- Do keep one primary action in the header, small (48px), in yellow.
- Do keep top-level links to seven at most.
- Don't open panels on hover alone; open them on click, Enter or Space.
- Don't put a search field, a language switch and three buttons in the same row; move the rarer ones to the footer or a menu.
