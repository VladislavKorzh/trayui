# A WCAG 2.2 AA checklist for components

What to check in a component for WCAG 2.2 AA: names, keyboard, focus, target size, contrast, status messages, motion, zoom and dragging, by criterion.

WCAG is met by pages: a page conforms at level AA when it meets every criterion of levels A and AA. Components decide much of that, since a page inherits their names, keys and focus rings. This list groups the criteria by what a component builder checks, with how Tray UI meets each one and where it leaves the work to you.

WCAG 2.2 added six criteria at A and AA: 2.4.11, 2.5.7, 2.5.8 and 3.3.8 at AA, 3.2.6 and 3.3.7 at A. It also removed 4.1.1 Parsing. Every claim about Tray UI below was checked in Chrome and its accessibility tree; nothing in Tray UI has been tested with a screen reader.

## Names, roles and states

| Check | Criterion | In Tray UI |
| --- | --- | --- |
| Every control has a role and a name, and its state is exposed and follows it | 4.1.2 Name, Role, Value (A) | Native elements first. State lives in ARIA attributes that the CSS reads: a [Toggle](#c-toggle) looks pressed because of `aria-pressed="true"` |
| The visible words are in the name, at its start | 2.5.3 Label in Name (A) | An [Integration Card](#c-integration-card) button shows "Connect" and is named "Connect Chat alerts" |
| Structure is in the markup | 1.3.1 Info and Relationships (A) | A [Table](#c-table) has a caption and `scope` on every head; a group of checkboxes goes in a `fieldset` |
| Every field has a label, and its hint is tied to it | 3.3.2 Labels or Instructions (A) | [Field](#c-field): `<label for>`, and `aria-describedby` for the hint |
| Fields for personal data say what they hold | 1.3.5 Identify Input Purpose (AA) | The examples of [Auth Form](#c-auth-form) and [Payment Method](#c-payment-method) set `autocomplete`: `username`, `current-password`, `cc-number` |

## Keyboard

| Check | Criterion | In Tray UI |
| --- | --- | --- |
| Everything works from the keyboard | 2.1.1 Keyboard (A) | Buttons are `<button>`; menus, tabs, lists and the calendar move with the arrow keys; Escape closes what floats |
| Focus can always leave | 2.1.2 No Keyboard Trap (A) | A modal [Dialog](#c-dialog) is a native `<dialog>`, closed by Escape; menus close when Tab leaves them |
| Focus follows reading order, and moves into what opens | 2.4.3 Focus Order (A) | A dialog, sheet, drawer or popover takes focus as it opens and gives it back as it closes |
| A shortcut of one character can be turned off or remapped | 2.1.4 Character Key Shortcuts (A) | The script binds no shortcut. [Kbd](#c-kbd) only shows one; making it work is up to you |

A button disabled, hidden or removed while it has focus sends focus to the `body`. Tray UI moves it to a neighbour first, with `TrayUI.rescue(el, to)`.

## Focus you can see

| Check | Criterion | In Tray UI |
| --- | --- | --- |
| A focused control shows a ring | 2.4.7 Focus Visible (AA) | A 3px `ink` ring, 3px outside the edge. Fields draw 2px on their edge; tabs and menu items draw it inside |
| The ring stands out from what is next to it | 1.4.11 Non-text Contrast (AA) | `ink` holds 10:1 on `page`, `surface`, `raised` and `leaf` in every theme, far above 3:1 |
| A focused control is not entirely covered by sticky content | 2.4.11 Focus Not Obscured (Minimum) (AA) | Left to you, see below |

Tray UI has a sticky top bar (`tray-topbar--sticky`), a sticky header in the [App Shell](#c-app-shell) and a [Cookie Consent](#c-cookie-consent) that can be pinned over the page, and sets no `scroll-padding`. In a test page in Chrome with a 64-pixel sticky header, Shift+Tab up a column of 58 links left 5 of them entirely under it. The Understanding document's one sufficient technique, C43, is scroll padding, and with it none was hidden:

```css
/* at least the height of the sticky header */
html { scroll-padding-block-start: 5rem; }
```

## Target size

| Check | Criterion | In Tray UI |
| --- | --- | --- |
| A pointer target is at least 24 by 24 CSS pixels, or has room around it | 2.5.8 Target Size (Minimum) (AA) | The system's own floor is 44px (`--size-hit`), the size of 2.5.5 at AAA |

An extra small button is 40px to the eye, and a pseudo-element reaches 2px past each edge. A checkbox, a radio or a switch takes presses on its whole label row. The show and copy buttons of a secret are 40px, under the floor and above 24.

## Contrast and colour

| Check | Criterion | In Tray UI |
| --- | --- | --- |
| Text reads at 4.5:1, large text at 3:1 | 1.4.3 Contrast (Minimum) (AA) | 66 contrast rules, held in all 10 themes; `python3 tools/themes.py --check` measures them |
| The edge and the state of a control read at 3:1 | 1.4.11 Non-text Contrast (AA) | `control-off` holds 3:1 on `page` and `surface`; on `raised` the components switch to `ink-hint` |
| Colour is never the only sign | 1.4.1 Use of Color (A) | `danger` and `success` always come with words or an icon. A [Chart](#c-chart) of several series has a key, a tooltip and a table of its figures |

## Status messages

| Check | Criterion | In Tray UI |
| --- | --- | --- |
| A result, a wait or an error is announced without taking focus | 4.1.3 Status Messages (AA) | A [Toast](#c-toast) goes into a polite live region, a danger toast is an alert. Copy buttons, [Tag Input](#c-tag-input), the price switch of a [Pricing Table](#c-pricing-table) and the empty list of a [Combobox](#c-combobox) speak through hidden live regions |

An error that appears under a field is not announced by itself. After a failed submit, move focus to the first invalid field, which reads its error with it; that is your form code.

```html
<div class="tray-field">
  <label class="tray-label" for="phone">Phone</label>
  <input class="tray-input" id="phone" type="tel" value="555"
         aria-invalid="true" aria-describedby="phone-error">
  <p class="tray-field__error" id="phone-error">Enter the phone number with its area code.</p>
</div>
```

That field carries the label (3.3.2), the state (4.1.2), an error in words (3.3.1 Error Identification, A), and a danger edge that is not the only sign (1.4.1). What the error suggests (3.3.3 Error Suggestion, AA) is yours to write.

## Content on hover or focus

| Check | Criterion | In Tray UI |
| --- | --- | --- |
| What appears on hover or focus can be dismissed, hovered and stays | 1.4.13 Content on Hover or Focus (AA) | A [Tooltip](#c-tooltip) hides on Escape while focus stays, lets the pointer move onto it, and stays while its control has focus |

## Motion and time

| Check | Criterion | In Tray UI |
| --- | --- | --- |
| A time limit can be turned off or extended | 2.2.1 Timing Adjustable (A) | A toast with an action, and a danger toast, stay until dismissed. Other toasts leave after 5 seconds and pause under the pointer or focus |
| Nothing moves on its own for more than five seconds beside other content | 2.2.2 Pause, Stop, Hide (A) | Nothing auto-advances: the [Carousel](#c-carousel) moves only when asked. Under reduced motion the skeleton's pulse stops |
| Motion from interaction can be turned off | 2.3.3 Animation from Interactions (AAA) | Beyond AA. Under `prefers-reduced-motion: reduce` nothing travels or scales |

## Zoom, reflow and spacing

| Check | Criterion | In Tray UI |
| --- | --- | --- |
| Text grows to 200% | 1.4.4 Resize Text (AA) | Body text is in `rem` and doubles at 200% zoom |
| At 320 CSS pixels wide nothing needs scrolling both ways | 1.4.10 Reflow (AA) | A wide table scrolls inside `tray-table-wrap`, a pattern the Understanding document shows as passing |
| Wider letter, word, line and paragraph spacing loses nothing | 1.4.12 Text Spacing (AA) | Not measured: test it on your pages |

The five heading sizes are `clamp()` with a `vw` middle term. Measured in Chrome in a 1280-pixel window, the largest grows from 83 to 88 pixels at 200% zoom and doubles at 400%. Failure F94 asks that text "can be resized up to 200% of the default". To reach that at 200% zoom, raise the `rem` part of `--display-size` and its neighbours.

## Dragging and pointers

| Check | Criterion | In Tray UI |
| --- | --- | --- |
| What can be dragged can also be done with single taps or clicks | 2.5.7 Dragging Movements (AA) | Left to you for [Resizable](#c-resizable), below. A [Slider](#c-slider) is the browser's own range; a [File Upload](#c-file-upload) has a file field beside its drop zone |
| Nothing runs on the press alone | 2.5.2 Pointer Cancellation (A) | Buttons act on the click, and a dialog closes on its backdrop only when the press and the release are both on it. An open menu closes on a press outside it |

Keys do not count: the Understanding document says a keyboard equivalent meets 2.5.7 only if it "also provides controls that can be clicked or tapped with a pointer". The resize handle moves with the arrow keys, and with a pointer it only drags. Where the size matters, add buttons that set fixed sizes.

## Forms and sign-in

| Check | Criterion | In Tray UI |
| --- | --- | --- |
| Signing in needs no memory test, or allows paste and password managers | 3.3.8 Accessible Authentication (Minimum) (AA) | [Input OTP](#c-input-otp) spreads a pasted or filled-in code over its cells, and its first cell takes `autocomplete="one-time-code"`; Reveal shows the password |
| Nothing asked earlier in a process is asked again | 3.3.7 Redundant Entry (A) | A matter of your flow, left to you |

## What Tray UI leaves to you

These belong to the page:

- the page title (2.4.2), its language (3.1.1), and headings that describe their sections (2.4.6);
- a text alternative for every picture (1.1.1), and captions for every film (1.2.2), as a `<track>` in the Video Player;
- a way past repeated blocks (2.4.1): the App Shell gives landmarks, and a skip link is yours to add;
- help in the same place on every page (3.2.6);
- scroll padding under a sticky header (2.4.11), and a route without dragging for the resize handle (2.5.7);
- the words of errors and of chart summaries;
- a test with a real screen reader, which Tray UI has not had.

## The checklist in Tray UI

The [Accessibility](#g-accessibility) guide has the rules every component follows and five checks to run before shipping. Each component's page has its own Accessibility section, and [54 accessibility bugs in 108 components](#a-accessibility-bugs-108-components) lists what checking them found.
