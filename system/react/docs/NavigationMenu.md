---
category: Navigation
keywords: [navigation menu, header, site header, top nav, navbar, mega menu, nav links]
---
# Navigation Menu

The navigation menu is the header of a site: the wordmark, a strip of links, and one small primary action.

## Use
```tsx
<NavigationMenu brand="Perly" brandHref="/" links={[
  { label: 'Shop', panel: {
    feature: { title: 'White caviar', description: 'Three jar sizes, delivered chilled.', meta: 'From $39', href: '/shop' },
    links: [{ label: 'Jars', description: '30, 50 and 100 g', icon: 'shopping-bag', href: '/shop/jars' }],
  } },
  { label: 'The farm', href: '/farm' },
  { label: 'Field notes', href: '/notes', current: true },
]} actions={<Button size="sm" href="/order">Order a jar</Button>} />
```

## Parts
The links sit in a tray strip, like Tabs, inside a `<nav>` named by `label` ("Main" by default), so the header and its links are both landmarks; the current section, marked with `current`, is solid ink. A link with a `panel` becomes a button that opens a roomy panel under it: an optional featured card on the start side and a list of two-line links. Without a feature the panel is the list alone. `actions` holds the end of the row: a theme toggle and one small primary button.

## Behaviour
Put a skip link before it, the first thing in the page, so the keyboard can pass over the links: `<a className="tray-skip" href="#main">Skip to the content</a>`, with `<main id="main">`. It shows only while it has focus.

The panel is a disclosure, not a menu: it opens on click, Enter or Space, Tab moves through its links, Escape closes it. From 76rem the header is one row; below that the strip (`tray-nav__strip`) takes a second row of its own and scrolls sideways when its links do not fit, and a panel opens from the start edge of the header. The link to the current section carries `aria-current="page"`; a button that opens a panel reports `aria-expanded`, and Escape puts focus back on it.

A strip of links alone, with no panel, may take `strip`, the form the headers of the blocks use: the list becomes a Tabs strip (`tray-tabs` with `data-tray="strip"`), so the ink pill slides to the current link, the end fades while links run past it on a phone, and the current link, and any link that takes focus, scroll into view. While an entry opens a panel, `strip` is left out: the strip's scroll box would cut the panel.

```tsx
<NavigationMenu brand="Counter" strip links={[
  { label: 'Product', href: '/', current: true },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Help', href: '/help' },
  { label: 'Changelog', href: '/changelog' },
]} actions={<Button size="sm" href="/start">Start free</Button>} />
```

## Do and don't
- Do keep one primary action in the header, small (48px), in yellow.
- Do keep top-level links to seven at most.
- Don't open panels on hover alone.
- Don't put a search field, a language switch and three buttons in the same row; move the rarer ones to the footer or a menu.
