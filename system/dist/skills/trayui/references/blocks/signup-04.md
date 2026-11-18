# Sign-up card with a picture

A wide card with the sign-up form beside a panel of three first steps, from adding the products to packing the first order.

On this sign-up page one wide card, up to 62rem across, holds the registration form on one side and, in the same tray, a yellow panel about the first day with the product. The card has no wordmark, so the heading names the product instead.

Where [the split page](https://trayui.com/blocks/signup-02.md) lists what the account gets and drops its cover on a small screen, this card shows what to do next and keeps its panel: below 56rem the two parts stack, the form first and the steps under it. The panel is a `tray-island`, which keeps the light palette in every theme, so it stays yellow with dark text in the dark theme too. The steps are an ordered list, so a screen reader announces three items in order, and their icons are hidden from it. [The sign-in card with a picture](https://trayui.com/blocks/login-04.md) is its pair, with a dark panel.

It is made of these components: [Card](https://trayui.com/components/card.md), [Auth Form](https://trayui.com/components/auth-form.md), [Field](https://trayui.com/components/field.md), [Label](https://trayui.com/components/label.md), [Input](https://trayui.com/components/input.md), [Input Group](https://trayui.com/components/input-group.md), [Button](https://trayui.com/components/button.md), [Separator](https://trayui.com/components/separator.md), [Item](https://trayui.com/components/item.md).

Behaviours it uses: `reveal`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign-up card with a picture</title>
<meta name="description" content="A wide card with the sign-up form beside a panel of three first steps, from adding the products to packing the first order.">
<meta name="tray-category" content="Signup">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-screen">
  <main class="tray-screen__body tray-screen__body--center">
    <div class="tray-card tray-auth-wide">
      <div class="tray-auth-wide__form">
        <form class="tray-auth" action="/signup" method="post">
          <div class="tray-auth__head">
            <h1 class="title">Sign up for Counter</h1>
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
      </div>
      <aside class="tray-auth-wide__media tray-island" aria-label="The first day with Counter">
        <h2 class="title">Three steps to the first packed order</h2>
        <ol class="tray-items" role="list">
          <li class="tray-item">
            <span class="tray-item__media"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-tag"/></svg></span>
            <span class="tray-item__body">
              <span class="tray-item__title">Add your products</span>
              <span class="tray-item__text">Jars, sizes and prices.</span>
            </span>
          </li>
          <li class="tray-item">
            <span class="tray-item__media"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-link"/></svg></span>
            <span class="tray-item__body">
              <span class="tray-item__title">Share the order page</span>
              <span class="tray-item__text">Customers order by themselves.</span>
            </span>
          </li>
          <li class="tray-item">
            <span class="tray-item__media"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-package"/></svg></span>
            <span class="tray-item__body">
              <span class="tray-item__title">Pack the first order</span>
              <span class="tray-item__text">The label prints and the courier is told.</span>
            </span>
          </li>
        </ol>
      </aside>
    </div>
  </main>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
