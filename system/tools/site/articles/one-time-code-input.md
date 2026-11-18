# A one-time code input with paste and autofill

A one-time code field that takes a typed code, a pasted one and SMS autofill: one-time-code, inputmode, cells or one field, and why one field can be better.

After a password, many sign-ins ask for a code: six digits sent by text message, by email or from an authenticator app. People enter it in three ways. They type it from another screen, they paste it from an email, or their phone offers it from the message and fills it in. The field has to take all three. The examples below are plain HTML and JavaScript, and Tray UI's [Input OTP](#c-input-otp), which draws the code as a row of cells, is the worked example.

## Start with one field

GOV.UK's Design System asks for a code from a text message with a single text field. With a label and a hint, it looks like this:

```html
<label for="code">Code from the message</label>
<p id="code-hint">Sent to the number ending in 27.</p>
<input id="code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code"
       pattern="[0-9]{6}" aria-describedby="code-hint" required>
```

- **`type="text"`.** A code is a string of digits that happens to look like a number. web.dev's guide to SMS code forms calls `type="number"` "not recommended": the browser treats the value as a quantity, and its up and down buttons "may remove preceding zeros". `012345` has to stay `012345`.
- **`inputmode="numeric"`.** It asks for a keyboard of digits on a phone. MDN: "Numeric input keyboard, but only requires the digits 0–9." It changes nothing about the value.
- **`autocomplete="one-time-code"`.** MDN defines the token as "a one-time password (OTP) for verifying user identity", "most commonly" received "via some out-of-channel mechanism, such as SMS, email, or authenticator application". It is what lets the browser offer the code.
- **`pattern` and `required`.** The form checks for six digits before it submits. Check again on the server, where the code is compared anyway.
- **A hint, tied with `aria-describedby`.** Say where the code went. Someone with two phones needs to know which one to look at.

## Accept the code as it arrives

Codes are written as "409316", "409 316" or "409-316", depending on who sent them. GOV.UK's advice: "Let the user enter the code in whatever format is familiar to them. Allow additional spaces, hyphens and dashes." Clean the value as it changes and keep the digits:

```js
const code = document.getElementById('code');
// Keep the digits: a code pasted as "409 316" or "409-316" becomes "409316"
code.addEventListener('input', () => {
  const digits = code.value.replace(/\D/g, '').slice(0, 6);
  if (digits !== code.value) code.value = digits;
});
```

Leave `maxlength` off the field. The browser applies it before your script runs: a pasted "409 316" is cut to "409 31", and the last digit is lost. The `slice(0, 6)` above trims after the spaces have gone. For a code that may hold letters, replace `/\D/g` with `/[^0-9A-Za-z]/g`, widen the `pattern` to match, and use `inputmode="text"`.

## What autofill does

The code arrives on the phone in a text message, and two mechanisms bring it into the page.

- **Safari, through `autocomplete="one-time-code"`.** web.dev says Safari 12 and later, on iOS, iPadOS and macOS, parses the code out of the message, and the keyboard suggests it. One tap fills the field that carries the attribute with the whole code.
- **Chrome on Android, through the WebOTP API.** A script calls `navigator.credentials.get({ otp: { transport: ['sms'] } })`, the person consents, and the call returns the code for the script to write into the field. MDN marks the API as experimental and not supported in every browser, and it works only over HTTPS.

web.dev recommends ending the message with a line that binds the code to your site, and the WebOTP API requires it:

```text
Your sign-in code is 409316.

@www.example.com #409316
```

MDN describes the format: the last line holds the domain of the site, preceded by `@`, a space, and the code, preceded by `#`. web.dev adds why: the suggestion then appears only on that domain, which makes the code harder to phish, and the browser reads the code without guessing at the text around it.

## Boxes drawn on one field

Many designs show a code as a row of boxes, one per digit. A single field can wear them. With a monospaced font, `letter-spacing` steps each digit into a box of its own, and a repeating gradient draws the boxes behind:

```css
.code {
  --cell: 3rem;  /* one box */
  --gap: .5rem;  /* between boxes */
  inline-size: calc(6 * (var(--cell) + var(--gap)));
  block-size: 3.5rem;
  padding: 0 0 0 calc((var(--cell) - 1ch) / 2);
  border: 0;
  box-sizing: content-box;
  font: 600 1.5rem/1 ui-monospace, monospace;
  letter-spacing: calc(var(--cell) + var(--gap) - 1ch);
  background: repeating-linear-gradient(to right, #ececec 0 var(--cell), transparent 0 calc(var(--cell) + var(--gap)))
    0 0 / calc(6 * (var(--cell) + var(--gap)) - var(--gap)) 100% no-repeat;
}
```

Each character advances by `1ch` plus the letter spacing, which is one box and one gap, and the left padding centres the first digit in the first box. The field is wide enough for the spacing after the sixth digit, so the text never scrolls. The boxes stay a picture: the value, the caret, paste and autofill are the field's own.

## Six fields, if you need them

Tray UI draws the code as cells: one `<input>` per character, in a `role="group"` with a name. Each piece of behaviour that a single field has for free then needs code. Tray UI's script does all of the following, and the README of its Input OTP lists them.

