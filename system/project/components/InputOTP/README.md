# Input OTP

Input OTP takes a short one-time code, one character per cell.

## Markup
```html
<div class="tray-otp" data-tray="otp" role="group" aria-label="Six-digit code">
  <input><input><input><span class="tray-otp__sep"></span><input><input><input>
</div>
```
The behaviour moves focus forward as digits are typed, back on Backspace, and spreads a pasted code across the cells. When every cell is filled it fires `tray:complete` with `detail.value`. Set `aria-invalid="true"` on the group when the code is wrong, say so in a `tray-field__error` beneath, and point the group's `aria-describedby` at it.

## You provide
The number of cells (four to eight), where the separator goes, and the first cell's `autocomplete="one-time-code"` so phones offer the code from the message.

## Accessibility
The cells are one `role="group"`, named by `aria-label` or `aria-labelledby`. The behaviour names each cell "Character 1 of 6", keeps one character in each, and sets `inputmode="numeric"` unless you set another. Typing moves focus to the next cell, `Backspace` in an empty cell clears the one before and moves there, and `ArrowLeft` and `ArrowRight` step between cells. A pasted code, or a whole code that a phone fills into the first cell from the message, is spread over the cells from that one on, and focus goes to the cell after it. A cell selects its character when it takes focus, so typing replaces it. A group is not announced as invalid, so the behaviour copies the group's `aria-invalid` and `aria-describedby` to every cell, and keeps them in step when you change them: each cell is then read as invalid, with the error. A focused cell of a wrong code draws the focus ring on its edge and keeps its `danger` edge inside.

## Do and don't
- Do verify as soon as the last digit lands; don't ask for a second tap.
- Do offer "Send a new code" beside it.
- Don't use it for anything that is not a short code: no passwords, no postcodes.
