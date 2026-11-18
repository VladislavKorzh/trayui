# Auth Form

The auth form is the card a person meets before the product: sign in, create an account, or ask for a new password. One column, one yellow button. Also called a login form, a sign-in form or a sign-up form.

## Markup
```html
<form class="tray-card tray-auth" action="/signin" method="post">
  <a class="tray-wordmark" href="/">Counter</a>
  <div class="tray-auth__head">
    <h1 class="title">Sign in</h1>
    <p>Welcome back to Perly Farm.</p>
  </div>
  <button class="tray-btn tray-btn--quiet tray-btn--md tray-btn--block" type="button">… Continue with a passkey</button>
  <p class="tray-rule tray-rule--label">or</p>
  <div class="tray-field"><label class="tray-label" for="email">Email</label>
    <input class="tray-input" id="email" type="email" autocomplete="username" required></div>
  <div class="tray-field">
    <div class="tray-auth__row"><label class="tray-label" for="password">Password</label><a href="/reset">Forgot it?</a></div>
    <div class="tray-input-group">
      <input class="tray-input" id="password" type="password" spellcheck="false" autocapitalize="none" autocomplete="current-password" required>
      <button class="tray-input-group__btn" type="button" data-tray="reveal" aria-label="Show password">…</button>
    </div>
  </div>
  <button class="tray-btn tray-btn--block" type="submit">Sign in</button>
  <p class="tray-auth__foot">New here? <a href="/signup">Create an account</a></p>
</form>
```
The card is 27rem wide at most and centred. It is built from Field, Input, Input Group (with `reveal`), Button and the labelled Separator. An error for the whole form is an Alert between the head and the first field; an error for one field sits under it.

The page around the card is a screen (`tray-screen`): centred on the white page, on a tray (`tray-screen--tray`, where the card is a `tray-panel`), or beside a cover (`tray-screen--split`, where the form has no card). `tray-auth-wide` is one tray that holds the form beside a picture. The Login and Signup blocks show each.

## Sign-in providers
```html
<div class="tray-stack tray-stack--sm">
  <p class="tray-rule tray-rule--label">or continue with</p>
  <div class="tray-providers" role="group" aria-label="Sign in with another account">
    <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signin/google" aria-label="Continue with Google">Google</a>
    …
  </div>
</div>
```
`tray-providers` lays quiet buttons out two or three across, each with the provider's name; its `aria-label` says "Continue with …" in full. `tray-providers--list` puts one on a line, with the whole sentence on each button, for a page that offers providers before anything else. `tray-providers--row` keeps to one row of three: two providers and a Dropdown Menu ("More") that holds the rest.

A provider's own mark goes before its name as `<img class="tray-icon" alt="">`, from the provider's brand kit and under its rules. The system ships none: until you add one, the name stands alone.

Set `autocomplete` on every field: `username`, `current-password`, `new-password`, `one-time-code`.

## Accessibility
Every field has a visible `<label>` tied by `for`. Mark a field in error with `aria-invalid="true"`, which draws its `danger` edge, and tie the sentence that explains it with `aria-describedby`, as the password hint is tied; a field that an error for the whole form is about points at that error's title, as the email does in the preview. An error for the whole form is an Alert with `role="alert"`. It is read when it is put in the page, as a form checked by script answers; an alert that is already there as the page loads is not announced. So when the error comes back with a new page from the server, give the Alert `tabindex="-1"`, as the preview does, and move focus to it as the page loads. The `reveal` button keeps its name, "Show password", and `aria-pressed="true"` says the password shows, so it is read as "Show password, pressed". Each provider's `aria-label` holds the name it shows, so a person who says "Google" to voice control still reaches it.

## Do and don't
- Do say which account failed and why: "That password does not match this email."
- Do keep sign-up to what you need today: an email and a password. Ask the rest later.
- Don't clear the form on an error.
- Don't draw the logo of a sign-in provider you do not have the right to use, and never redraw one from memory. Write its name.
- Do offer no more than six providers at once, the most used first; a longer list goes in the menu.
