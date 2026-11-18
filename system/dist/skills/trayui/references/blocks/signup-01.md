# Sign-up form

The plainest sign-up: a card centred on the page with work email, a password of at least 12 characters, six other accounts and a line on the terms.

Only a work email and a password: a registration form in a card, and the usual start for a sign-up page. The link for people who already have an account sits under the heading, and the foot of the card carries a one-line note on the terms, so there is no box to tick.

Start here and pick a sibling when the page has more to say: [a cover with what the account gets](https://trayui.com/blocks/signup-02.md), or [the account buttons first](https://trayui.com/blocks/signup-05.md). The password field has `autocomplete="new-password"`, so a password manager can offer a strong password and save it, and `minlength="12"`, so the browser stops a shorter one before the form is sent. The hint "At least 12 characters" is tied to the field and read with it. The eye button shows what was typed, for a person checking a password they have just made up. The card is 27rem wide at most and fills the width of a phone.

It is made of these components: [Card](https://trayui.com/components/card.md), [Auth Form](https://trayui.com/components/auth-form.md), [Field](https://trayui.com/components/field.md), [Label](https://trayui.com/components/label.md), [Input](https://trayui.com/components/input.md), [Input Group](https://trayui.com/components/input-group.md), [Button](https://trayui.com/components/button.md), [Separator](https://trayui.com/components/separator.md).

Behaviours it uses: `reveal`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign-up form</title>
<meta name="description" content="The plainest sign-up: a card centred on the page with work email, a password of at least 12 characters, six other accounts and a line on the terms.">
<meta name="tray-category" content="Signup">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-screen">
  <main class="tray-screen__body tray-screen__body--center">
    <form class="tray-card tray-auth" action="/signup" method="post">
      <a class="tray-wordmark" href="/">Counter</a>
      <div class="tray-auth__head">
        <h1 class="title">Create an account</h1>
        <p>Already have one? <a href="/signin">Sign in</a></p>
      </div>
      <div class="tray-stack">
        <div class="tray-field">
          <label class="tray-label" for="email">Work email</label>
          <input class="tray-input" id="email" name="email" type="email" autocomplete="username" placeholder="you@farm.example" required>
        </div>
        <div class="tray-field">
          <label class="tray-label" for="password">Password</label>
          <div class="tray-input-group">
            <input class="tray-input" id="password" name="password" type="password" spellcheck="false" autocapitalize="none" autocomplete="new-password" minlength="12" aria-describedby="password-hint" required>
            <button class="tray-input-group__btn" type="button" data-tray="reveal" aria-label="Show password"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-eye"/></svg></button>
          </div>
          <p class="tray-field__hint" id="password-hint">At least 12 characters.</p>
        </div>
      </div>
      <button class="tray-btn tray-btn--block" type="submit">Create the account</button>
      <div class="tray-stack tray-stack--sm">
        <p class="tray-rule tray-rule--label">or continue with</p>
        <div class="tray-providers" role="group" aria-label="Sign up with another account">
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signup/google" aria-label="Continue with Google">Google</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signup/apple" aria-label="Continue with Apple">Apple</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signup/facebook" aria-label="Continue with Facebook">Facebook</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signup/telegram" aria-label="Continue with Telegram">Telegram</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signup/linkedin" aria-label="Continue with LinkedIn">LinkedIn</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signup/microsoft" aria-label="Continue with Microsoft">Microsoft</a>
        </div>
      </div>
      <p class="tray-auth__foot">By signing up you accept the <a href="/terms">terms</a>.</p>
    </form>
  </main>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
