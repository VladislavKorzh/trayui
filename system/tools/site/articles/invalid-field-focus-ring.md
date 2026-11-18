# Why invalid fields lose their focus ring

An error outline written after the focus rule, at the same specificity, replaces the focus ring of an invalid field. Why it happens, and two ways to keep both.

After a failed submit, a good form moves focus to the first field that is wrong, so the person lands on it with its error message tied to it by `aria-describedby`. That is the moment many forms draw the field in red and, with the same rule, take away its focus ring.

## The bug in three rules

A field with a grey border, a dark focus ring, and a red edge for a wrong value:

```css
.field { border: 1px solid #767676; border-radius: 6px; padding: 8px 12px; font: inherit; }
.field:focus-visible { outline: 3px solid #1a1a1a; outline-offset: 2px; }
.field[aria-invalid="true"] { border-color: #b3261e; outline: 2px solid #b3261e; outline-offset: -1px; }
```

```html
<label for="email">Email</label>
<input class="field" id="email" type="email" aria-invalid="true"
       aria-describedby="email-error" value="dana@">
<p id="email-error">Enter an email address with a domain, such as dana@example.com</p>
```

`.field:focus-visible` is one class and one pseudo-class; `.field[aria-invalid="true"]` is one class and one attribute selector. Both have the specificity (0,2,0). When two rules of equal specificity set the same property, the one that comes later in the stylesheet wins, and an element has one `outline`. So while the field is invalid, the red outline is the only one it gets, focused or not.

In Chromium, with the field reached by Tab, `:focus-visible` matches and its rule loses: the computed outline is `solid 2px rgb(179, 38, 30)` with an offset of `-1px`. On screen the field has a red ring and no focus ring. The red ring is also shaped like a focus ring, so the field looks the same as an invalid field without focus.

## Two other ways to lose it

The same cascade removes the ring in other forms.

- **`outline: none` in the error rule.** A design that draws errors as a thick red border often removes the outline so the two edges do not double up: `.field:invalid { border: 2px solid #b3261e; outline: none; }`. `:invalid` is a pseudo-class, (0,2,0) again, and later, so a focused invalid field has no outline at all.
- **One property doing two jobs.** A focus ring drawn as a shadow, `.field:focus-visible { outline: none; box-shadow: 0 0 0 3px #1a1a1a; }`, and an error drawn as a shadow, `.field.is-invalid { box-shadow: 0 0 0 1px #b3261e; }`. `box-shadow` is one property too: the later rule wins, and the focused field shows a 1px red line.

| The rule that wins | What the focused invalid field shows in Chromium |
| --- | --- |
| an `[aria-invalid]` outline after the `:focus-visible` outline | a 2px red outline, no focus ring |
| `:invalid { outline: none }` | a red border, no outline |
| an error `box-shadow` after a focus `box-shadow` | a 1px red shadow, no focus ring |

`:invalid` has a second problem: a required field that is empty is invalid from the moment the page loads, before the person has typed anything. [`:user-invalid`](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid) matches a field whose value is not valid "after the user has interacted with it", and MDN lists it as available across browsers since November 2023. Forms that check values in a script and set `aria-invalid` avoid both pseudo-classes.

## Why the ring matters here

