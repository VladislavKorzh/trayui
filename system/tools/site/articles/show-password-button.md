# Show password: aria-pressed or a new label

A show password button in HTML: a constant name with aria-pressed, or a name that changes to Hide password. What each says, and which Tray UI uses where.

A show password button sits at the end of a password field, usually as an eye. A press switches the field from `type="password"` to `type="text"`, and the dots become the characters typed; a second press hides them again. The switch is one line of script. The button's name and state take more thought, and the WAI-ARIA Authoring Practices Guide (APG) allows two answers. Below, the two sit side by side with what each gives to assistive technologies, followed by the choices Tray UI made in its [Input Group](#c-input-group) and its [API Keys](#c-api-keys).

## The field and the button

```html
<form action="/sign-in" method="post">
  <label for="password">Password</label>
  <div class="password">
    <input id="password" name="password" type="password" autocomplete="current-password"
           spellcheck="false" autocapitalize="none" required>
    <button type="button" class="reveal" aria-controls="password" aria-pressed="false">Show password</button>
  </div>
  <button>Sign in</button>
</form>
```

- **`type="button"`.** A `<button>` inside a form submits it unless told otherwise, and a press on the eye should not send the password.
- **The field keeps its attributes.** Changing `type` leaves the name, the value and `autocomplete` alone, and the form still sends the value as `password`.
- **`aria-controls`** names the field the button acts on. GOV.UK's password input sets it; it is optional.
- **`spellcheck="false"` and `autocapitalize="none"`.** While the password shows, it sits in a plain text field. MDN notes that a `password` field is never capitalised automatically, while a text field may be, by a phone's on-screen keyboard; `autocapitalize="none"` stops it. GOV.UK's password input sets both attributes, and gives "spell-jacking" as the risk that turning off the spelling check avoids.

## Two valid patterns

### A constant name with aria-pressed

The APG describes a toggle button as "a two-state button that can be either off (not pressed) or on (pressed)", marked with `aria-pressed`. Its example is a Mute button in an audio player, and it adds: "Important: it is critical the label on a toggle does not change when its state changes." With the state on, the label stays "Mute", "so a screen reader would say something like 'Mute toggle button pressed'".

For a password, the name is "Show password" in both states. `aria-pressed="false"` while the dots show, `"true"` while the characters show. The name says what the button is for, and the state says whether it is on: "Show password, pressed" means the password is showing.

### A name that changes, without aria-pressed

The same APG paragraph goes on: "if the design were to call for the button label to change from 'Mute' to 'Unmute,' the aria-pressed attribute would not be needed." MDN's page on `aria-pressed` says the same with a Pause button: "If you want the label to toggle between 'Paused' and 'Play', don't use `aria-pressed`."

Here the button is a plain button, and its name says what a press will do next: "Show password" while the dots show, "Hide password" while the characters show. There is no state to report; the name carries it.

GOV.UK's password input works this way. Its button shows the word "Show" or "Hide", its `aria-label` is "Show password" or "Hide password", and after each press it writes "Your password is visible" or "Your password is hidden" into a visually hidden live region with `aria-live="polite"`.

### Not both

| Pattern | Password hidden | Password shown |
| --- | --- | --- |
| Constant name | "Show password", `aria-pressed="false"` | "Show password", `aria-pressed="true"` |
| Changing name | "Show password", no `aria-pressed` | "Hide password", no `aria-pressed` |
| Both at once, avoid | "Show password", `aria-pressed="false"` | "Hide password", `aria-pressed="true"` |

The last row says one thing twice and the two halves disagree. "Pressed" reports that the toggle is on, which here means the password is shown, while the name "Hide password" describes the opposite action. Tray UI's own code has a comment on exactly this: a name that changed as well "would be read as 'Hide password, pressed'". Before version 0.2.0 its show password button did both. The accessibility review of every component found it, and 0.2.0 settled it: "Reveal keeps the name 'Show password' and says its state with `aria-pressed`."

## Choosing between them

- **Visible words decide it.** If the button shows a word, its name must contain that word. WCAG 2.2 success criterion 2.5.3, Label in Name, asks that "the name contains the text that is presented visually". A button that reads "Hide" with the name "Show password" fails it. So a text button whose word changes needs the changing name, as GOV.UK's does.
- **An icon leaves the choice open.** An eye that becomes a crossed-out eye has no words to match, and its name is all in `aria-label`. Either pattern works.
- **Voice control speaks labels.** The Understanding document for 2.5.3 describes speech input users who "navigate by speaking the visible text labels of components". With a constant name, "Show password" works in both states. With a changing name, the words to say change with the state, and an eye alone shows no words to read them from.
- **Stay consistent within a product.** A person who meets "pressed" on one eye and a new name on the next has to learn both. Pick one for every show password button you own.

