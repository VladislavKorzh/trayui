# Tag input: chips, a limit and spoken errors

A tag input in plain HTML and JavaScript: chips with a remove button, Backspace, a limit, repeats, and errors marked on the text field and said aloud.

## One field, many values

A tag input takes several short values in one field: the tags of an order, the addresses a report goes to, the cities a shop delivers to. Each value becomes a chip with a button that removes it, and the caret waits after the last chip for the next one.

HTML has no element for it, and the WAI-ARIA Authoring Practices have no pattern for it. It is built from parts that do exist: a text field with a label, a chip of plain text for each value, a button for each removal, a hidden input for the form and a live region that says what changed. Tray UI's [Tag Input](#c-tag-input) is built that way, and each section below shows what it does next to a version you can write yourself.

Two jobs belong to other controls. Picking from a known list, such as a country or a team, is a [Combobox](#c-combobox) or a set of [checkboxes](#c-checkbox). Long text does not fit in a chip, which holds a word or an address.

## The markup

```html
<label for="to">Send the report to</label>
<div class="tags" id="to-box">
  <span class="chip" data-value="dana@perly.example">dana@perly.example<button type="button" aria-label="Remove dana@perly.example">×</button></span>
  <input id="to" type="email" aria-describedby="to-hint to-error">
</div>
<p id="to-hint">Press Enter or a comma after each address. Up to five.</p>
<p id="to-error"></p>
<span class="visually-hidden" aria-live="polite" id="to-said"></span>
<input type="hidden" name="to" id="to-store">
```

- **The label names the text field.** It is the one control a person types in. The box around it is a plain `div` with no role: it takes no focus, and a state set on it belongs to no control.
- **A chip is text and a button.** The button is named "Remove" and the value. Read out of context, in a list of buttons, "Remove dana@perly.example" still says which chip goes; five buttons named "×" would all have the same name.
- **The hint and the error describe the field.** `aria-describedby` lists both. The error paragraph stays empty until something is wrong. Hiding it is not enough: the accessible name specification counts the text of a hidden element that `aria-describedby` points to, and Chrome puts it in the description.
- **The hidden input carries the values** to the form, joined by commas.
- **The live region is in the page from the start.** A region that arrives with its first message is often not announced, as [Toast notifications that screen readers announce](#a-toast-notifications-screen-readers) explains.

The region is hidden from the eye with a class, not with `display: none` or `hidden`, which would take it out of the accessibility tree too. Tray UI's class is `tray-vh`:

```css
.tray-vh { position: absolute; inline-size: 1px; block-size: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
```

## The keys

| Key | Where | What happens |
| --- | --- | --- |
| Enter or comma | In the field, with text | The text becomes a chip and the field empties. |
| Tab | In the field, with text | The text becomes a chip as focus leaves. |
| Backspace | In the empty field | The last chip is removed. |
| Shift+Tab | In the field | Focus moves to the last chip's button. |
| Enter or Space | On a chip's button | That chip is removed and focus returns to the field. |

Enter in a text field can submit its form, so the handler calls `preventDefault()`, but only while the field holds text. With the field empty, Enter submits the form as usual. Tray UI also splits a paste on commas, semicolons and spaces, so a list copied from a spreadsheet becomes several chips at once.

Each remove button is a Tab stop. Shift+Tab from the field reaches the last chip's button, then the one before it, so every chip can be removed without a pointer.

## Focus after a chip is removed

The button that removes a chip goes with it. When the focused element leaves the page, focus does not move to a neighbour: `document.activeElement` becomes `body`. In Chrome the next Tab goes on from where the button was, but until then nothing has focus, and a key pressed next, such as Backspace for the chip before, goes to the page.

So the script moves focus first. Tray UI sends it back to the text field after a press on a remove button, from the mouse or the keyboard:

```js
root.addEventListener('click', function (e) {
  var x = e.target.closest('.tray-chip__x');
  if (x) { drop(x.closest('.tray-chip')); input.focus(); } else if (e.target === root) input.focus();
});
```

The field is where the next step happens: typing a new value, or Backspace to remove one more. A click on the empty part of the box goes to the field as well, so the whole box behaves like one input. Version 0.2.0 lists "a chip removed" among the controls that now hand focus on.

## Saying what changed

A new chip shows on the screen and makes no sound. The result of an action is a status message in WCAG 2.2, and success criterion 4.1.3 (level AA) asks that it can be presented by assistive technologies "without receiving focus". Tray UI gives every tag input its own polite region, appended to the tray when the script starts, and writes one short line into it after each change:

| What happened | What the region says |
| --- | --- |
| A value is added | "gift added" |
| A chip is removed | "gift removed" |
| A repeat is typed | "gift is already in the list" |
| The limit is reached | "Kharkiv not added: the limit is 4" |
| A wrong value is added | "books@perly added, not an email address" |

A small function, `say()`, empties the region and writes the new line in the next animation frame. When the same words come twice, such as two repeats, it adds a no-break space to the second, so the text differs and is read again.

```js
function say(status, words) {
  status.textContent = '';
  var said = words === lastSaid ? words + '\u00a0' : words;
  lastSaid = said;
  requestAnimationFrame(function () { status.textContent = said; });
}
```

A paste needs care. A pasted "jam; honey salt" makes three chips in one handler, and three lines written in the same frame leave the region with "salt added" alone. Tray UI gathers them and says the paste in one message: "jam added. honey added. salt added". In your own script, say a paste once too, whole or with its count: "3 tags added".

## A limit

`data-max="4"` stops at four values. A fifth that is typed stays in the field, and the region says "Kharkiv not added: the limit is 4". The person can remove a chip and press Enter again without typing the city twice. Pasted values that do not fit stay in the field too, so nothing pasted is lost, and the limit is said once for all of them: "salt, pepper not added: the limit is 4".

The field is never disabled at the limit. A disabled field cannot take focus, so Backspace could no longer remove the last chip, and focus would drop to the page if it was there. Say the limit before it is reached as well, in the hint under the field ("Up to four on the Stall plan"), since the live message at the limit is not shown on the screen.

## Repeats

A value already in the list adds nothing. The field empties and the region says "gift is already in the list". Tray UI compares the values exactly, so "Gift" and "gift" are two tags. If case means nothing for your values, compare them in lower case before you add one.

## Wrong values and aria-invalid

With `data-pattern="email"`, a value that does not look like an email address still becomes a chip. Keeping it lets the person see what they typed and remove it, where a value thrown away is lost. The chip takes `data-invalid` and a `danger` edge, and a hidden span after its value, ", not an email address", so the chip's text, as assistive technology gets it, is "books@perly, not an email address".

The field itself takes `aria-invalid="true"` while any wrong chip is left. MDN describes `aria-invalid` as the mark of a value "not in a format or a value the application will accept", and it belongs on the control that a person reaches with Tab, the one whose name and description carry the hint and the error. Before 0.2.0 Tray UI put it on the tray around the field, a `div` that nothing focuses; now the script puts it on the text field and takes it off the tray.

The script removes only the mark it set itself. A flag records that it added `aria-invalid`, so an error put on the field by the server or by your own validation stays when the last wrong chip goes.

The edge and the attribute are not enough for WCAG 2.2 success criterion 3.3.1 (level A), which asks that an error "is described to the user in text". Tray UI leaves the words to you: put them under the field in a `tray-field__error`, and add its `id` to the field's `aria-describedby`, as the [Field](#c-field) does.

The tray draws its focus ring as an outline and its error edge as an inset shadow, so the two show at once:

```css
.tray-tags:focus-within { outline: 2px solid var(--ink); outline-offset: 0; }
.tray-tags:has(input[aria-invalid="true"]) { box-shadow: inset 0 0 0 2px var(--danger); }
@media (forced-colors: active) {
  .tray-tags:has(input[aria-invalid="true"]):not(:focus-within) { outline: 2px solid; outline-offset: -2px; }
}
```

In forced colours `box-shadow` computes to `none`, so there the edge becomes an outline inside the tray while it is not focused.

## A script from scratch

This runs the markup above: Enter, comma and Tab add a value, Backspace and the buttons remove one, repeats and the limit are said, and wrong addresses are kept, marked and described.

```js
const box = document.getElementById('to-box');
const field = document.getElementById('to');
const said = document.getElementById('to-said');
const error = document.getElementById('to-error');
const store = document.getElementById('to-store');
const MAX = 5;

const chips = () => [...box.querySelectorAll('.chip')];
const values = () => chips().map((c) => c.dataset.value);
const valid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// A live region that is already in the page: clear it, then write in the next frame
function tell(words) {
  said.textContent = '';
  requestAnimationFrame(() => { said.textContent = words; });
}

// The form value, aria-invalid on the text field, and the error in words
function update() {
  store.value = values().join(',');
  const wrong = chips().find((c) => c.hasAttribute('data-invalid'));
  if (wrong) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
  error.textContent = wrong ? `"${wrong.dataset.value}" is not a full email address.` : '';
}

// false when there is no room: the caller leaves the text in the field
function add(raw) {
  const v = raw.trim().replace(/[,;]+$/, '');
  if (!v) return true;
  if (values().includes(v)) { tell(`${v} is already in the list`); return true; }
  if (values().length >= MAX) { tell(`${v} not added: the limit is ${MAX}`); return false; }
  const chip = document.createElement('span');
  chip.className = 'chip';
  chip.dataset.value = v;
  chip.append(v);
  if (!valid(v)) {
    chip.setAttribute('data-invalid', '');
    chip.insertAdjacentHTML('beforeend', '<span class="visually-hidden">, not an email address</span>');
  }
  const x = document.createElement('button');
  x.type = 'button';
  x.setAttribute('aria-label', `Remove ${v}`);
  x.textContent = '×';
  chip.append(x);
  box.insertBefore(chip, field);
  update();
  tell(`${v} added${valid(v) ? '' : ', not an email address'}`);
  return true;
}

function remove(chip) {
  chip.remove();
  update();
  tell(`${chip.dataset.value} removed`);
}

field.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ',') && field.value.trim()) {
    e.preventDefault();
    if (add(field.value)) field.value = '';
  } else if (e.key === 'Backspace' && !field.value && chips().length) {
    remove(chips().at(-1));
  }
});

field.addEventListener('blur', () => {
  if (field.value.trim() && add(field.value)) field.value = '';
});

box.addEventListener('click', (e) => {
  const x = e.target.closest('.chip button');
  if (x) {
    remove(x.closest('.chip'));
    field.focus(); // the button is gone: focus goes back to the field
  } else if (e.target === box) {
    field.focus();
  }
});

update();
```

- **Draw focus on the box.** Give the field `outline: none` and the box an outline under `:focus-within`, as Tray UI does, so the ring goes round the chips and the field together.
- **Give each button room.** A chip's button is small to the eye; a pseudo-element can make its target larger without moving the chip.
- **Chips from the server** need no script of their own: `values()` reads every chip in the box, and the last line sets the hidden input and the error for them.

## The tag input in Tray UI

Write the field, the chips you already have, the text field and a hidden input, with `data-tray="taginput"` on the tray:

```html
<div class="tray-field">
  <label class="tray-label" for="tags">Order tags</label>
  <div class="tray-tags" data-tray="taginput">
    <span class="tray-chip" data-value="gift">gift<button type="button" class="tray-chip__x" aria-label="Remove gift"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-x"/></svg></button></span>
    <input id="tags" placeholder="Add a tag" aria-describedby="tags-hint">
    <input type="hidden" name="tags">
  </div>
  <p class="tray-field__hint" id="tags-hint">Press Enter or a comma after each one.</p>
</div>
```

| Attribute | What it does |
| --- | --- |
| `data-pattern="email"` | A value that is not an email address becomes a `danger` chip, and the text field takes `aria-invalid`. |
| `data-invalid-text` | What a wrong chip says after its value. "not an email address" with `data-pattern="email"`, else "not valid". |
| `data-max="5"` | No more than five values; past the limit the text stays in the field and the limit is said. |

The script adds the live region, the keys, the paste, the focus after a removal and the marks above, and fires `tray:change` on the tray with `{ values, valid }` after each change. A chip's remove button is 28px to the eye and 44px to a finger, through a `::before` that reaches 8px past each edge. The [Tag Input](#c-tag-input) page has a live example with an email list and a limit, and [Installation](#d-installation) has the three files to link. Like the rest of version 0.2.0, this was checked in Chrome, not in a screen reader.