[Success criterion 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (level AA): "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible." For a text field, its Understanding document accepts the text cursor, or text shown as selected, as that indicator. A `<select>`, a checkbox or a button that opens a list of options has neither, and loses its only sign of focus.

The failure technique [F78](https://www.w3.org/WAI/WCAG22/Techniques/failures/F78) names the second half of the problem: "outlines that look the same as the focus outline" make it hard to see the focus indicator even when it is drawn. After a failed submit with three wrong fields, all three wear the same red ring, and the one with focus looks like the other two. The person who was sent to the first error has to find it.

Focus indicators are also subject to 1.4.11 Non-text Contrast, so the ring has to stand out at 3:1 against what is beside it.

## Fix one: a property for each state

Give the error and the focus their own properties, so neither rule can replace the other. The focus ring stays the outline; the error moves to the border and an inset shadow:

```css
.field { border: 1px solid #767676; border-radius: 6px; padding: 8px 12px; font: inherit; }
.field:focus-visible { outline: 3px solid #1a1a1a; outline-offset: 2px; }
.field[aria-invalid="true"] { border-color: #b3261e; box-shadow: inset 0 0 0 1px #b3261e; }
```

Focused and invalid, the field now shows both in Chromium: the 3px dark outline 2px out, and the red edge inside. The order of the rules no longer matters, since they set different properties.

## Fix two: one rule for both states

Sometimes the error has to stay in the outline. In forced colours mode, such as Windows high contrast, the CSS Color Adjustment specification says that "box-shadow and text-shadow compute to none", while an outline stays, in a colour of the person's theme. An error drawn only as a shadow is gone in that mode; [Forced colours mode: fills become edges](#a-forced-colors-mode) covers the rest of that mode.

Then add a rule for a field that is invalid and focused at once. With one class, one attribute selector and one pseudo-class, its specificity is (0,3,0), higher than either rule alone, wherever it sits:

```css
.field[aria-invalid="true"]:focus-visible {
  outline: 3px solid #1a1a1a;
  outline-offset: 2px;
  box-shadow: inset 0 0 0 1px #b3261e;
}
```

The outline is the focus ring again, and the red edge moves inside as a shadow for as long as the field has focus. In forced colours that shadow is dropped while the field has focus, and the error message under the field still says what is wrong.

## Check it in the browser

Reach each invalid field with Tab and look. Or paste this into the console of a page with errors showing; it focuses each invalid control in turn and prints what it draws:

```js
for (const el of document.querySelectorAll('[aria-invalid="true"]')) {
  el.focus();
  const s = getComputedStyle(el);
  console.log(el.id, el.matches(':focus-visible'), s.outlineStyle, s.outlineColor, s.boxShadow);
}
```

A field that prints the colour of your errors for `outlineColor`, or `none` for `outlineStyle`, has lost its ring. If `:focus-visible` prints `false`, the browser decided that this focus did not need a ring; Tab to the field instead.

## Invalid fields in Tray UI

A wrong value in Tray UI is `aria-invalid="true"` on the control, with `aria-describedby` pointing at a `tray-field__error` that says what to do. The [Field](#c-field) page has the markup, and its rule: after a failed submit, move focus to the first invalid field.

These are Tray UI's three rules for an input, shown for `.tray-input` alone; the stylesheet lists the textarea, the native select and the Select trigger in each:

```css
.tray-input:focus-visible { outline: 2px solid var(--ink); outline-offset: 0; }
.tray-input[aria-invalid="true"] { outline: 2px solid var(--danger); outline-offset: -2px; }
.tray-input[aria-invalid="true"]:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 0;
  box-shadow: inset 0 0 0 2px var(--danger);
}
```

The first two have the specificity (0,2,0), and the second came later, so until version 0.2.0 an invalid field drew its 2px `danger` edge in place of the focus ring. The third rule is fix two above: the focus ring on the edge in ink, and the danger edge inside it. In the Light theme, Chromium draws an invalid field without focus with a 2px `#b3261e` outline 2px inside its edge, and the same field with focus with a 2px `#141414` outline and a 2px `#b3261e` inset shadow. The release notes put it in one line: "a focused field that is invalid keeps its focus ring".

The other fields follow the same idea.

- **[Input Group](#c-input-group).** The group draws the edges for the field inside it. `.tray-input-group:focus-within` and `.tray-input-group:has([aria-invalid="true"])` were equal at (0,2,0), since `:has()` counts as its argument; a third rule with both, `:has([aria-invalid="true"]):focus-within`, puts the ring back.
- **[Input OTP](#c-input-otp).** `aria-invalid` sits on the row of cells, and the focused cell gets the ring with the danger edge inside.
- **[Tag Input](#c-tag-input).** The text field carries `aria-invalid`, and the tray around it draws the danger edge as an inset shadow, so its focus ring, an outline, is never replaced. In forced colours, where that shadow is dropped, the tray takes a 2px outline for the error while it does not have focus.

The [Input](#c-input), [Textarea](#c-textarea), [Select](#c-select) and [Native Select](#c-native-select) pages describe each field's own states. Like the rest of version 0.2.0, this was checked in Chrome, not yet in a screen reader. The [Accessibility](#g-accessibility) guide has the rules every component follows.
