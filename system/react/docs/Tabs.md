---
category: Navigation
keywords: [tabs, tab strip, tablist, segmented, section links, sub navigation]
---
# Tabs

Tabs switch between views of the same thing: a tray strip of 44px tabs, the current one in solid ink.

## Use
```tsx
{/* panels in place: the default */}
<Tabs label="Order PL-20418" items={[
  { value: 'items', label: 'Items', content: <p>Two jars of 50 g.</p> },
  { value: 'messages', label: 'Messages', count: 3, content: <Messages /> },
  { value: 'refunds', label: 'Refunds', disabled: true },
]} />

{/* links to pages, across the full width */}
<Tabs mode="navigation" fill label="Sections" value={section}
  items={[{ value: 'guide', label: 'The guide', href: '/guide' }, { value: 'orders', label: 'Orders', href: '/orders' }]} />

{/* links to sections of a long page, in a strip that may not fit */}
<Tabs mode="navigation" current="section" scroll label="Sections of the guide" items={sections} />
```

## Two forms
**Panels** (`mode="panels"`, the default). The tabs show and hide panels on the same page; give each item `content`. The left and right arrows move between tabs, Home and End jump to the ends, and the panel follows. Leave `content` out of every item to use the strip as a switch and render the view yourself from `value` and `onChange`.

**Navigation** (`mode="navigation"`). The tabs are links to pages or to sections of a long page; give each item `href`. The current link carries `aria-current="page"`, or `"true"` with `current="section"` for a section that follows the scroll.

## Details
- `fill` spreads the tabs across the full width in equal parts.
- `count` puts a small round badge after the label.
- `scroll` is for a strip that may not fit: it scrolls sideways and fades over its last 56px while tabs run past the end. The chosen tab, or the current link, is scrolled into view clear of the fade when the strip first shows and whenever the choice moves, and so is a tab that takes keyboard focus. Only the strip moves, never the page.
- Hover turns a tab the colour of the ground behind the strip, so the strip reads on a page and on a card alike.
- `value` with `onChange` controls the chosen tab; `defaultValue` sets the first one and lets the tabs keep their own state.

## Do and don't
- Do keep labels to one or two words, and two to seven tabs.
- Do keep the same strip in the same place on every view it leads to.
- Don't use tabs for steps that must be done in order; use the steps bar of Progress.
- Don't nest a strip inside a panel of another strip.
