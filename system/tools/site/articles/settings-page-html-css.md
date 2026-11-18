# A settings page in plain HTML and CSS

How to build a settings page: sections beside their cards, switches that save at once or a form with a Save button, a danger zone, and what a phone changes.

A settings page holds the choices a person makes once and returns to now and then. Tray UI has three settings blocks, each a whole page inside the app shell: [Profile settings](#b-settings-01), [Notifications by channel](#b-settings-02) and [Security and the danger zone](#b-settings-03).

## Pages of settings and the way between them

Split settings by topic into pages, each with an address of its own, so a link in a support email can lead straight to Notifications. The three blocks are three such pages, joined by a strip of tabs under the page heading:

```html
<nav class="tray-tabs" data-tray="strip" aria-label="Your settings">
  <a class="tray-tab" href="/settings/profile">Profile</a>
  <a class="tray-tab" href="/settings/notifications" aria-current="page">Notifications</a>
  <a class="tray-tab" href="/settings/security">Security</a>
</nav>
```

These tabs are links in a `<nav>`, and `aria-current="page"` marks the page you are on. A `role="tablist"` would promise panels shown in place, with the arrow keys moving between the tabs; links lead to pages, and Tab moves through them. [Tabs](#c-tabs) describes both uses.

A second sidebar for the sections is the other common design. Tray UI's [App Shell](#c-app-shell) rules it out: "Don't give a product two menus. A section with its own pages takes Tabs under the page header". Two other places can hold the same list:

- **The main sidebar's second level.** [Sidebar with a second level](#b-sidebar-03) keeps General, Notifications and Integrations open under Settings; [Sidebar with a level that folds](#b-sidebar-04) puts them in a `<details>` that opens when asked.
- **A dialog with a sidebar of its own.** [Sidebar in a dialog](#b-sidebar-14) opens the settings over the work, for settings people visit briefly. Its list of sections is a second `<nav>`, named "Sections of the settings", and below 48rem it becomes one row that scrolls sideways.

## A section: the title and why, beside the card

Inside a page, each topic is a section. Its name and one sentence of why stand in a narrow column at the start; the controls sit on a card beside them. The sentence is where the effect of the settings is explained, in view, instead of in a tooltip.

```html
<section class="tray-settings" aria-labelledby="set-orders">
  <div class="tray-settings__intro">
    <h2 class="subtitle" id="set-orders">Orders</h2>
    <p>How new orders reach the packing table.</p>
  </div>
  <div class="tray-settings__body">
    <div class="tray-card">
      <div class="tray-setting">
        <div class="tray-setting__text">
          <b id="s1">Print a label for every order</b>
          <small id="s1-text">On the printer by the packing table.</small>
        </div>
        <div class="tray-setting__control">
          <label class="tray-switch">
            <input type="checkbox" role="switch" aria-labelledby="s1" aria-describedby="s1-text" checked>
            <span class="tray-switch__track"></span>
          </label>
        </div>
      </div>
    </div>
  </div>
</section>
```

- **The section has a name.** MDN gives `<section>` the role `region` when it has an accessible name and `generic` when it has none, so `aria-labelledby` pointing at the heading is what makes each topic a landmark.
- **The row names its control.** The bold name sits outside the switch's label, so the switch points at it with `aria-labelledby`, and at the line under it with `aria-describedby`. In Chrome's accessibility tree this switch is named "Print a label for every order" and described by the line about the printer.
- **A button carries its setting.** "Change" or "Sign out" means nothing outside its row. The security block adds hidden words: `Sign out<span class="tray-vh"> of iPhone 15</span>`.

The layout is a two-column grid that falls to one column. These are Tray UI's rules:

```css
.tray-settings {
  display: grid;
  grid-template-columns: minmax(0, 17rem) minmax(0, 1fr);
  gap: var(--space-5) var(--space-10);
  align-items: start;
}
.tray-settings + .tray-settings {
  margin-block-start: var(--space-10);
  padding-block-start: var(--space-10);
  border-block-start: 1px solid var(--hairline);
}
@media (max-width: 55.99rem) {
  .tray-settings { grid-template-columns: minmax(0, 1fr); }
}
```

The `0` in `minmax(0, …)` lets a column grow narrower than its content, so a wide field shrinks with the card.

## Save at once, or save with a button

The [Settings Section](#c-settings-section) rule is "save a switch at once and a text field with the 'Save' button; never mix the two in one card."

| | Saves at once | Saves on a button |
| --- | --- | --- |
| Controls | Switches and small selects | Text fields, a photo, checkboxes, choices that belong together |
| What confirms it | A toast or a status line after each change | One bar: a count of changes, Discard and Save |
| Block | Notifications by channel | Profile settings |

WCAG 3.2.2 On Input (level A) asks that changing a control's setting cause no change of context, such as moving focus or opening another page, unless the person was told first. Saving in the background is no such change: focus stays on the switch. The notifications block still says how it works, under its heading: "Each switch saves the moment you move it."

### Switches that save at once

A [Switch](#c-switch) is a real checkbox with `role="switch"`. MDN calls the role "functionally identical to the checkbox role", with on and off in place of checked and unchecked. Space turns it, and each turn fires `change`. Save there, and put the switch back if the server refuses:

```js
const saved = document.querySelector('#saved'); // <p id="saved" role="status">, in the page from the start

document.querySelector('#alerts').addEventListener('change', async (e) => { // #alerts: the card of switches
  const input = e.target;
  const name = input.closest('label').querySelector('b').firstChild.textContent;
  try {
    const res = await fetch('/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [input.name]: input.checked }),
    });
    if (!res.ok) throw new Error(res.statusText);
    saved.textContent = `${name}: ${input.checked ? 'on' : 'off'}. Saved.`;
  } catch {
    input.checked = !input.checked; // back to what the server has
    saved.textContent = `${name} was not saved. Try again.`;
  }
});
```

The line in `#saved` is a WCAG 4.1.3 status message, read without taking focus. The block uses a [Toast](#c-toast) instead, "Phone app: off. Saved.", in a polite live region; [Toasts that are announced](#a-toast-notifications-screen-readers) explains why that region belongs in the page from the start.

Three more details of the block are worth copying.

The same event, "A delivery fails", sits under Email and under the phone app. A switch is named by the words inside its label, and the heading of its card is not among them, so each name ends in hidden words:

```html
<label class="tray-switch tray-switch--row">
  <span class="tray-switch__text">
    <b>A delivery fails<span class="tray-vh">, by email</span></b>
    <small>So you can call the customer the same day.</small>
  </span>
  <input type="checkbox" role="switch" checked>
  <span class="tray-switch__track"></span>
</label>
```

The hidden words come after the visible ones. WCAG 2.5.3 Label in Name asks that the name contain the visible text, and its Understanding document calls it "a best practice" to have that text "at the start of the name".

A switch in the corner of each channel's card turns the whole channel off, and the script disables the rows under it. MDN says a disabled control cannot receive focus and is not submitted with the form. That costs nothing on a page that saves each change as it happens. In a form sent with a button, a disabled box sends nothing, as an unchecked one does.

One row cannot be turned off: "A payment fails" is checked and `disabled`, and the line under it gives the reason, "Always on: the plan depends on it." The reason is inside the label, so it is part of the switch's name. A tooltip would need hover or focus, and a disabled switch takes no focus.

### A form with a Save button

Text needs a button: saving on every key would store each half-typed version. [Profile settings](#b-settings-01) puts one `<form>` around four sections and ends it with one bar: a note, Discard (`type="reset"`) and Save the changes (`type="submit"`). The note is `role="status"`. It opens at "1 unsaved change: the photo", names up to three changes, and returns to "Everything is saved" after a save or a discard.

The browser already holds the saved state. `defaultValue`, `defaultChecked` and `defaultSelected` keep the values the page loaded with, and a reset puts them back. Count the changes against them, and copy the new values into them after a save:

```js
const form = document.querySelector('#profile');
const note = document.querySelector('#profile-note'); // role="status"
const warn = (e) => e.preventDefault();

function changed(el) {
  if (el.type === 'checkbox' || el.type === 'radio') return el.checked !== el.defaultChecked;
  if (el.tagName === 'SELECT') return [...el.options].some((o) => o.selected !== o.defaultSelected);
  return el.value !== el.defaultValue;
}

function paint() {
  const names = new Set([...form.elements].filter((el) => el.name && changed(el)).map((el) => el.name));
  const text = names.size === 0 ? 'Everything is saved'
    : names.size === 1 ? '1 unsaved change' : `${names.size} unsaved changes`;
  if (note.textContent !== text) note.textContent = text;
  if (names.size) addEventListener('beforeunload', warn);
  else removeEventListener('beforeunload', warn);
}

form.addEventListener('input', paint);
form.addEventListener('change', paint);
form.addEventListener('reset', () => setTimeout(paint)); // fired before the fields go back

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
  if (!res.ok) return; // say so, and keep the changes
  for (const el of form.elements) { // what was sent becomes the saved state
    if (el.type === 'checkbox' || el.type === 'radio') el.defaultChecked = el.checked;
    else if (el.tagName === 'SELECT') for (const o of el.options) o.defaultSelected = o.selected;
    else if ('defaultValue' in el) el.defaultValue = el.value;
  }
  paint();
});
```

- **Reset comes first.** The HTML standard fires `reset`, then resets each control if the event was not cancelled. A listener that counts at once still sees the old values, so it waits one task.
- **Warn before leaving.** MDN advises listening for `beforeunload` "only when users have unsaved changes" and removing the listener when it is no longer needed. The browser then asks before the person leaves, in words of its own that the page cannot set. The profile block has no such warning; add it.
- **Write the note only when it changes.** Radios that share a name count once, and the status region changes only when its words do.

## The danger zone

Put what cannot be undone last, in a card whose title names what is at stake. The security block ends with "Hand over or delete Perly Farm", and its rows say what goes: "1,284 orders, 312 customers and 46 invoices go for good, and the shop closes." The danger colour of the button adds to those words and never replaces them.

WCAG 3.3.4 Error Prevention (level AA) covers pages that "modify or delete user-controllable data": the submission must be reversible, checked for errors, or confirmed. When an action can be reversed, do it and offer Undo in a toast. Deleting a workspace cannot be reversed, so its button opens an [Alert Dialog](#c-alert-dialog) that asks for the name:

```html
<button class="tray-btn tray-btn--danger tray-btn--xs" type="button"
        data-tray="open" data-target="#delete-ws">Delete Perly Farm</button>

<dialog class="tray-dialog" id="delete-ws" role="alertdialog" data-tray="dialog"
        aria-labelledby="del-title" aria-describedby="del-text">
  <div class="tray-dialog__head"><div>
    <h2 class="subtitle" id="del-title">Delete Perly Farm?</h2>
    <p class="tray-dialog__text" id="del-text">The shop closes for all 5 people. It cannot be undone.</p>
  </div></div>
  <div class="tray-dialog__body">
    <div class="tray-field">
      <label class="tray-label" for="del-name">Type the name of the workspace</label>
      <input class="tray-input" id="del-name" autocomplete="off" spellcheck="false" aria-describedby="del-hint">
      <p class="tray-field__hint" id="del-hint">Perly Farm, as it is written here.</p>
    </div>
  </div>
  <div class="tray-dialog__foot">
    <button class="tray-btn tray-btn--quiet tray-btn--md" type="button" data-close autofocus>Keep Perly Farm</button>
    <button class="tray-btn tray-btn--danger tray-btn--md" type="button" id="del-go">Delete Perly Farm</button>
  </div>
</dialog>
```

```js
const dialog = document.querySelector('#delete-ws');
const field = document.querySelector('#del-name');
const hint = document.querySelector('#del-hint');

function plain() {
  field.removeAttribute('aria-invalid');
  hint.className = 'tray-field__hint';
  hint.textContent = 'Perly Farm, as it is written here.';
}
field.addEventListener('input', plain);
dialog.addEventListener('close', () => { field.value = ''; plain(); });

document.querySelector('#del-go').addEventListener('click', () => {
  if (field.value.trim() === 'Perly Farm') {
    dialog.close('delete'); // then delete it, and say so in a toast
    return;
  }
  field.setAttribute('aria-invalid', 'true');
  hint.className = 'tray-field__error';
  hint.textContent = 'Type Perly Farm, with the capitals, to delete it.';
  field.focus(); // the error is read with the field
});
```

- **Focus starts on the safe button.** `autofocus` puts it on Keep Perly Farm. The APG's modal dialog pattern advises focus on "the least destructive action" for a step "not easily reversible, such as deleting data".
- **The veil does not close it.** Tray UI's dialog script closes a dialog on a press outside it, except an alert dialog. Escape still closes it, and the `close` listener empties the field.
- **The Delete button is never disabled.** A wrong or empty name sets `aria-invalid`, writes what to type in the line `aria-describedby` already names, and puts focus back in the field, which is what makes the error heard: [Field](#c-field) explains why.

## On a phone

What Tray UI changes, checked at 390 pixels wide:

- Below 56rem the sidebar leaves the page, and the menu button in the top bar opens the same sidebar in a modal sheet.
- Below 56rem each section's title and sentence stand over its card, and the `tray-bento` cards of the other two blocks stack in one column.
- Two fields stand side by side from 40rem up, one per row below.
- Below 48rem the breadcrumb keeps only the current page, and the search in the top bar keeps only its icon.
- The three tabs fit. A strip that does not (`data-tray="strip"`) scrolls sideways and fades over its last 56 pixels.
- The save bar wraps, the note and Discard on one line and Save the changes under them, at the end of the form.
- Below 34rem the dialog's buttons stack, each the full width, Delete on top.

## Which block to start from

| Start from | When the page holds |
| --- | --- |
| [Profile settings](#b-settings-01) | Fields to fill in and save: a name, a photo, contact details. |
| [Notifications by channel](#b-settings-02) | Switches that save one by one, grouped by channel. For a grid of events against channels, take [Notification Preferences](#c-notification-preferences). |
| [Security and the danger zone](#b-settings-03) | Actions more than fields: a passkey, devices to sign out, a workspace to hand over or delete. |
| [Sidebar in a dialog](#b-sidebar-14) | Settings opened over the work and closed again. |

## Settings pages in Tray UI

Each block is one HTML file over `tokens.css`, `components/bundle.css` and `components/bundle.js`; [Installation](#d-installation) has the lines that link them, and each block's page shows its code. Only the profile block uses [Settings Section](#c-settings-section); the other two set their cards in a twelve-column `tray-bento` grid.

The controls are [Switch](#c-switch), [Field](#c-field) and [File Upload](#c-file-upload); [Tabs](#c-tabs) and [Sidebar](#c-sidebar) lead between pages, a [Toast](#c-toast) confirms a save, and an [Alert Dialog](#c-alert-dialog) guards the danger zone. These pages were checked in Chrome and its accessibility tree, not yet in a screen reader. The [Accessibility](#g-accessibility) guide has the rules every component follows.
