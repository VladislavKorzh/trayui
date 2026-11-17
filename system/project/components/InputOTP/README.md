# Input OTP

Input OTP takes a short one-time code, one character per cell.

## Markup
```html
<div class="tray-otp" data-tray="otp" role="group" aria-label="Six-digit code">
  <input><input><input><span class="tray-otp__sep"></span><input><input><input>
</div>
```
The behaviour moves focus forward as digits are typed, back on Backspace, and spreads a pasted code across the cells. When every cell is filled it fires `tray:complete` with `detail.value`. Set `aria-invalid="true"` on the group when the code is wrong and say so in a `tray-field__error` beneath.

## You provide
The number of cells (four to eight), where the separator goes, and the first cell's `autocomplete="one-time-code"` so phones offer the code from the message.

## Accessibility
The cells are one `role="group"`, named by `aria-label` or `aria-labelledby`. The behaviour names each cell "Character 1 of 6", sets `maxlength="1"`, and sets `inputmode="numeric"` unless you set another. Typing moves focus to the next cell, `Backspace` in an empty cell clears the one before and moves there, and `ArrowLeft` and `ArrowRight` step between cells. A pasted code fills the cells from the focused one on, and a cell selects its character when it takes focus, so typing replaces it. Point the group's `aria-describedby` at the error, as in the example.

## Do and don't
- Do verify as soon as the last digit lands; don't ask for a second tap.
- Do offer "Send a new code" beside it.
- Don't use it for anything that is not a short code: no passwords, no postcodes.
