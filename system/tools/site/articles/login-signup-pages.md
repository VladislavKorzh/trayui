# Login and sign-up pages in HTML and CSS

Sign-in and sign-up pages in plain HTML and CSS: labels and autocomplete for password managers, a password that can be shown, errors and other accounts.

A sign-in page is the one screen every person sees before the product. It asks for little, so each detail shows. Tray UI has twelve such pages among its blocks, six for signing in and six for signing up, gathered on [Sign-in and sign-up pages](#b-login). The plain [Sign-in form](#b-login-01) and [Sign-up form](#b-signup-01) are the worked examples here.

## The form

Both pages are one `<form>` in a card: the wordmark, which links home, a heading, the fields, one yellow button, other accounts, and a line that links to the other page.

```html
<form class="tray-card tray-auth" action="/signin" method="post">
  <a class="tray-wordmark" href="/">Counter</a>
  <div class="tray-auth__head">
    <h1 class="title">Sign in</h1>
    <p>Welcome back to Perly Farm.</p>
  </div>
  <div class="tray-field">
    <label class="tray-label" for="email">Email</label>
    <input class="tray-input" id="email" name="email" type="email" autocomplete="username" required>
  </div>
  <div class="tray-field">
    <div class="tray-auth__row">
      <label class="tray-label" for="password">Password</label>
      <a href="/reset">Forgot it?</a>
    </div>
    <div class="tray-input-group">
      <input class="tray-input" id="password" name="password" type="password" autocomplete="current-password" required>
      <button class="tray-input-group__btn" type="button" data-tray="reveal" aria-label="Show password">…eye icon…</button>
    </div>
  </div>
  <button class="tray-btn tray-btn--block" type="submit">Sign in</button>
  <p class="tray-auth__foot">New here? <a href="/signup">Create an account</a></p>
</form>
```

- **A visible label for every field**, tied by `for`. A placeholder is no label: it goes away at the first key. The block's placeholder, `you@farm.example`, only shows the shape of an address.
- **"Forgot it?" sits on the label's line**, in `tray-auth__row`, beside the field it is about. In the tab order it comes between the email and the password.
- **One column.** `tray-auth` is a grid of one column at most 27rem wide, 432 pixels at the default text size. On a 390-pixel phone the card fills the width.

## Autocomplete and password managers

`autocomplete` tells the browser what a field holds, so it and a password manager can fill it. MDN's page on the attribute lists the tokens that matter here:

| Token | MDN's description | Where |
| --- | --- | --- |
| `username` | "A username or account name." | The email on both pages, when the email is what people sign in with |
| `current-password` | "The user's current password." | The password on the sign-in page |
| `new-password` | "A new password." | The password on the sign-up page, and on a page that changes it |
| `one-time-code` | "A one-time password (OTP) for verifying user identity" | The code of a second step |

`new-password` matters most. MDN says the browser may use it "to avoid accidentally filling in an existing password and to offer assistance in creating a secure password". The sign-up block pairs it with `minlength="12"`, and the hint "At least 12 characters." is tied to the field with `aria-describedby`, so it is read with the field.

```html
<input class="tray-input" id="password" name="password" type="password"
       autocomplete="new-password" minlength="12" aria-describedby="password-hint" required>
<p class="tray-field__hint" id="password-hint">At least 12 characters.</p>
```

Do not fight the manager. MDN notes that browsers may ignore `autocomplete="off"` on login fields anyway. WCAG 2.2 adds a reason: success criterion 3.3.8 Accessible Authentication (Minimum), level AA, accepts a password when the browser and password managers can fill it in. Its Understanding document counts a form that actively blocks them from filling the fields, or blocks paste, as a failure unless another way to sign in is offered.

## A password that can be shown

The eye button shows what was typed, for a person checking a password on a small keyboard or one they made up a moment ago. It is a `type="button"`, so it never submits the form, and it changes the field's `type` between `password` and `text`.

What it says matters. Tray UI keeps one name, "Show password", and lets `aria-pressed` carry the state. A press sets `aria-pressed="true"`, which makes the button a toggle that is pressed, and a second press sets it back. A name that changed as well, to "Hide password", would stand beside that pressed state: "Hide password, pressed" says the opposite of what is happening. Its own script, in short:

```js
for (const button of document.querySelectorAll('[data-tray="reveal"]')) {
  const input = button.closest('.tray-input-group').querySelector('input');
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(show));
  });
}
```

Tray UI's version also swaps the icon between `eye` and `eye-off`. [Show password: aria-pressed or a new label](#a-show-password-button) compares this with the other pattern, a name that changes and no `aria-pressed`.

## Errors

There are two kinds, and each has its place.

- **An error in one field** goes under that field, in `tray-field__error`. The field gets `aria-invalid="true"`, which Tray UI draws as a `danger` edge, and `aria-describedby` points at the sentence, so it is read when the field takes focus. The words say what to do: "Add 7 more characters."
- **An error for the whole form**, such as a password that does not match the email, is an [Alert](#c-alert) between the heading and the first field. Say which account failed and why, keep what was typed in the email field, and never clear the form.

The browser already checks `required`, `type="email"` and `minlength`. Left to itself, Chromium stops the form, focuses the first field in error and shows its own bubble. To show the errors in the page in your words, keep the checks and turn off the bubbles with `novalidate`. This script, which is not part of Tray UI, does that for the sign-up form above, with an empty `<p id="email-error">` and `<p id="password-error">` under the fields, each named in its field's `aria-describedby`:

```js
const form = document.getElementById('signup');
form.noValidate = true; // the browser still checks the rules; the page shows the errors

function message(input) {
  const v = input.validity;
  if (v.valueMissing) return `Enter your ${input.labels[0].textContent.toLowerCase()}.`;
  if (v.typeMismatch) return 'Enter an email address, such as you@farm.example.';
  if (v.tooShort) return `Add ${input.minLength - input.value.length} more characters.`;
  return input.validationMessage;
}

form.addEventListener('submit', (event) => {
  let first = null;
  for (const input of form.querySelectorAll('input')) {
    const ok = input.checkValidity();
    document.getElementById(`${input.id}-error`).textContent = ok ? '' : message(input);
    if (ok) input.removeAttribute('aria-invalid');
    else input.setAttribute('aria-invalid', 'true');
    if (!ok && !first) first = input;
  }
  if (first) {
    event.preventDefault();
    first.focus();
  }
});
```

An error that appears is not announced by itself. Moving focus to the first field in error is what makes it heard: in Chromium the password field above is then exposed as invalid, with the description "At least 12 characters. Add 7 more characters."

A form-level error needs care. MDN's page on the `alert` role warns that an element added with `role="alert"` already holding its message "generally does not lead to an announcement", and asks for the element to be in the page first, with the message written into it later. It also says the role is for content shown dynamically, not for content that is there when the page loads. When the server sends the page back with the error, the message is read in its place in the page, and the field's own error each time the field takes focus.

## Other accounts

The blocks offer six other accounts: Google, Apple, Facebook, Telegram, LinkedIn and Microsoft. Each is a link that starts that provider's sign-in.

```html
<p class="tray-rule tray-rule--label">or continue with</p>
<div class="tray-providers" role="group" aria-label="Sign in with another account">
  <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signin/google" aria-label="Continue with Google">Google</a>
  <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signin/apple" aria-label="Continue with Apple">Apple</a>
  …
</div>
```

`tray-providers` is a grid of `repeat(auto-fit, minmax(7rem, 1fr))`: three across in the card, two across on a phone. The button shows the short name and its `aria-label` says the whole sentence. WCAG 2.5.3 Label in Name, level A, asks that the name contain the text shown, because "People who operate with voice interaction use the visible labels in their commands". "Continue with Google" contains "Google", so saying "Google" still reaches it. The Understanding document calls putting the visible words at the start of the name a best practice. Where the name has room, write the whole sentence on the button and leave out `aria-label`, as the account-first pages do.

The order says what the product expects:

- **Email first, accounts after**, as in [the sign-in form](#b-login-01): most people have a password here.
- **Accounts first**, as in [Sign-up with sign-in providers](#b-signup-05): six buttons, then a rule that reads "or with your email", then the form. The group is named by the visible words "Continue with", through `aria-labelledby`.
- **Accounts only**, as in [Sign-in with social accounts](#b-login-06): one button per line with the whole sentence on it, and a quiet "Use your email" link to a page of its own. With no field to fill, the card is a `<section>` named by its heading rather than a form.
- **Two and a menu**, as in [Sign-in page on a tray](#b-login-03): Google and Apple, and a "More" [Dropdown Menu](#c-dropdown-menu) with the other four, in one row of three at every width.

Tray UI ships no provider logos. A provider's mark comes from its own brand kit and under its rules; until you add one, the name stands alone.

## An email link and a passkey

[Email-only sign-in](#b-login-05) has no password field: one email field and a button, "Send me a sign-in link". The hint "We send a link that works for 15 minutes." is tied to the field with `aria-describedby`, so the time limit is read before the person sends it.

Under the accounts sits a full-width button, "A passkey", named "Continue with a passkey". It has no behaviour attached: your script calls the browser's Web Authentication API, `navigator.credentials.get()`. MDN lists one more autocomplete token for this: `webauthn`, last in the list, as in `autocomplete="username webauthn"`. With it, the browser can offer passkeys in the field's own autofill when the script makes a conditional `navigator.credentials.get()` call, one with `mediation: 'conditional'`.

## The page around the form

The form sits in a screen, `tray-screen`, the frame Tray UI uses for pages outside the product. Four arrangements cover the twelve blocks:

| Arrangement | Classes | On a phone |
| --- | --- | --- |
| A card on the white page | `tray-screen__body--center` | The card fills the width. |
| A panel on a grey ground | `tray-screen--tray`, the card a `tray-panel` | The panel fills the width, with the terms at the foot of the page. |
| The form beside a cover | `tray-screen--split` | At 56rem and below the cover is hidden. |
| Form and picture in one card | `tray-auth-wide` | At 56rem and below the two parts stack, the form first. |

The pages under a bar use `tray-screen__body--center-wide`, which centres the form in the height only from 40rem up. On a phone the form stays at the top, under the bar: in the measured block it starts 88 pixels from the top at 390 wide and 177 at 1440. Near the top, a field that takes focus is less likely to sit under the on-screen keyboard.

## Which block to start from

| Block | Start from it when |
| --- | --- |
| [Sign-in form](#b-login-01), [Sign-up form](#b-signup-01) | The usual case: an email, a password, accounts after. |
| [Sign-in page with a cover](#b-login-02), [Sign-up page with a cover](#b-signup-02) | Half the screen can show the product or what the account gets. |
| [Sign-in page on a tray](#b-login-03), [Sign-up page on a tray](#b-signup-03) | The page carries a legal line, or six accounts would crowd the form. |
| [Sign-in card with a picture](#b-login-04), [Sign-up card with a picture](#b-signup-04) | The story beside the form should reach phones too. |
| [Email-only sign-in](#b-login-05) | The product has no passwords. |
| [Sign-in with social accounts](#b-login-06), [Sign-up with social accounts](#b-signup-06) | Most people have an account elsewhere. |
| [Sign-up with sign-in providers](#b-signup-05) | Accounts come first, and the email form stays on the same page. |

## Sign-in pages in Tray UI

The [Auth Form](#c-auth-form) page has the card and its rules; it is built from [Field](#c-field), [Input](#c-input), [Input Group](#c-input-group), [Button](#c-button) and the labelled [Separator](#c-separator). [Input OTP](#c-input-otp) is the field for a second step. Copy any block from [Sign-in and sign-up pages](#b-login); it needs the three files from [Installation](#d-installation), and the reveal button and the "More" menu start on their own when `bundle.js` loads. Nothing in Tray UI submits the form or checks the password: the `action` and the server are yours.
