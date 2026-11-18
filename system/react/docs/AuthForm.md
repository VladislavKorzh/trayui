---
category: Account
keywords: [auth form, sign in, log in, login, sign up, create account, register, password, passkey, authentication]
---
# Auth Form

The auth form is the card a person meets before the product: sign in or create an account. One column, one yellow button.

## Use
```tsx
<AuthForm
  wordmark="Counter"
  description="Welcome back to Perly Farm."
  passkey onPasskey={signInWithPasskey}                   /* "Continue with a passkey", then a line with "or" */
  forgotHref="/reset"                                      /* "Forgot it?" beside the password label */
  footer={<>New here? <a href="/signup">Create an account</a></>}
  onSubmit={({ email, password }) => signIn(email, password)}
/>

<AuthForm
  mode="signup"
  description="Free for 14 days. No card needed."
  passwordHint="At least 12 characters."
  error="That email already has an account"               /* an Alert between the head and the first field */
  errorText={<><a href="/signin">Sign in</a> or use another email.</>}
  fieldErrors={{ email: true }}                            /* ring the field; the alert already says why */
  defaultValues={{ email: typed.email }}                   /* never clear the form on an error */
  footer={<>By creating an account you accept the <a href="/terms">terms</a>.</>}
/>
```

## Modes
- `signin`: an email and the current password, with a reveal button (Input Group) and an optional "Forgot it?" link. Button "Sign in".
- `signup`: an email and a new password with its rule as `passwordHint`. `nameLabel` adds a first field for the farm or shop name. Button "Create the account".

Every field carries its `autocomplete` (`username`, `current-password`, `new-password`, `organization`) and a `name`, so the browser's password manager works. Pass `children` for an extra field, such as a one-time code. The password that can be shown turns spell checking and capitals off, and its reveal button keeps its name, "Show password", while `aria-pressed` says the password shows ("Show password, pressed").

## Errors
An error for the whole form is a danger Alert between the head and the first field: `error` is its title, `errorText` what to do. An error for one field sits under it (`fieldErrors`); `true` rings the field without a line, when the alert already says why, and the field points at the alert's title (`aria-describedby`), so it is read with the field. The Alert is read when it comes into the page, as after a send checked in the browser; one that is already there as the page loads, rendered on a server with the page that answers the send, is not announced, so move focus to the form's alert as that page loads.

## Layout
The card is 27rem wide at most and centred. Use `headingLevel={2}` when it shares the page with other headings.

## Do and don't
- Do say which account failed and why: "That password does not match this email."
- Do keep sign-up to what you need today: an email and a password. Ask the rest later.
- Don't clear the form on an error.
- Don't draw the logo of a sign-in provider you do not have the right to use. Write its name.
