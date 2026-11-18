# 54 accessibility bugs in 108 components

What a check of Tray UI's 108 components against their own code found: focus dropped to the page, missing names, silent changes, small targets, and the fixes.

Version 0.2.0 of Tray UI gave each of its 108 components a section on accessibility. Checking those sections against the script, the stylesheet and the examples turned up a list of 54 problems: 8 that run through many components, 33 in one component each, and 13 in the example markup only. The fixes went into one commit of 147 files. Each fix was checked in Chrome and its accessibility tree; none was tested in a screen reader.

## Focus dropped to the page

When the element that has focus is disabled, hidden or removed, the browser moves focus to the `body`; Chrome does it in all three cases. The next Tab starts again from the top of the page.

This was the longest entry, with places in 15 components: the number stepper at its limit, the ends of a carousel, the pages of a data table, the Dismiss button of a banner or a toast, a cookie consent's answers, a context menu after a choice, a removed file, filter chips, the Latest button of a message list, a checklist's last task, Mark all as read, a questionnaire's Back and Finish, a tour's Skip, and the video player's large Play button.

One function fixes them. `rescue(el, to)` runs before `el` is hidden, removed or disabled, and moves focus to `to` only if focus is inside `el`. This is the stepper, in 0.1.0 and now:

```js
// 0.1.0: the button that reaches the limit turns off under the reader's finger
b.disabled = off;

// 0.2.0: if it has focus, the group takes it first
function rescue(el, to) {
  const a = document.activeElement;
  if (!el || !a || (el !== a && !el.contains(a))) return;
  const t = typeof to === 'function' ? to() : to;
  if (!t || !t.focus || !t.isConnected) return;
  if (!t.matches('a[href], button, input, select, textarea, summary, [tabindex]')) t.setAttribute('tabindex', '-1');
  t.focus({ preventScroll: true });
}
if (off) rescue(b, root);
b.disabled = off;
```

Pressing Enter on "One more" up to the limit left focus on `body` in 0.1.0; now it ends on the group named "Quantity". Each component picks its target:

| Component | Focus goes to |
| --- | --- |
| Carousel | The other arrow button, or the track |
| Data Table | The other page button, or the line that says which rows show |
| Toast | The next toast's first button, or where focus came from |
| Banner, Cookie Consent | The next control in the page, as Tab would go |
| File Upload | The next file's remove button, the one before, or the field |
| Tour | The part of the page the step pointed at |

