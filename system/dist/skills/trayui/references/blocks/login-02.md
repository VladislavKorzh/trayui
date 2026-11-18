# Sign-in page with a cover

The sign-in form in one half of the page, a cover in the other with a headline and a meter of the day's orders; for a sign-in that shows the product.

A split-screen login page: the form on the white half, under a bar with the wordmark, and a yellow cover filling the other half. The cover puts a headline at the top and a proof from the product at the foot; the example shows the day's order count, a badge with the courier's time and a meter of the orders packed. The form is the one from [the plain card](https://trayui.com/blocks/login-01.md), without the card around it.

Choose it when the sign-in page can show what the product does at a glance. [The wide card](https://trayui.com/blocks/login-04.md) does the same inside one card; here each part takes half the screen. Below 56rem the cover is hidden and the form has the page to itself, and under 40rem it stays at the top, under the bar, rather than centred in the height. The meter carries `role="meter"`, a name and its value, so the packed count is read aloud and not only drawn.

It is made of these components: [Auth Form](https://trayui.com/components/auth-form.md), [Field](https://trayui.com/components/field.md), [Label](https://trayui.com/components/label.md), [Input](https://trayui.com/components/input.md), [Input Group](https://trayui.com/components/input-group.md), [Button](https://trayui.com/components/button.md), [Separator](https://trayui.com/components/separator.md), [Card](https://trayui.com/components/card.md), [Badge](https://trayui.com/components/badge.md), [Progress](https://trayui.com/components/progress.md).

Behaviours it uses: `reveal`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign-in page with a cover</title>
<meta name="description" content="The sign-in form in one half of the page, a cover in the other with a headline and a meter of the day's orders; for a sign-in that shows the product.">
<meta name="tray-category" content="Login">
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
      <form class="tray-auth" action="/signin" method="post">
        <div class="tray-auth__head">
          <h1 class="title">Sign in</h1>
          <p>Welcome back to Perly Farm.</p>
        </div>
        <div class="tray-stack">
          <div class="tray-field">
            <label class="tray-label" for="email">Email</label>
            <input class="tray-input" id="email" name="email" type="email" autocomplete="username" placeholder="you@farm.example" required>
          </div>
          <div class="tray-field">
            <div class="tray-auth__row"><label class="tray-label" for="password">Password</label><a href="/reset">Forgot it?</a></div>
            <div class="tray-input-group">
              <input class="tray-input" id="password" name="password" type="password" spellcheck="false" autocapitalize="none" autocomplete="current-password" required>
              <button class="tray-input-group__btn" type="button" data-tray="reveal" aria-label="Show password"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-eye"/></svg></button>
            </div>
          </div>
        </div>
        <button class="tray-btn tray-btn--block" type="submit">Sign in</button>
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
        </div>
        <p class="tray-auth__foot">New here? <a href="/signup">Create an account</a></p>
      </form>
    </main>
  </div>
  <aside class="tray-screen__half tray-screen__half--wide" aria-label="Counter at work">
    <div class="tray-card tray-card--accent tray-screen__cover">
      <h2 class="headline">Every order, packed on time</h2>
      <div class="tray-stack tray-stack--lg">
        <div class="tray-row tray-row--between">
          <span class="nav">Today at Perly Farm</span>
          <span class="tray-badge tray-badge--ink">Courier at 14:00</span>
        </div>
        <p class="tray-figure">38<small>orders</small></p>
        <div class="tray-progress">
          <span class="tray-progress__name">Packed</span>
          <span class="tray-progress__value">26 of 38</span>
          <span class="tray-progress__bar" role="meter" aria-label="Orders packed" aria-valuemin="0" aria-valuemax="38" aria-valuenow="26" style="--tray-v: 68"></span>
        </div>
      </div>
    </div>
  </aside>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
