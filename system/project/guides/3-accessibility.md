# Accessibility

The system is built to pass WCAG 2.2 AA in every theme. These are the rules that keep it there.

## Contrast

- Text is `ink`, `ink-soft` or `ink-muted` on `page`, `surface`, `raised` and `leaf`: at least 4.5:1 in every theme. `ink-hint` holds 4.5:1 on `page`, `surface` and `raised` only; never use it on `leaf` or `inverse`.
- On `accent` all text is `on-accent`: 12.9:1 in Light and Dark, and from 9.52:1 (Lilac) to 13.47:1 (Forest) in the other themes. On `inverse` use `on-inverse`, `on-dark-soft` and `on-dark-muted`; they hold 4.5:1 on the fills inside the ink card (`inverse-off`) too. There `danger` and `success` become `on-dark-danger` and `on-dark-success` by themselves, since the colours of a light theme are too dark to read on ink. On the yellow card they become `paper-danger` and `paper-success`, which read on the accent of every theme.
- `danger` and `success` hold at least 4.5:1 as text on `page`, `surface` and `raised` in every theme, and always come with words or an icon. The lowest pair is `danger` on `surface` in the light themes, from 5.65:1 (Linen) to 5.89:1 (Light); `success` holds at least 6.51:1.
- Control edges (`control-off`) hold 3:1 on `page` and `surface`; on `raised` the components switch to `ink-hint`.
- Two of the four data colours are below 3:1 on light grounds. Charts therefore never rely on colour: several series always come with a legend, a tooltip and a table of the same figures, and text is never set in a data colour.

## Focus

Keyboard focus is a solid 3px `ink` ring, 3px out, on every ground. Fields draw theirs at 2px on the edge; tabs, menu items and days draw it inside. On a yellow surface in the dark theme the ring of the surface itself takes the theme's ink, so it shows on the dark page. Never remove a focus ring without drawing another.

Focus order follows reading order. Opening a dialog, sheet, drawer or popover moves focus into it; closing returns focus to the control that opened it.

A page with a header of links starts with a skip link, so a keyboard user can pass over them (WCAG 2.4.1): `<a class="tray-skip" href="#main">Skip to the content</a>`, the first thing in the `<body>`, and `<main id="main">`. It stays out of sight until it takes focus, then shows as a small ink button at the top start of the window.

## Targets

Buttons, fields, tabs, menu items, days and pages are at least 44px tall (`size-hit`). The extra-small button and toggle, a reaction and the remove button of a chip look smaller and reach 44px past their edge; checkboxes, radios and switches extend their target over the whole label row.

A few are smaller. The nested links of a sidebar, the rows of a file tree and the labels of a sidebar's folding sections are 36px rows as wide as the sidebar. The Slider is 28px tall, its knob 28px round; a press anywhere on its track moves the knob there. The handle of Resizable is a 16px strip as long as the panes it divides, and with a pointer it only drags: where the size matters to the task, offer fixed sizes another way, as its page says.

## Names and roles

- Every control has a visible label, or an `aria-label` when it is an icon button. A Tooltip repeats the name; it never holds the only copy.
- State lives in ARIA attributes, and the styles read those same attributes: if it looks selected, it is announced as selected.
- Components use the element the browser already provides wherever one exists, so they work without script and with assistive technology: `details`, `dialog`, real form controls, `table` with captions and scoped heads.
- Charts carry a written `summary` and are focusable. A chart with points along an axis can be walked with the arrow keys, each value said aloud; a radial chart and horizontal bars are read from their summary and their table of figures.

## Motion

Nothing moves on its own and nothing auto-advances. Under `prefers-reduced-motion: reduce` nothing travels or scales: menus, popovers, tooltips, dialogs, sheets and drawers only fade, in a tenth of a second; toasts, the sliding pills, the drawn tick, the unfolding answers, a bumping count and a popping word change at once; the skeleton and marker pulses and the progress slide stop; smooth scrolling becomes instant; and the spinner turns slowly instead of stopping so it still reads as activity.

## More contrast, forced colours, print

The system draws most things as a fill with no edge. Three settings of the person's own take those fills away or make them weak, and the stylesheet answers each:

- **More contrast** (`prefers-contrast: more`). Each grey takes the value its theme gives the next step towards the ink (`ink-soft` becomes `ink`, `ink-muted` becomes `ink-soft`, and so on, down to `hairline`), and every tray, field and quiet control gets a 1px edge. `tokens.css` writes the steps for every theme, and the theme maker on the site writes them for a theme of your own.
- **Forced colours** (Windows high contrast and the like). The browser replaces every colour with the few the person chose and drops fills and shadows. Buttons, fields, trays and what floats get an edge; what is chosen (a tab, a segment, a pressed toggle, the current page, a checked box, an on switch, a picked day) is drawn in the system's colours for a chosen item, `SelectedItem` and `SelectedItemText`; the option under the keyboard in a list is `Highlight`. Switches, sliders, meters and thin rules are drawn in system colours too, since they are nothing but fills. The marks of a chart keep the colours of their series, so the key still tells them apart; a chart of one series takes the text colour.
- **Print**. The page prints in the values of the Light theme, whatever theme it wears on screen. Trays get a thin edge in place of the fill the browser leaves out; a fill that carries meaning (what is chosen, a bar, a meter, the ink card) prints as it is. The sidebar of the app, toasts, tooltips and open menus stay off paper, and what belongs together does not break across sheets. Add `tray-noprint` to keep anything else off paper, and `tray-print-only` to show a thing on paper alone.

## Reading direction

Styles use logical properties throughout. Set `dir="rtl"` and layouts mirror, the axis of a chart and the seek bar of the Video Player with them: the first label and the start of the film are on the right, and the arrow keys follow. Mark directional icons with `tray-icon--flip`. Numbers and code do not mirror.

## Checks before shipping

1. Tab through the screen: every control is reachable, visibly focused, and operable with Enter, Space, the arrow keys and Escape.
2. Turn on the dark theme: nothing is illegible, yellow surfaces are unchanged.
3. Zoom to 200% and narrow to 320px: nothing overlaps, tables scroll inside their wrapper.
4. Read it with a screen reader: every control says what it is, its state, and what happened after an action.
5. Turn on more contrast and a high-contrast theme of the system, and print the page: every control still shows where it is and what is chosen.
