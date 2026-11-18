# Right to left: which arrows to flip

Right to left, back arrows and chevrons flip; a clock, a play button and a check do not. Logical properties, dir, and arrow keys that follow the screen.

Arabic, Hebrew, Persian and Urdu are read from right to left, and an interface in those languages is a mirror image of its English version: the back button on the right, the next page on the left, a progress bar that fills towards the left. Most of that mirroring is free once the page says its direction. Icons and arrow keys are where it needs decisions.

## Say the direction in HTML

The W3C's internationalisation guide, [Structural markup and right-to-left text](https://www.w3.org/International/questions/qa-html-dir), is short on this: "Add `dir="rtl"` to the html tag any time the overall document direction is right-to-left (RTL)." It adds two rules. "Never use CSS to apply the base direction", so not `direction: rtl` in a stylesheet. And text that people write, such as a name, a comment or a search, takes `dir="auto"`, so its own first strong character decides its direction.

```html
<html lang="ar" dir="rtl">
  …
  <p class="comment" dir="auto">…text a person wrote…</p>
</html>
```

`dir` sets the direction and nothing else. The language of the page is `lang`, and the two are set together.

## Logical properties do the layout

Flexbox and grid already lay their items out from the start edge, so a row of buttons reverses by itself. Margins, paddings, borders and positions follow when they are written as logical properties: `margin-inline-start` in place of `margin-left`, `padding-inline-end` in place of `padding-right`, `inset-inline-start` in place of `left`, `text-align: start` in place of `text-align: left`. In Chromium, `margin-inline-start: 40px` gives a computed `margin-left` of 40px in a left-to-right page and a `margin-right` of 40px under `dir="rtl"`.

Some CSS has no logical form and needs a rule of its own for right to left:

- a `transform` that moves along the line, such as `translateX()` on a switch's knob;
- a `background-position` or a gradient written `to right`;
- a chevron drawn with borders and turned with `rotate()`.

Write those rules with `:dir(rtl)`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:dir) puts the difference plainly: `[dir=rtl]` attribute selectors "match the HTML dir attribute, and ignore elements that lack it", even when they inherit a direction, while `:dir()` "will match the value calculated by the user agent, even if inherited". It has been available across browsers since December 2023. The difference shows inside a `dir="ltr"` part of a right-to-left page, such as a block of code: `[dir="rtl"] .icon` still matches there, because an ancestor carries the attribute, and `.icon:dir(rtl)` does not.

## Which icons flip

The guides of Material Design and Apple agree on the principle. An icon flips when its direction stands for the reading direction or for moving forward and back; it stays when it shows a real object, a universal sign, or a direction that is the same in every language.

| Flip | Keep as drawn |
| --- | --- |
| Back and forward arrows | A clock, and a refresh arrow that turns clockwise |
| Previous and next chevrons, in a pager, a carousel or a calendar | Play, pause and the other media controls |
| The chevron of a breadcrumb, and of an item that opens a submenu to the side | A check |
| Send, reply, undo and redo | A search magnifier |
| A list icon with its bullets at the start, and other icons that draw lines of text | Logos, and objects such as a keyboard or a camera |
| A speaker with sound waves in front of it | A slash that means off |

The sources, in their words:

