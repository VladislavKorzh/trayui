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

## Do and don't
- Do verify as soon as the last digit lands; don't ask for a second tap.
- Do offer "Send a new code" beside it.
- Don't use it for anything that is not a short code: no passwords, no postcodes.
