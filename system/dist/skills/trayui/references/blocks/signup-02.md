# Sign-up page with a cover

The sign-up form in one half of the page and a cover in the other, listing three things a new account gets, from 14 free days to exporting your data.

A split-screen sign-up page: the form on the white half, under a bar with the wordmark, and a green cover in the other half. The cover holds a headline and three points, each a title with one line under it.

Choose it when the reasons to sign up should sit beside the form. [The sign-up card with a picture](https://trayui.com/blocks/signup-04.md) puts a panel like it inside one card and keeps it on a phone; this page gives the cover half the screen and hides it at 56rem and below, where the form has the page to itself. Under 40rem the form also stays at the top, under the bar, rather than centred in the height. The cover is a labelled aside, and its points are a real list whose check icons are hidden from screen readers, so each point is read as its words alone. [The sign-in page with a cover](https://trayui.com/blocks/login-02.md) is its pair, with a yellow cover.

It is made of these components: [Auth Form](https://trayui.com/components/auth-form.md), [Field](https://trayui.com/components/field.md), [Label](https://trayui.com/components/label.md), [Input](https://trayui.com/components/input.md), [Input Group](https://trayui.com/components/input-group.md), [Button](https://trayui.com/components/button.md), [Separator](https://trayui.com/components/separator.md), [Card](https://trayui.com/components/card.md), [Item](https://trayui.com/components/item.md).

Behaviours it uses: `reveal`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign-up page with a cover</title>
<meta name="description" content="The sign-up form in one half of the page and a cover in the other, listing three things a new account gets, from 14 free days to exporting your data.">
<meta name="tray-category" content="Signup">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-screen tray-screen--split">
  <div class="tray-screen__half">
    <header class="tray-screen__bar">
      <a class="tray-wordmark" href="/">Counter</a>
    </header>
    <main class="tray-screen__body tray-screen__body--center-wide">
      <form class="tray-auth" action="/signup" method="post">
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
  <aside class="tray-screen__half tray-screen__half--wide" aria-label="What a new account gets">
    <div class="tray-card tray-card--leaf tray-screen__cover">
      <h2 class="headline">An order desk for small farms</h2>
      <ul class="tray-items" role="list">
        <li class="tray-item">
          <span class="tray-item__media"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg></span>
          <span class="tray-item__body">
            <span class="tray-item__title">Free for 14 days</span>
            <span class="tray-item__text">No card needed to start.</span>
          </span>
        </li>
        <li class="tray-item">
          <span class="tray-item__media"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg></span>
          <span class="tray-item__body">
            <span class="tray-item__title">Orders, labels and the courier</span>
            <span class="tray-item__text">One desk from the first order to the pickup.</span>
          </span>
        </li>
        <li class="tray-item">
          <span class="tray-item__media"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg></span>
          <span class="tray-item__body">
            <span class="tray-item__title">Your products and customers stay yours</span>
            <span class="tray-item__text">Export them to a spreadsheet at any time.</span>
          </span>
        </li>
      </ul>
    </div>
  </aside>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
