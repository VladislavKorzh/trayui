# Space and shape

Space, corners, sizes, the one shadow and the rest of the scale: each a token, with its value and what it is for.

## Spacing

| Token | Value | Use |
| --- | --- | --- |
| `--space-1` | `4px` | The gap between segments, tabs and stepper buttons; the padding of the tray that holds them. |
| `--space-2` | `8px` | Label to field; icon to text in a small control; between stacked choices. |
| `--space-3` | `12px` | Control to its text (checkbox, radio, avatar); rows of a compact list. |
| `--space-4` | `16px` | The grid gap between cards; between fields; icon to label in a large button. |
| `--space-5` | `20px` | The padding of an accordion row or a list row. |
| `--space-6` | `24px` | Between a heading and its content inside a card. |
| `--space-7` | `28px` | Card padding on a phone (the lower end of `card-pad`). |
| `--space-8` | `32px` | Horizontal padding of a large button; between groups inside a card. |
| `--space-9` | `36px` | Between sections of a form. |
| `--space-10` | `40px` | Page padding on desktop (the upper end of `page-pad`). |
| `--space-12` | `48px` | Card padding on desktop (the upper end of `card-pad`). |
| `--space-16` | `64px` | Between the parts of an empty state; large vertical breathing room inside a card. |

## Radius

| Token | Value | Use |
| --- | --- | --- |
| `--radius-card` | `40px` | Cards, dialogs, sheets and drawers. Radii step down with nesting. |
| `--radius-panel` | `28px` | A panel inside a card; popovers and hover cards. |
| `--radius-button` | `20px` | Large buttons; the tray of a segmented control, tab strip or stepper; menus. |
| `--radius-input` | `16px` | Inputs, selects, textareas, choice cards, medium buttons, toasts. |
| `--radius-control` | `14px` | Small buttons, segments, tabs, menu items, calendar days. |
| `--radius-chip` | `12px` | Chips, badges, tooltips, extra-small buttons, avatars. |
| `--radius-mark` | `4px` | Chart marks and their key swatches, the checkbox, a key cap. |
| `--radius-pill` | `999px` | Meters, sliders and the switch only. |

## Size

| Token | Value | Use |
| --- | --- | --- |
| `--size-lg` | `64px` | Height of a large button: the main action of a page or card. |
| `--size-md` | `56px` | Height of inputs, selects, and a medium button that sits in a row with them. |
| `--size-segment` | `52px` | Height of a segment and of a stepper button. |
| `--size-sm` | `48px` | Height of a small button and of the theme switch, in a header or toolbar. |
| `--size-hit` | `44px` | The smallest target for nearly everything: tabs, menu items, calendar days, icon buttons in a row. Smaller, as the accessibility guide says: the 36px nested links of a sidebar, rows of a file tree and labels of folding sections, the 28px Slider, the 16px handle of Resizable. |
| `--size-xs` | `40px` | Height of a chip, and of an extra-small button in a dense toolbar or table. |
| `--size-icon` | `20px` | The icon box. An icon is drawn on Lucide's 24px grid and shown at this size, with a 2px stroke. |

## Layout

| Token | Value | Use |
| --- | --- | --- |
| `--container` | `1360px` | The widest the centred page container gets. |
| `--page-pad` | `clamp(16px, 3vw, 40px)` | Padding between the viewport edge and the container. |
| `--card-pad` | `clamp(28px, 3.4vw, 48px)` | Padding inside every card, dialog and sheet. |
| `--section-gap` | `clamp(72px, 9vw, 128px)` | The even gap between page sections. |
| `--grid-gap` | `16px` | The gap between cards in a bento row. |
| `--measure` | `38rem` | The width of a reading column: about 70 characters of `body`. |

## Shadow

| Token | Value | Use |
| --- | --- | --- |
| `--shadow-float` | `0 6px 20px rgba(20, 20, 20, 0.18)` | The only shadow. For things that float above the page: tooltip, popover, menu, dialog, toast. Never on a resting card, button or input. |

## Fluid

| Token | Value | Use |
| --- | --- | --- |
| `--display-size` | `clamp(2.75rem, 0.25rem + 6.2vw, 6rem)` | Font size of `display`. |
| `--headline-size` | `clamp(2.125rem, 0.25rem + 4.2vw, 4rem)` | Font size of `headline`. |
| `--title-size` | `clamp(1.75rem, 0.25rem + 2.6vw, 2.5rem)` | Font size of `title`. |
| `--subtitle-size` | `clamp(1.375rem, 0.5rem + 1.4vw, 1.75rem)` | Font size of `subtitle`. |
| `--figure-size` | `clamp(4rem, 0.25rem + 7.2vw, 7rem)` | Font size of `figure`. |

## Timing

| Token | Value | Use |
| --- | --- | --- |
| `--ease` | `cubic-bezier(.2, .8, .2, 1)` | The one easing curve, for changes of fill and position, and for everything that appears. |
| `--duration-press` | `.15s` | Hover darkening and the press scale of a button. |
| `--duration-fill` | `.18s` | A change of fill on state: segment, tab, checkbox, card hover. |
| `--duration-move` | `.2s` | Something that travels: the switch knob, the pill of a segment or a tab, a toast. |
| `--duration-in` | `.22s` | Something appearing: a menu or popover opening from its trigger, a dialog, sheet or drawer coming in, a tooltip, a toast. |
| `--duration-out` | `.14s` | The same things going away: always quicker than they came, so a closed thing is out of the way at once. |
| `--ease-exit` | `cubic-bezier(.4, 0, 1, 1)` | The curve of going away: it starts slowly and leaves fast. |
| `--ease-spring` | `cubic-bezier(.3, 1.5, .5, 1)` | A small overshoot for a thing that answers in place: a count that bumps, a word or a tick that pops in. |

## ZIndex

| Token | Value | Use |
| --- | --- | --- |
| `--z-sticky` | `20` | The pinned header. |
| `--z-float` | `40` | Popovers, menus, tooltips. |
| `--z-overlay` | `60` | Scrim, dialog, drawer, sheet. |
| `--z-toast` | `80` | Toasts, above everything. |

## Breakpoint

| Token | Value | Use |
| --- | --- | --- |
| `--bp-phone` | `34rem` | Below this, segmented controls stack their labels and chart labels grow. |
| `--bp-tablet` | `40rem` | From here, fields and choices sit two to a row. |
| `--bp-bento` | `56rem` | From here, cards take unequal widths in a row; below, every card is full width. |
| `--bp-header` | `76rem` | From here, the header is one row; below, the tab strip takes a second, pinned row. |

## Opacity

| Token | Value | Use |
| --- | --- | --- |
| `--opacity-disabled` | `0.45` | A disabled control, with `cursor: not-allowed`. Disabled controls keep their fill. |
