# Email-only sign-in

Sign-in without a password: a link to the email that works for 15 minutes, six other accounts and a passkey; for a product that signs in by link.

A passwordless login page: one email field and a button that sends a sign-in link, the kind often called a magic link. The hint under the field says how long the link works, and `aria-describedby` ties it to the field, so a screen reader reads it with the field. Under the six other accounts, a full-width button offers a passkey.

Choose it when the product has no passwords; [the plain card](https://trayui.com/blocks/login-01.md) keeps the password field and the link for a forgotten one. The form stands on the white page with no card around it, under a bar that holds the wordmark. From 40rem up it is centred in the height; on a phone it stays under the bar. The passkey button is a plain button with no behaviour attached, so your own code calls the browser's passkey prompt, and its name, "Continue with a passkey", holds the words it shows.

It is made of these components: [Auth Form](https://trayui.com/components/auth-form.md), [Field](https://trayui.com/components/field.md), [Label](https://trayui.com/components/label.md), [Input](https://trayui.com/components/input.md), [Button](https://trayui.com/components/button.md), [Separator](https://trayui.com/components/separator.md).

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Email-only sign-in</title>
<meta name="description" content="Sign-in without a password: a link to the email that works for 15 minutes, six other accounts and a passkey; for a product that signs in by link.">
<meta name="tray-category" content="Login">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-screen">
  <header class="tray-screen__bar">
    <a class="tray-wordmark" href="/">Counter</a>
  </header>
  <main class="tray-screen__body tray-screen__body--center-wide">
    <form class="tray-auth" action="/signin/link" method="post">
      <div class="tray-auth__head">
        <h1 class="title">Sign in</h1>
        <p>Welcome back to Perly Farm.</p>
      </div>
      <div class="tray-field">
        <label class="tray-label" for="email">Email</label>
        <input class="tray-input" id="email" name="email" type="email" autocomplete="username" placeholder="you@farm.example" aria-describedby="email-hint" required>
        <p class="tray-field__hint" id="email-hint">We send a link that works for 15 minutes.</p>
      </div>
      <button class="tray-btn tray-btn--block" type="submit">Send me a sign-in link</button>
      <div class="tray-stack tray-stack--sm">
        <p class="tray-rule tray-rule--label">or continue with</p>
        <div class="tray-providers" role="group" aria-label="Sign in with another account">
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signin/google" aria-label="Continue with Google">Google</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signin/apple" aria-label="Continue with Apple">Apple</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signin/facebook" aria-label="Continue with Facebook">Facebook</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signin/telegram" aria-label="Continue with Telegram">Telegram</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signin/linkedin" aria-label="Continue with LinkedIn">LinkedIn</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signin/microsoft" aria-label="Continue with Microsoft">Microsoft</a>
        </div>
        <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--block" type="button" aria-label="Continue with a passkey"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-key"/></svg>A passkey</button>
      </div>
      <p class="tray-auth__foot">New here? <a href="/signup">Create an account</a></p>
    </form>
  </main>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