## A checkbox needs no ARIA

The constant name with a state exists in plain HTML too: a checkbox labelled "Show password", under the field. Its label never changes, its checked state is the state, and the browser reports both without a single ARIA attribute. A click on the label ticks it too.

```html
<input type="checkbox" id="show-password">
<label for="show-password">Show password</label>
```

```js
document.getElementById('show-password').addEventListener('change', (e) => {
  document.getElementById('password').type = e.target.checked ? 'text' : 'password';
});
```

It costs a line of the form's height, and it sits outside the field it controls. Where the design wants the eye inside the field, use a button and one of the two patterns above.

## A script from scratch

This runs the form above, with the constant name and `aria-pressed`. It starts hidden, which GOV.UK also asks for, since a person may not be alone when they sign in. And it hides the password again in two moments the person did not choose: when the form is sent, and when the page comes back from the browser's back-forward cache.

```js
const input = document.getElementById('password');
const button = input.parentElement.querySelector('.reveal');

function setShown(shown) {
  input.type = shown ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(shown));
}

button.addEventListener('click', () => setShown(input.type === 'password'));
// Hide it again before the form is sent, and when the page comes back from the back-forward cache
input.form.addEventListener('submit', () => setShown(false));
window.addEventListener('pageshow', (e) => { if (e.persisted) setShown(false); });
```

The submit listener is GOV.UK's: its component sets the field back to `type="password"` on submit, so that browsers do not remember the password as a value typed into a text field and offer it in other fields later. The `pageshow` listener is GOV.UK's too: a page restored from the back-forward cache comes back exactly as it was left, password showing.

For the changing name, drop `aria-pressed="false"` from the markup and write the name in place of the state:

```js
function setShown(shown) {
  input.type = shown ? 'text' : 'password';
  button.textContent = shown ? 'Hide password' : 'Show password';
}
```

A few details hold for both.

- **Focus stays on the button.** The press changes the field, not where the person is. Do not move focus into the field; they may want to press again.
- **The icon is decoration.** An eye drawn in SVG takes `aria-hidden="true"`, and the button's name comes from `aria-label` or from hidden text.
- **Two fields, two names.** A page that asks for a new password twice has two buttons, and each name should say which field it shows: "Show new password", "Show the repeated password".

## Show password in Tray UI

Tray UI's show password button is `data-tray="reveal"` on the button inside an [Input Group](#c-input-group):

```html
<label class="tray-label" for="password">Password</label>
<div class="tray-input-group">
  <input class="tray-input" id="password" name="password" type="password"
         spellcheck="false" autocapitalize="none" autocomplete="current-password" required>
  <button class="tray-input-group__btn" type="button" data-tray="reveal" aria-label="Show password">
    <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-eye"/></svg>
  </button>
</div>
```

It takes the constant name. The script gives the button `aria-label="Show password"` if it has no `aria-label`, sets `aria-pressed="false"`, and on each press switches the field's `type`, flips `aria-pressed` and swaps the icon between `eye` and `eye-off`. The [Auth Form](#c-auth-form) and Input Group READMEs both describe it as read "Show password, pressed" while the password shows. In Chrome's accessibility tree it is a button named "Show password", with its pressed state false and then true. It is in every block of the [Sign-in and sign-up pages](#b-login) that has a password field, and in the form that offers an account on the [Order placed](#b-checkout-03) page.

The `secret` behaviour of [API Keys](#c-api-keys) takes the other pattern. Its eye shows and hides an API key, and it changes its name: "Show the key" while the key is masked, "Hide the key" while it is shown, or the name you put in `data-label-on`. It carries no `aria-pressed`, and the script removes one if the markup has it, since, in the README's words, it "would say it twice ('Hide the key, pressed')". In Chrome's accessibility tree it is a button named "Show the key" and then "Hide the key", with no pressed state.

So one system holds both patterns, each on its own control and each complete. The review that found the mixed state asked each button to keep one signal or the other: Reveal kept the state, the key's button kept the changing name, and each is one of the APG's two patterns.

The two moments the person did not choose are in Reveal as well: it turns the field back to `type="password"` when its form is sent and when the page comes back from the back-forward cache. The system's password fields that have the button carry `spellcheck="false"` and `autocapitalize="none"`, as the example does; give your own field the two attributes.

The [Input Group](#c-input-group) page has a live example, and [Installation](#d-installation) has the lines that link the stylesheet and the script.
