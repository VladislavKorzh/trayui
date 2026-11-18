# Sign-in page on a tray

A white sign-in panel on a grey ground, with Google and Apple shown and four more accounts in a menu, and the terms and privacy notice below.

A login page on a grey ground: the form is a white panel, with the wordmark centred above it. The line on the terms and the privacy notice sits at the foot of the page, outside the form, while the link to create an account stays at the foot of the panel.

Pick it over [the plain card](https://trayui.com/blocks/login-01.md) when the page must carry that legal line, or when six account buttons would crowd the form: Google and Apple stay in view and a "More" button holds the other four. The three keep to one row at every width, and the menu opens upwards from the last cell. Enter, Space or the down arrow opens it on its first account, the arrow keys move through the list, and Escape closes it and puts focus back on "More". [The sign-up page on a tray](https://trayui.com/blocks/signup-03.md) is its pair, for a product that wants both screens to match.

It is made of these components: [Auth Form](https://trayui.com/components/auth-form.md), [Field](https://trayui.com/components/field.md), [Label](https://trayui.com/components/label.md), [Input](https://trayui.com/components/input.md), [Input Group](https://trayui.com/components/input-group.md), [Button](https://trayui.com/components/button.md), [Separator](https://trayui.com/components/separator.md), [Dropdown Menu](https://trayui.com/components/dropdown-menu.md).

Behaviours it uses: `menu`, `reveal`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign-in page on a tray</title>
<meta name="description" content="A white sign-in panel on a grey ground, with Google and Apple shown and four more accounts in a menu, and the terms and privacy notice below.">
<meta name="tray-category" content="Login">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-screen tray-screen--tray">
  <main class="tray-screen__body tray-screen__body--center">
    <a class="tray-wordmark" href="/" style="justify-self: center">Counter</a>
    <form class="tray-panel tray-auth" action="/signin" method="post">
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
        <div class="tray-providers tray-providers--row" role="group" aria-label="Sign in with another account">
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signin/google" aria-label="Continue with Google">Google</a>
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/signin/apple" aria-label="Continue with Apple">Apple</a>
          <div class="tray-anchor tray-anchor--block" data-tray="menu">
            <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" aria-label="More accounts to continue with">More<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-chevron-down"/></svg></button>
            <div class="tray-pop tray-pop--end tray-pop--top">
              <div class="tray-list">
                <a class="tray-option" role="menuitem" href="/signin/facebook">Facebook</a>
                <a class="tray-option" role="menuitem" href="/signin/telegram">Telegram</a>
                <a class="tray-option" role="menuitem" href="/signin/linkedin">LinkedIn</a>
                <a class="tray-option" role="menuitem" href="/signin/microsoft">Microsoft</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p class="tray-auth__foot">New here? <a href="/signup">Create an account</a></p>
    </form>
  </main>
  <footer class="tray-screen__foot">
    <p>By signing in you accept the <a href="/terms">terms</a> and the <a href="/privacy">privacy&nbsp;notice</a>.</p>
  </footer>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
