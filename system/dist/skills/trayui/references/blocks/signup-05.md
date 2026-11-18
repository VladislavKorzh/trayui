# Sign-up with sign-in providers

Sign-up that leads with six accounts, with the email and password right below on the same page; for when people should see both ways at once.

A sign-up page that turns the usual order round: the six accounts come first, then a rule that reads "or with your email", then the work email and the password. Like [the email-only sign-in](https://trayui.com/blocks/login-05.md), it stands on the white page under a bar with the wordmark, with no card around it.

Pick it when many people sign up with an account they already have, yet the email form should not wait for a second page; [the account-only card](https://trayui.com/blocks/signup-06.md) moves the form away, and [the plain card](https://trayui.com/blocks/signup-01.md) puts the accounts after it. The group of account buttons is named by the visible words "Continue with" through `aria-labelledby`, not by a hidden `aria-label`, so a screen reader gives it the name on the screen. From 40rem up the form is centred in the height; on a phone it stays under the bar, at the top of the page.

It is made of these components: [Auth Form](https://trayui.com/components/auth-form.md), [Button](https://trayui.com/components/button.md), [Separator](https://trayui.com/components/separator.md), [Field](https://trayui.com/components/field.md), [Label](https://trayui.com/components/label.md), [Input](https://trayui.com/components/input.md), [Input Group](https://trayui.com/components/input-group.md).

Behaviours it uses: `reveal`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign-up with sign-in providers</title>
<meta name="description" content="Sign-up that leads with six accounts, with the email and password right below on the same page; for when people should see both ways at once.">
<meta name="tray-category" content="Signup">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-screen">
  <header class="tray-screen__bar">
    <a class="tray-wordmark" href="/">Counter</a>
  </header>
  <main class="tray-screen__body tray-screen__body--center-wide">
    <form class="tray-auth" action="/signup" method="post">
      <div class="tray-auth__head">
        <h1 class="title">Create an account</h1>
        <p>Already have one? <a href="/signin">Sign in</a></p>
      </div>
      <div class="tray-stack tray-stack--sm">
        <p class="label" id="providers-label">Continue with</p>
        <div class="tray-providers" role="group" aria-labelledby="providers-label">
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signup/google" aria-label="Continue with Google">Google</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signup/apple" aria-label="Continue with Apple">Apple</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signup/facebook" aria-label="Continue with Facebook">Facebook</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signup/telegram" aria-label="Continue with Telegram">Telegram</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signup/linkedin" aria-label="Continue with LinkedIn">LinkedIn</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signup/microsoft" aria-label="Continue with Microsoft">Microsoft</a>
        </div>
      </div>
      <p class="tray-rule tray-rule--label">or with your email</p>
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
      <p class="tray-auth__foot">By signing up you accept the <a href="/terms">terms</a>.</p>
    </form>
  </main>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
