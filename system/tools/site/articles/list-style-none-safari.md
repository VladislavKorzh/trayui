# list-style: none lists in Safari and VoiceOver

Safari stops exposing a list as a list once its markers are gone, unless it is in a nav. WebKit's reasons, role="list", the ::before trick and Tray UI's choice.

Most lists in an interface have no bullets. A feed of events, the lines of an order summary and the slides of a carousel are all `<ul>` or `<ol>` elements with `list-style: none`. In most browsers that is a matter of looks. In Safari it changes what assistive technologies are told.

## What VoiceOver users lose

Gerard K. Cohen described it in 2017, in [VoiceOver and list-style-type: none](https://unfetteredthoughts.net/2017/09/26/voiceover-and-list-style-type-none/). The expected behaviour, he wrote, "is that the unordered list is announced with a role of list along with the number of items, for example 'list 4 items.'", and "end of list" after the last item. With `list-style-type: none`, VoiceOver in Safari said neither.

Scott O'Hara's [Fixing Lists](https://www.scottohara.me/blog/2019/01/12/lists-and-safari.html) widened it: "any CSS that would remove the bullet or number indicators of a list's items will also remove the semantics", and the behaviour is "unique to Safari/Webkit". MDN's page on [list-style](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style) says the same of both kinds of list: "Safari does not recognize ordered or unordered lists as lists in the accessibility tree if they have a list-style value of none, unless the list is nested within the `<nav>` navigation element."

Tailwind's Preflight removes the markers of every list, with `ol, ul, menu { list-style: none; }`, so in a Tailwind project this applies to every list on the page. Its [Preflight page](https://tailwindcss.com/docs/preflight) warns: "Unstyled lists are not announced as lists by VoiceOver."

## A heuristic, on purpose

WebKit made the change deliberately. When the behaviour was reported as [bug 170179](https://bugs.webkit.org/show_bug.cgi?id=170179), James Craig answered for WebKit:

"This was a purposeful change due to rampant 'list'-itis by web developers. In the same way WebKit differentiates layout tables from data tables, it now differentiates layout lists from data lists. VoiceOver users always used to file bugs that there were too many 'start of list' 'end of list' announcements on the Web."

He went on: "if you remove all default visible indication of the list, there is no indication to a sighted user or screen reader user that the content is a list. If you want to override this heuristic for accessibility, you can always add an explicit ARIA role='list'."

## What WebKit checks

The heuristic lives in WebKit's source, in `determineListRoleWithCleanChildren()` in `AccessibilityNodeObject.cpp`. Read as it stands today, it decides like this:

| The list | Exposed as |
| --- | --- |
| has `role="list"` and at least one item | a list |
| has items that show a marker: a `list-style-type` other than `none`, a `list-style-image`, or a `::before` that WebKit exposes | a list |
| shows no markers, but sits inside `<nav>` or `role="navigation"` | a list |
| shows no markers, anywhere else | a group |

A comment in the same function says an ordered list is always a list, but the code applies the marker test to `<ol>` as well as `<ul>`, as MDN's sentence does. Description lists, `<dl>`, are left alone. The `<nav>` rule came later, from [bug 193382](https://bugs.webkit.org/show_bug.cgi?id=193382): lists inside navigation keep their role without any help.

Chromium does none of this. Its accessibility tree, read through the DevTools protocol, gives `list` with `listitem` children for a bulleted list, a list with `list-style: none`, the same list with `role="list"`, and the same list inside `<nav>`. So the problem cannot be seen in Chrome. To see it, test in Safari.

## Fix one: role="list"

WebKit's own answer is to say it in the markup:

```html
<ul class="plain" role="list">
  <li>Paid</li>
  <li>Shipped</li>
  <li>Refunded</li>
</ul>
```

```css
.plain { list-style: none; margin: 0; padding: 0; }
```

The role matches what `<ul>` already is, so it adds nothing where the list was exposed as a list anyway. It does go against the first rule of ARIA, which asks for native HTML before a role, and O'Hara says so: it is the case where "you have to go against best practices". Some automated checkers report a redundant role on it; for this case the warning can be noted and left.

Tailwind's page gives the same fix, with the same markup.

## Fix two: a marker of your own

Cohen preferred a fix in CSS. Content in a `::before` on each item made VoiceOver treat the list as a list again, and the least visible content was a zero-width space:

```css
.plain { list-style: none; }
.plain > li::before { content: "\200B"; }
```

It has aged badly. O'Hara removed the `::before` versions from his article in November 2019: they had changed "how VoiceOver announced lists that contained only static text content", and he did not want "to promote hacks which could result in less than ideal user experiences". MDN still describes pseudo-content as a way back, with limits: Safari "determines if the added pseudo-content suffices as accessible content", text and images generally do, and `content: ""` or content of spaces alone is ignored. MDN keeps these "CSS workarounds" for when "an HTML solution is unavailable, and only after testing".

WebKit's code agrees on the mechanism: a `::before` counts as a marker only when WebKit exposes the pseudo-element. Whether a zero-width space is exposed is not something these sources settle, and that is reason enough to prefer the attribute, which WebKit documents.

A real marker is the third way out of the heuristic, because WebKit looks for a `list-style-type` other than `none`. A list that should look like a list can keep a marker of its own design, such as a dash, and no role is needed.

## Fix three: put navigation in a nav

A list of links that is a site's navigation belongs in `<nav>` anyway. Inside it, WebKit keeps the list's role with or without markers. A breadcrumb, a row of page numbers and a sidebar of links all qualify.

## Decide whether it is a list

O'Hara's advice ends with a caution from Adrian Roselli: a missing list role "may not be a big deal unless user testing says you really need a list." WebKit's change answered real complaints about too many list announcements, so `role="list"` on every `<ul>` in a page would bring them back.

- **Worth the role.** A feed of events, search results, the releases of a changelog, the lines of an order: the count tells the person how much there is, and the end of the list tells them they are done.
- **Not worth it.** The parts of one card, a row of buttons. Leave the list as a group, or reconsider whether it needed to be a list at all.

## Lists in Tray UI

Tray UI uses `role="list"`, and never the `::before` marker. It puts it on the lists that sit outside a `<nav>` and whose items matter one by one. Five components had it in version 0.2.0:

| Component | The list |
| --- | --- |
| [Activity Feed](#c-activity-feed) | `<ol class="tray-feed" role="list">`, one item per event |
| [Changelog](#c-changelog) | `<ol class="tray-changelog" role="list">`, one item per release |
| [Checkout Summary](#c-checkout-summary) | `<ul class="tray-summary__lines" role="list">`, one item per line |
| [Carousel](#c-carousel) | `<ul class="tray-carousel__track" role="list">`, one item per slide |
| [Lightbox](#c-lightbox) | `<ul class="tray-lightbox__track" role="list">`, one item per picture |

Each of their pages says why, in one sentence such as the Changelog's: "Safari stops calling a list without markers a list".

Lists of links inside a `<nav>` rely on WebKit's rule for navigation and carry no role: the [Breadcrumb](#c-breadcrumb) is an `<ol>` in `<nav aria-label="Breadcrumb">`, [Pagination](#c-pagination) a `<ul>` in `<nav aria-label="Pages">`, and the second level of the [Sidebar](#c-sidebar) a `<ul>` inside the sidebar's `<nav>`.

The other lists that lose their markers to the stylesheet took the role in the next release, in their examples, their READMEs and the blocks: the rows of [Item](#c-item), the ticks of the [Pricing Table](#c-pricing-table), the steps of the [Stepper](#c-stepper), the tasks of the [Onboarding Checklist](#c-onboarding-checklist), the list of the [Notification Center](#c-notification-center), the key of [Uptime](#c-uptime), the legal links of the [Footer](#c-footer), which sit outside its `<nav>` columns, the steps of a [Trace](#c-trace) and the gallery of the [Lightbox](#c-lightbox). Where the count matters in a list of your own, add `role="list"` to your markup.

The role came in with version 0.2.0. It was checked in Chrome and its accessibility tree, where it changes nothing, and not in Safari with VoiceOver: the choice rests on what WebKit says and on its code. The [Accessibility](#g-accessibility) guide has the rules every component follows.
