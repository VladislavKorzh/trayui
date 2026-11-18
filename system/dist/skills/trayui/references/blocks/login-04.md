# Sign-in card with a picture

A wide card with the sign-in form beside a dark panel that follows one order, with the time of each step, from its arrival to the courier.

One wide card, up to 62rem across, holds this login page: the form on one side and, in the same tray, a dark panel about the product. In the example the panel is a short [activity feed](https://trayui.com/components/activity-feed.md) of three steps, each with an icon and its time. The card has no wordmark, so the heading names the product instead.

Where [the split page](https://trayui.com/blocks/login-02.md) hides its cover on a small screen, this card keeps its panel: below 56rem the two parts stack, the form first and the panel under it. Choose it when that story should reach phones too, or when the page should stay white around a single card. The steps are an ordered list, each time carries a `datetime` attribute, and the icons are hidden from screen readers, so each step is read as its sentence and its time. The panel is a labelled aside, outside the form.

It is made of these components: [Card](https://trayui.com/components/card.md), [Auth Form](https://trayui.com/components/auth-form.md), [Field](https://trayui.com/components/field.md), [Label](https://trayui.com/components/label.md), [Input](https://trayui.com/components/input.md), [Input Group](https://trayui.com/components/input-group.md), [Button](https://trayui.com/components/button.md), [Separator](https://trayui.com/components/separator.md), [Activity Feed](https://trayui.com/components/activity-feed.md).

Behaviours it uses: `reveal`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign-in card with a picture</title>
<meta name="description" content="A wide card with the sign-in form beside a dark panel that follows one order, with the time of each step, from its arrival to the courier.">
<meta name="tray-category" content="Login">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-screen">
  <main class="tray-screen__body tray-screen__body--center">
    <div class="tray-card tray-auth-wide">
      <div class="tray-auth-wide__form">
        <form class="tray-auth" action="/signin" method="post">
          <div class="tray-auth__head">
            <h1 class="title">Sign in to Counter</h1>
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
      </div>
      <aside class="tray-auth-wide__media tray-inverse" aria-label="Counter at work">
        <h2 class="title">Orders in, labels&nbsp;out, the&nbsp;courier&nbsp;told</h2>
        <ol class="tray-feed" role="list">
          <li>
            <span class="tray-feed__mark"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-inbox"/></svg></span>
            <div class="tray-feed__body">
              <p><b>Order PL-20431</b> came in: two jars of 50&nbsp;g.</p>
              <p class="tray-feed__meta"><time datetime="09:12">09:12</time></p>
            </div>
          </li>
          <li>
            <span class="tray-feed__mark"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-tag"/></svg></span>
            <div class="tray-feed__body">
              <p><b>The label</b> was printed at the packing table.</p>
              <p class="tray-feed__meta"><time datetime="09:13">09:13</time></p>
            </div>
          </li>
          <li>
            <span class="tray-feed__mark"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-truck"/></svg></span>
            <div class="tray-feed__body">
              <p><b>The courier</b> was told to collect it at 14:00.</p>
              <p class="tray-feed__meta"><time datetime="09:13">09:13</time></p>
            </div>
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