- [Material Design, Bidirectionality](https://m1.material.io/usability/bidirectionality.html): "The most important icons for mirroring are back and forward buttons." On the other side: "Clocks still turn clockwise for RTL languages", and "Do not mirror media playback buttons and the media progress indicator as they refer to the direction of the media being played, not the direction of time." The search icon keeps its handle at the bottom right "because the majority of users are right-handed", and "Most RTL countries do not mirror slashes".
- [Apple's Human Interface Guidelines, Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left): "a back button must point to the right"; "Flip interface icons that represent text or reading direction"; "People expect universal symbols and marks like the checkmark to have a consistent appearance, so avoid flipping them"; "clocks work the same everywhere".
- Google's [list of Material icons to mirror](https://developers.google.com/fonts/docs/material_icons#which_icons_should_be_mirrored_for_rtl) names, among others, `arrow_back`, `chevron_left`, `send`, `reply`, `undo`, `redo`, `list` and `open_in_new`.

Two cases need a choice. Apple flips "controls that show progress from one value to another", such as sliders and progress bars; Material keeps the media progress bar left to right, since it follows the tape and not the reading. And Apple keeps any control "that refers to an actual direction": an arrow that means "to the right" in a map or a layout tool keeps pointing right.

Numbers keep their order too. Apple's guide says the digits of a number, such as a phone number or a card number, "always appear in the same order", and Material lists numbers among what is not mirrored. A one-time code split into one box per digit is such a number: give its row `dir="ltr"`, as Tray UI's [Input OTP](#c-input-otp) does with `direction: ltr` on its cells.

## Flip an icon with CSS

A mirrored icon is the same drawing turned over on its vertical axis. Mark the icons that flip with a class, and turn them in one rule:

```html
<a href="/customers"><svg class="icon flip" aria-hidden="true"><use href="#arrow-left"/></svg>Customers</a>
```

```css
.flip:dir(rtl) { transform: scaleX(-1); }
```

An icon that also turns needs its whole transform in each rule, since a later `transform` replaces an earlier one whole. A chevron that points along the line while its section is closed and down while it is open takes, in a right-to-left page, `scaleX(-1)` when closed and `rotate(90deg)` when open.

## Arrow keys follow the screen

The APG's keyboard tables for tabs, menubars, sliders and trees name ArrowLeft and ArrowRight without a word about right to left. The browser's own controls show the convention. In Chromium, under `dir="rtl"`:

- a range input draws its minimum on the right, and ArrowLeft raises its value;
- in a group of radio buttons, ArrowRight moves to the radio on the right, which is the one before.

The arrow points the way focus, or the thumb, moves on the screen. In a horizontal widget, ArrowLeft goes to the item on the left; in a right-to-left page that is the next one. Home and End keep their meaning, first and last, and the first is now on the right. ArrowUp and ArrowDown do not change.

A tablist that does it:

```html
<div role="tablist" aria-label="Order" id="order-tabs">
  <button role="tab" aria-selected="true">Items</button>
  <button role="tab" tabindex="-1">Delivery</button>
  <button role="tab" tabindex="-1">Payment</button>
</div>
```

```js
const list = document.getElementById('order-tabs');
const tabs = [...list.querySelectorAll('[role="tab"]')];

list.addEventListener('keydown', (e) => {
  const rtl = getComputedStyle(list).direction === 'rtl';
  const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
  if (!step) return;
  e.preventDefault();
  const i = tabs.indexOf(document.activeElement);
  tabs[(i + step + tabs.length) % tabs.length].focus();
});
```

The script reads the computed direction at the moment of the key press, which follows the nearest `dir` above the list. In Chromium, ArrowLeft on "Items" moves to "Delivery" in a right-to-left page and to "Payment" in a left-to-right one, and inside a `dir="ltr"` block of a right-to-left page it behaves as left to right. A full tablist also selects the tab and shows its panel; this shows the keys alone.

The same rule decides a submenu. It opens with the arrow that points towards it: ArrowRight in a left-to-right menu, ArrowLeft in a right-to-left one, and the other arrow closes it. [Nested submenus that work from the keyboard](#a-nested-submenus-keyboard) has the rest of their keys.

## Right to left in Tray UI

Put `dir="rtl"` on `<html>`, or on a region, with the right `lang`, and Tray UI mirrors. Its stylesheet is written with logical properties, and the [Direction](#c-direction) page shows a form in both directions.

You mark the icons that flip with `tray-icon--flip`:

```css
.tray-icon--flip:dir(rtl) { transform: scaleX(-1); }
```

The examples mark the back links of the [Page Header](#c-page-header) and the [Top Bar](#c-top-bar), the chevrons of [Pagination](#c-pagination), the previous and next buttons of the [Carousel](#c-carousel) and the [Lightbox](#c-lightbox), and a "Next" [Button](#c-button) with its arrow; the [Calendar](#c-calendar) script adds the class to its month buttons itself. Up to 0.2.0 the rule used the attribute form, so an icon with the class inside a `dir="ltr"` block of a right-to-left page flipped too; since the next release it uses `:dir(rtl)`, and such an icon stays as drawn. Clocks, the play button and checks carry no class and stay as drawn. The [Icons](#f-icons) page has the full set, under Lucide's names.

What Tray UI turns over by itself has a right-to-left rule in the stylesheet, also written with `:dir(rtl)`: the chevron of a native select, the separators of the [Breadcrumb](#c-breadcrumb), the carets of the [Sidebar](#c-sidebar), the knob of a [Switch](#c-switch), the fill of a [Slider](#c-slider) and the band of a range in the Calendar.

These components move with ArrowLeft and ArrowRight, and each reads the computed direction:

| Component | Under `dir="rtl"` |
| --- | --- |
| [Tabs](#c-tabs), [Menubar](#c-menubar) | ArrowLeft moves to the next tab or menu |
| [Dropdown Menu](#c-dropdown-menu) | ArrowLeft opens a submenu, which opens to the left; ArrowRight closes it |
| [Carousel](#c-carousel), [Lightbox](#c-lightbox) | ArrowLeft shows the next slide or picture |
| [Calendar](#c-calendar) | the week runs from right to left, and ArrowLeft moves to the next day |
| [Resizable](#c-resizable) | the first pane is on the right, and ArrowLeft widens it; a drag reads the same direction |
| [Input OTP](#c-input-otp) | the cells stay left to right, and ArrowLeft goes to the cell on the left, the one before |
| [Chart](#c-chart) | in a bar, line or area plot, ArrowLeft moves to the next point |
| [Video Player](#c-video-player) | on the seek bar, ArrowLeft moves five seconds on |

The last two rows are a choice. In a right-to-left page, Tray UI's chart plots start on the right, and the video player's bar puts the play button on the right, with a seek bar that runs to the left; the play icon itself is not flipped. That matches Apple's advice on progress, and Material advises the opposite for media. To keep a player's controls left to right as Material advises, put `dir="ltr"` on its `tray-player__bar`: in Chromium the bar then lays out from the left and its seek bar's keys follow.

Like the rest of version 0.2.0, the mirrored keys were checked in Chrome, not with a screen reader. The [Accessibility](#g-accessibility) guide has the rules every component follows.