- **A name for every cell.** "Character 1 of 6", so each field says where it sits. The group carries the name of the whole, such as "Code from the message".
- **Autofill lands in one cell.** Only the first cell carries `autocomplete="one-time-code"`, so a phone that offers the code fills all of it into that cell. Tray UI removes `maxlength` from the cells for this reason, and spreads the code from that cell on.
- **Paste, from any cell.** The pasted code is spread from the cell that had focus, and focus goes to the cell after it.
- **Typing moves on.** A digit moves focus to the next cell. A cell selects its character when it takes focus, so a new digit replaces the old one.
- **Backspace goes back.** In an empty cell it clears the cell before and moves there. ArrowLeft and ArrowRight step to the cell on their side. The cells run left to right in a right-to-left page too, so the code keeps its order.
- **The error, on every cell.** `aria-invalid` is not one of the states of a `group`: MDN lists the roles it is used in, and `group` is not among them. Tray UI copies the group's `aria-invalid` and `aria-describedby` to each cell, and keeps them in step.

The spreading is the heart of it. This version for six cells handles autofill, paste and a digit typed over a full cell, and drops spaces and hyphens:

```js
const cells = [...document.querySelectorAll('.cells input')];
const clean = (text) => text.replace(/[\s-]/g, '');

// Puts a code in the cells from cell i on, and focuses the cell after it
function spread(i, text) {
  const chars = [...clean(text)].slice(0, cells.length - i);
  chars.forEach((ch, k) => { cells[i + k].value = ch; });
  cells[Math.min(i + chars.length, cells.length - 1)].focus();
}

cells.forEach((cell, i) => {
  cell.addEventListener('input', (e) => {
    let text = clean(cell.value);
    if (text.length > 1 && e.data?.length === 1) text = e.data; // one key over a full cell
    if (text.length > 1) return spread(i, text); // autofill, or a whole code at once
    cell.value = text;
    if (text && cells[i + 1]) cells[i + 1].focus();
  });
  cell.addEventListener('paste', (e) => {
    e.preventDefault();
    spread(i, e.clipboardData.getData('text'));
  });
  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !cell.value && i > 0) {
      e.preventDefault();
      cells[i - 1].value = '';
      cells[i - 1].focus();
    }
  });
  cell.addEventListener('focus', () => cell.select());
});
```

The form also needs the six values joined into one, in a hidden input or in the submit handler.

## Why one field can be better than six

The six cells above work, and Tray UI ships them. Before choosing them, weigh what one field gives without any script:

- **One name, one value.** Assistive technologies meet one text field called "Code from the message" whose value is "409316". With cells, the person meets six fields, each with one digit, and checks the code by visiting all six.
- **One stop for Tab.** Cells are six stops, and moving back to fix the third digit means moving through the others.
- **The browser's own editing.** Select all, delete, undo and the caret keys work within one field. They stop at the edge of each cell, so the script has to stand in for them.
- **Autofill and paste with nothing to catch.** The browser puts the code where it belongs. With cells, a missed case in the script, such as a separator it does not expect, puts a character in the wrong cell.
- **One value in the form.** The field's `name` sends the code, and `pattern` checks it.

What cells add is a picture: how many characters are expected, and how many are in. Boxes drawn on one field give the same picture. Choose cells when your design needs separate controls, and then handle each case in the list above.

## Checking the code

Leave a button to submit the code. WCAG names "automatically submitting a form and presenting new content without prior warning when the last field in the form is given a value" as a failure of success criterion 3.2.2, On Input (technique F36). The failure lies in the missing warning. To check the code the moment the sixth digit lands, say so first, for example in the hint: "We check the code as soon as you have typed it." Tray UI's Input OTP gives the same advice: verify on a button press, or say beside the cells that the code is checked once the last digit is in.

When the code is wrong, set `aria-invalid="true"` on the field, write the error in words under it, and add its `id` to `aria-describedby`. Keep the code in the field, so the person can see which digit they mistyped, and offer a way to send a new one.

## The one-time code input in Tray UI

Write the cells in a group with `data-tray="otp"`, a name, and `autocomplete="one-time-code"` on the first cell:

```html
<div class="tray-field">
  <span class="tray-label" id="code-label">Code from the message</span>
  <div class="tray-otp" data-tray="otp" role="group" aria-labelledby="code-label" aria-describedby="code-hint">
    <input autocomplete="one-time-code"><input><input>
    <span class="tray-otp__sep"></span>
    <input><input><input>
  </div>
  <p class="tray-field__hint" id="code-hint">Sent to the number ending in 27.</p>
</div>
```

The script names each cell "Character 1 of 6", sets `inputmode="numeric"` unless you set another, removes `maxlength`, and handles the keys and the spreading described above. Since 0.2.0 a whole code that is typed, pasted or filled in is spread over the cells; spaces in it are dropped. Since the next release so is anything else a cell does not take: a numeric cell keeps digits only, so "409-316" fills all six cells, and a key it does not take, such as a hyphen, changes nothing. When every cell holds a character, the group fires `tray:complete` with the code in `detail.value`:

```js
document.querySelector('[data-tray="otp"]').addEventListener('tray:complete', (e) => {
  console.log(e.detail.value); // "409316"
});
```

For a wrong code, set `aria-invalid="true"` on the group, write the error in a `tray-field__error`, and point the group's `aria-describedby` at it. The script copies both to every cell, and each cell draws its `danger` edge. Use four to eight cells, with `tray-otp__sep` where the code splits, and keep the component for short codes: its README rules out passwords and postcodes.

The [Input OTP](#c-input-otp) page has a live example of a code and of a wrong one. The [Auth Form](#c-auth-form) lists the `autocomplete` value of every sign-in field, and [Installation](#d-installation) has the lines that link the stylesheet and the script.