Mark all as read is the exception: with nothing left to mark it is now `aria-disabled="true"` instead of `disabled`, so it keeps focus. [Where focus goes when its element disappears](#a-focus-when-element-disappears) covers the technique in plain JavaScript.

## Focus rings that did not show

An invalid field lost its focus ring. Both rules had the same specificity, and the danger edge came later in the file, so it won:

```css
/* 0.1.0: equal specificity (0,2,0), and the later rule wins on focus */
.tray-input:focus-visible { outline: 2px solid var(--ink); outline-offset: 0; }
.tray-input[aria-invalid="true"] { outline: 2px solid var(--danger); outline-offset: -2px; }

/* 0.2.0: a rule for both states; the danger edge moves inside, as a shadow */
.tray-input[aria-invalid="true"]:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 0;
  box-shadow: inset 0 0 0 2px var(--danger);
}
```

In Chrome, tabbing into an invalid field drew the red outline in 0.1.0 and draws the ink ring with the red edge inside it now. The select, the input group, the one-time code and the tag input had the same fix. [Why invalid fields lose their focus ring](#a-invalid-field-focus-ring) goes further.

Four more rings were hidden by something else:

- **Your own chat bubble** is filled with ink, so an ink ring on a link inside it did not show. It takes the colour of the text now.
- **A code block** clips to its round corners with `overflow: hidden`, which cut off the ring of its scrolling `<pre>`. The ring is drawn 3px inside the edge now.
- **The command palette's** search field had `outline: none` and nothing in its place. The search row now draws a 2px ring on `:focus-within`.
- **A tour step** marked the part it points at with a 3px ink outline, the focus ring exactly. The mark is a dashed 2px line further out now, and gives way to the focus ring.

## Names that went missing

A label can take a name away. A Select's trigger is a button named by its label through `aria-labelledby`, and that name replaces the button's content, so the value shown inside was never part of it. Chrome's tree gave "Jar size" with "50 g" on screen. The behaviour now adds the value to the list of ids:

```html
<span class="tray-label" id="jar-label">Jar size</span>
<button class="tray-select-trigger" type="button" aria-labelledby="jar-label jar-value">
  <span class="tray-select-trigger__value" id="jar-value">50 g</span>
</button>
```

Its name is now "Jar size 50 g", and the Date picker does the same with its date. The other names that went missing:

- **The collapsed sidebar** and **the stepper below 34rem** hid the words of their links with `display: none`, which takes them out of the accessibility tree too, so the links had no name. The words are hidden from sight alone now, as `tray-vh` hides them.
- **A reaction** in the example had an `aria-label`, which hid its count. It is named by its contents now, the hidden word and the count.
- **A labelled rule** ("or" between two ways to sign in) had `role="separator"`. A separator takes its name from the author only and its children are presentational, so the "or" may not be read. It is a plain `<p>` now.
- **The lists of a Select and a Combobox** had no name. Each is now named as its control is.
- **A Popover of text alone** left focus on its trigger, and nothing was read. It becomes a dialog named by its title, described by its text, and takes focus.

## Changes that nobody heard

A change on screen reaches a screen reader through a live region, or focus on the new content.

- **The Chart's** live region sat inside its `role="img"`, and MDN says browsers "apply role presentation to all descendant elements of any `img` element". The region is beside the drawing now: see [Accessible charts](#a-accessible-charts).
- **The secret's copy button** showed a tick whether the copy worked or not, `writeText(value).then(said, said)`, and said nothing. A refused copy now shows a warning, and a hidden status says "Copied" or "Copy failed".
- **A slider** with a unit was read as a bare number. `aria-valuetext` now carries the unit: "30 km".
- **The price switch** of a pricing table changed every price in silence. A status reads the new prices now.
- **A done task** of the onboarding checklist was marked only by a tick and a line through its title. A hidden ", done" follows the title now.
- **The bell** showed its unread count only in a badge. Its name is "Notifications, 2 unread" now, and the badge is `aria-hidden`.
- **Tag Input** put `aria-invalid` on the tray around the field, where a screen reader never lands. It is on the text field now, a wrong chip says what is wrong in hidden words, and at the limit Enter keeps what was typed and says why.
- **Toasts** were inserted with their words and their role at once: see [Toast notifications that screen readers announce](#a-toast-notifications-screen-readers).

## Keys that did not do what they promised

- **Tab left menus open.** Select, the user menu, the workspace switcher and every dropdown menu stayed open behind focus. They close when focus leaves them now.
- **Submenus** opened on `:focus-within`, so ArrowDown walked into them and Up and Down walked out. They are menus of their own now, opened by the arrow towards them, Enter or Space.
- **The menubar** put every trigger in the Tab order. It is one stop now, with arrows between its menus.
- **The Date picker** did not open on ArrowDown, though its page said so, and its panel had no role. ArrowDown opens it now, and the panel is the dialog that `aria-haspopup="dialog"` promises.
- **The tour** ignored Escape, which closes it now.
- **The video's seek slider** moved a tenth of a second per arrow key. An arrow moves five seconds now.
- **Right to left,** the arrow keys of the Calendar, the Carousel and the resize handle did not swap, and the Calendar's month buttons were named in English only. The arrows follow the page's direction now, and the names come from `data-prev-label` and `data-next-label`.

## Targets under 44 pixels

Tray UI's rule is 44px for anything a finger must hit. WCAG 2.2 asks for 24 by 24 at level AA (2.5.8) and 44 by 44 only at AAA (2.5.5), so most of these missed the system's rule and met AA. Six were smaller: extra small buttons and toggles at 40px, a chip's remove button at 28px, reactions at 32px, footer links at 36px, the checkboxes of a notification matrix 26px wide, and the resize handle at 16px.

A transparent pseudo-element makes the target larger than the drawing:

```css
.tray-btn--xs { position: relative; }
.tray-btn--xs::before {
  content: "";
  position: absolute;
  inset: calc((var(--size-xs) - var(--size-hit)) / 2); /* (40px - 44px) / 2: 2px past each edge */
}
```

The chip's remove button and the reactions use the same rule. Footer links are 44px rows now, and each checkbox label of the matrix is 44px each way.

## Motion and zoom

Under `prefers-reduced-motion: reduce`, overlays already only faded and toasts appeared at once. Five kinds of movement had been missed: the press of a button, turning chevrons, the knob of a switch, filling bars, and a folding sidebar. One block stops them now:

```css
@media (prefers-reduced-motion: reduce) {
  .tray-btn:active, .tray-toggle:active { transform: none; }
  .tray-btn, .tray-toggle, .tray-switch__track::before, .tray-sidebar__caret {
    transition-property: background-color, color, filter;
  }
  .tray-progress__bar::before, .tray-sidebar { transition: none; }
}
```

The five heading sizes were `clamp(2.75rem, 6.6vw, 6rem)` and the like. Between its ends a size in `vw` does not follow zoom, which WCAG lists as failure F94 of 1.4.4 Resize Text. Each middle term has a part in `rem` now: `clamp(2.75rem, 0.25rem + 6.2vw, 6rem)`.

Lists drawn without bullets, such as the activity feed and the changelog, carry `role="list"` now, so that Safari still reports them as lists: see [list-style: none in Safari keeps lists lists](#a-list-style-none-safari).

## What was left as it is

- **The resize handle** has no 44px band, which would cover the first pane's scrollbar, and dragging is its only pointer route, which 2.5.7 Dragging Movements does not allow. Its page says so and advises buttons or a menu that set fixed sizes.
- **Reveal and the secret's show button** use two valid patterns. Reveal keeps the name "Show password" and says its state with `aria-pressed`. The secret's button changes its name between "Show the key" and "Hide the key" and carries no `aria-pressed`. The bug was doing both at once: a pressed button named "Hide password" says its state twice.

Four things were left open after 0.2.0, and three are fixed in version 0.3.0:

1. The two buttons of the secret were 40px with no 44px band; they have one now.
2. The disabled step of the compact Pagination was an `<a>` without `href`, which Chrome's tree shows as `generic`, a role on which ARIA prohibits `aria-label`. It takes `role="link"` now, with `aria-disabled="true"`.
3. The Navigation Menu example had no `<nav>`, though its page says it has one; it has one now.
4. Still open: the rem part of the heading sizes is small. Measured in Chrome in a 1280-pixel window, the largest heading grows by 6% at 200% zoom, where body text doubles, and reaches double its size at 400%, as it did before.

## The fixes in Tray UI

The fixes are in version 0.2.0, listed in the [Changelog](#d-changelog). `TrayUI.rescue(el, to)` is public, for scripts of your own that hide a control. The [Accessibility](#g-accessibility) guide has the rules the components follow, and each component's page has its own Accessibility section, as [Select](#c-select), [Tag Input](#c-tag-input) and [Resizable](#c-resizable) do.
