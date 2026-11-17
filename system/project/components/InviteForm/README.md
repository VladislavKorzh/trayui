# Invite Form

The invite form takes several emails at once, a role for all of them, and sends the invitations.

## Markup
```html
<form class="tray-stack">
  <div class="tray-invite">
    <div class="tray-field">
      <label class="tray-label" for="invite-emails">Emails</label>
      <div class="tray-tags" data-tray="taginput" data-pattern="email" data-max="5">
        <input id="invite-emails" type="email" placeholder="name@farm.example" aria-describedby="invite-hint">
        <input type="hidden" name="emails">
      </div>
      <p class="tray-field__hint" id="invite-hint">Separate emails with a comma or Enter. One seat is free.</p>
    </div>
    <div class="tray-field"><label class="tray-label" for="invite-role">Role</label>
      <span class="tray-select"><select id="invite-role">…</select></span></div>
    <button class="tray-btn tray-btn--md" type="submit">Send invitations</button>
  </div>
</form>
```
The emails are a Tag Input with `data-pattern="email"`: an address that is not an email becomes a `danger` chip, and the hint under the field must then say which one is wrong. `data-max` is the number of free seats. Beside it go a Native Select for the role and the button; below 40rem the three stack.

Listen for `tray:change` on the tag input: `detail.valid` is false while a wrong address is in the field. Keep the button enabled and answer a wrong submit with the error, rather than disabling it.

## Accessibility
The emails field is a real `<input>` named by its `<label>`, with the hint or the error tied on by `aria-describedby`. `Enter` or a comma turns what is typed into a chip, `Backspace` in the empty field removes the last one, and leaving the field keeps what was typed. Each address added or removed is announced through a polite live region that the behaviour adds. A chip's button is named "Remove" and the address, and focus returns to the field after it. A wrong address is marked only by the look of its `danger` chip, so the error must name it in words, as in the example.

## Do and don't
- Do say how many seats are free before the person types.
- Do explain the chosen role in one line under the row.
- Don't send anything until the button is pressed.
- Don't drop a wrong address silently: keep it as a chip and name it.
