# Navigation Menu

The navigation menu is the header of a site: the wordmark, a strip of links, and one small primary action. Also called a navbar, a site header or a top navigation.

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
- From 76rem the header is one row. Below that the strip (`tray-nav__strip`) takes a second row of its own and scrolls sideways when its links do not fit. A strip of links alone may also be `tray-tabs` with `data-tray="strip"`, which fades its end while links run past it, as the article blocks do. `tray-tabs` may sit on the `<ul>` itself, with or without `tray-nav__links`: a list that is `tray-tabs` shows no bullets and has no list margins. Below 76rem a panel opens from the start edge of the header, under the strip, so the scrolling strip does not cut it.
- A strip with `data-tray="strip"` scrolls its current link into view when the page loads, clear of the fade at its end, so on a phone the section you are in is never hidden past the edge. It scrolls again when a script moves `aria-current`. Only the strip moves, never the page.
- A link of such a strip that takes keyboard focus is scrolled wholly into view the same way, so its focus ring is never cut by the edge or faded at the end. The browser by itself scrolls only a link that is out of sight.
- Not with a panel: `tray-tabs` scrolls, and its scroll box would cut a panel that hangs from one of its links. In React, `strip` gives a strip of links alone this form, and is left out while an entry opens a panel.
- The current section is marked with `aria-current`.

## Accessibility
It is a `<header>` holding a `<nav>` named by its `aria-label`: at the top of the page both are listed as landmarks. The link to the current section carries `aria-current="page"`: it is announced as the current page, and its ink fill is drawn from that attribute. A button that opens a panel is a Popover trigger: it reports `aria-expanded`, opening moves focus to the panel's first link, and `Escape` closes it and puts focus back on the button. Links draw their focus ring inside their edge. Put a skip link before the header, the first thing in the `<body>`, so the keyboard can pass over the links: `<a class="tray-skip" href="#main">Skip to the content</a>` and `<main id="main">`, as the landing template does; it shows only while it has focus. The theme switch is an icon button, so it needs an `aria-label`, and `aria-pressed` says whether the dark theme is on.

## Do and don't
- Do keep one primary action in the header, small (48px), in yellow.
- Do keep top-level links to seven at most.
- Don't open panels on hover alone; open them on click, Enter or Space.
- Don't put a search field, a language switch and three buttons in the same row; move the rarer ones to the footer or a menu.
