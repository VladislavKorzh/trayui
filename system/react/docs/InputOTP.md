---
category: Forms
keywords: [input otp, one-time code, verification code, pin, sms code, two-factor, 2fa]
---
# Input OTP

Input OTP takes a short one-time code, one character per cell.

## Use
```tsx
<Field label="Code from the message" hint="Sent to the number ending in 27.">
  <InputOTP separator={3} onComplete={(code) => verify(code)} />   {/* six cells, a rule after the third */}
</Field>

<Field label="Code from the message" error={wrong ? 'That code does not match. Try again.' : undefined}>
  <InputOTP length={4} value={code} onChange={setCode} onComplete={verify} />
</Field>
```

## Behaviour
Focus moves forward as digits are typed and back on Backspace; the arrow keys move between cells; a pasted code spreads across the cells. `onChange` gets the code at every change; `onComplete` gets it the moment the last cell is filled. To clear the cells after a wrong code, set a controlled `value` to `''`.

The first cell carries `autocomplete="one-time-code"`, so phones offer the code from the message. Inside a Field, the Field's label names the group: it is a span the group points at with `aria-labelledby`, since each cell has a name of its own ("Character 1 of 6"). An `error` rings every cell. Pass `name` to send the code with a form.

## You provide
The number of cells (`length`, four to eight, default six) and where the separator goes.

## Do and don't
- Do verify as soon as the last digit lands; don't ask for a second tap.
- Do offer "Send a new code" beside it.
- Don't use it for anything that is not a short code: no passwords, no postcodes.
