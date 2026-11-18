# A command palette (Cmd+K) in plain HTML

A command palette opened with Cmd+K or Ctrl+K in plain HTML: a modal dialog, a combobox over a listbox, filtering, groups and aria-activedescendant.

A command palette is a search field over a list of places and actions, opened from anywhere with a shortcut. Type "exp", press Enter, and Export orders runs. Tray UI's [Command](#c-command) component is one, and the search of this site is built on it: press `/`, or Ctrl K (⌘K on a Mac). It is made of three standard parts: a modal `<dialog>`, a text field with the combobox role, and a listbox under it. The [modal dialog](#a-modal-dialog-html) and the [autocomplete combobox](#a-combobox-without-library) each have an article of their own; a palette puts the second inside the first.

## The dialog does half the work

Open the palette with `showModal()`, and the browser does most of what a modal needs.

- **The rest of the page is out of reach.** MDN: "Everything outside the modal dialog is inert and interactions outside the dialog are blocked."
- **Focus moves in.** "When using HTMLDialogElement.showModal() to open a `<dialog>`, focus is set on the first nested focusable element": the search field.
- **Escape closes it.** "By default, a dialog invoked by the showModal() method can be dismissed by pressing the Esc key."
- **Focus comes back.** When a modal dialog closes, the HTML standard runs the focusing steps for its "previously focused element", the one that had focus when it opened. The palette needs no code to send focus home.

Give the dialog a name with `aria-label`, and style the page behind it with `::backdrop`.

Keep the field a plain text input. With `type="search"`, Chrome spends the first Escape on clearing the field when it holds text, and the dialog stays open until the second.

## The field and the list

```html
<button type="button" id="open-palette" aria-haspopup="dialog">Search <kbd>Ctrl K</kbd></button>

<dialog id="palette" aria-label="Command palette">
  <input type="text" role="combobox" aria-label="Search or run a command" autocomplete="off"
         aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list">
  <div role="listbox" id="palette-list">
    <div role="group" aria-labelledby="go-to">
      <div id="go-to">Go to</div>
      <div role="option" id="opt-orders" data-value="orders">Orders</div>
      <div role="option" id="opt-batches" data-value="batches">Batches</div>
    </div>
    <div role="group" aria-labelledby="actions">
      <div id="actions">Actions</div>
      <div role="option" id="opt-new" data-value="new-order">Create an order</div>
      <div role="option" id="opt-export" data-value="export">Export orders</div>
    </div>
  </div>
  <p role="status" class="visually-hidden"></p>
</dialog>
```

The field follows the WAI-ARIA Authoring Practices [combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/): "The element that serves as an input and displays the combobox value has role combobox", and it "has aria-controls set to a value that refers to the element that serves as the popup." Its popup is a listbox. In a palette the list is always on screen, so `aria-expanded` stays `"true"`. `aria-autocomplete="list"` says that the list follows what is typed, and `autocomplete="off"` keeps the browser's own suggestions from covering it.

Each group is a `role="group"` named by its heading through `aria-labelledby`; Chrome names the two groups above "Go to" and "Actions". Every option has an `id`, because the highlight refers to it by id.

## Focus stays in the field

The person keeps typing while they move through the list, so focus cannot go to the options: the next letter would land on an option instead of in the field. The APG puts it this way for a combobox with a listbox: "DOM Focus is maintained on the combobox" and "the assistive technology focus is moved within the listbox using aria-activedescendant". The field's `aria-activedescendant` holds the `id` of the highlighted option, and the script changes it as the arrows move.

Two things follow. The highlight is not focus, so the browser draws nothing for it: the script marks the option with an attribute and CSS fills it, while the focus ring stays on the field. And the browser no longer scrolls the list to the option, so the script calls `scrollIntoView({ block: 'nearest' })`.

Typing hides options, and nothing in the markup says how many are left. When none is left, the sentence that says so would sit in the list, where nothing reads it while focus is in the field. A `role="status"` element beside the list says "Nothing matches" as it happens. Its `visually-hidden` class is the usual rule that keeps text from the eye and leaves it to assistive technologies; Tray UI's is `tray-vh`: `position: absolute`, a 1px box, `overflow: hidden`, `clip-path: inset(50%)` and `white-space: nowrap`.

## What counts as a match

The filter keeps an option when its text contains what was typed, anywhere, whatever the case: "ord" keeps Orders, Create an order and Export orders. It never changes the order of the list, so the first match is the first of them as the list is written, and Enter runs it at once. That makes the order of the list matter. Put what people do most at the top, as the Command's own rule says: an empty field shows those first, and a short query reaches them with one Enter. A palette over hundreds of pages may need to rank its matches, a match at the start of a word before one inside it, for instance; a list of a few dozen can keep its own order.

## The keys

| Key | What happens |
| --- | --- |
| Ctrl+K or Cmd+K | Opens the palette from anywhere, a text field included. |
| `/` | Opens it, except in a text field, where it types a slash. |
| Typing | Filters the options; the first match is highlighted. |
| ArrowDown, ArrowUp | The next or the previous option, across groups, wrapping at the ends. |
| Enter | Runs the highlighted option and closes the palette. |
| Escape | Closes the palette; focus returns to where it was. |

Wrapping is a choice: the APG's combobox, on the last option, "either returns focus to the combobox or does nothing". Tray UI's palette wraps, as its menus do.

## The script

```js
const dialog = document.getElementById('palette');
const input = dialog.querySelector('[role="combobox"]');
const list = dialog.querySelector('[role="listbox"]');
const status = dialog.querySelector('[role="status"]');
const options = () => [...list.querySelectorAll('[role="option"]')];
const shown = () => options().filter((o) => !o.hidden);
let active = null;

function highlight(option) {
  if (active) active.removeAttribute('data-active');
  active = option || null;
  if (active) {
    active.setAttribute('data-active', '');
    input.setAttribute('aria-activedescendant', active.id);
    active.scrollIntoView({ block: 'nearest' });
  } else {
    input.removeAttribute('aria-activedescendant');
  }
}

function filter() {
  const q = input.value.trim().toLowerCase();
  options().forEach((o) => { o.hidden = !o.textContent.toLowerCase().includes(q); });
  list.querySelectorAll('[role="group"]').forEach((g) => {
    g.hidden = !g.querySelector('[role="option"]:not([hidden])');
  });
  highlight(shown()[0]);
  status.textContent = shown().length ? '' : 'Nothing matches';
}

function run(option) {
  dialog.close();  // focus goes back to where it was before the palette opened
  console.log('run', option.dataset.value);
}

function openPalette() {
  if (dialog.open) return;
  dialog.showModal();  // focus moves to the input, the first control inside
  input.value = '';
  filter();
}

input.addEventListener('input', filter);
input.addEventListener('keydown', (e) => {
  const all = shown(), i = all.indexOf(active);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();  // the caret stays where it is
    const step = e.key === 'ArrowDown' ? 1 : -1;
    highlight(all[(i + step + all.length) % all.length]);
  } else if (e.key === 'Enter' && active) {
    e.preventDefault();
    run(active);
  }
});

list.addEventListener('pointerdown', (e) => e.preventDefault());  // focus stays in the input
list.addEventListener('pointermove', (e) => {
  const option = e.target.closest('[role="option"]');
  if (option && option !== active) highlight(option);
});
list.addEventListener('click', (e) => {
  const option = e.target.closest('[role="option"]');
  if (option) run(option);
});

document.getElementById('open-palette').addEventListener('click', openPalette);
document.addEventListener('keydown', (e) => {
  const k = e.key === 'k' && (e.metaKey || e.ctrlKey) && !e.altKey;
  const slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey &&
    !e.target.closest?.('input, textarea, select, [contenteditable="true"]');
  if (!k && !slash) return;
  e.preventDefault();
  openPalette();
});
```

- **Both modifier keys open it.** `metaKey` is Command on a Mac and `ctrlKey` is Control, so one test serves every platform. `e.key` is the character the key makes, which depends on Shift and on the keyboard layout, as MDN notes: with Shift held it is `"K"`, and Ctrl+Shift+K does not match.
- **The slash leaves fields alone.** A person typing "1/2" in a field must get their slash. Ctrl+K has no such test, since it types nothing.
- **`preventDefault()` on the shortcut** keeps the key from doing anything else once the palette has it.
- **A press on the list keeps focus in the field.** `preventDefault()` on `pointerdown` stops the field from losing focus, and the `click` that follows runs the option.
- **The arrows keep the caret.** Without `preventDefault()`, ArrowUp and ArrowDown can also move the caret, to the start or the end of the field.
- **Each opening starts clean.** The field is emptied and every option shown again, the first one highlighted.

## Make it findable

A shortcut is invisible until someone tells you about it. Put a button in the page that opens the palette, and show the key on it, as the header of this site shows `/` beside "Search". The Command's own rules add: "Don't make the palette the only way to reach anything", and "Don't run a destructive action straight from the list; open an Alert Dialog first." Name actions with a verb ("Create an order") and places with their title ("Orders").

## The Command in Tray UI

```html
<dialog class="palette" data-tray="dialog" id="search" aria-label="Search">
  <div class="tray-command" data-tray="command">
    <label class="tray-command__search">
      <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg>
      <input placeholder="Search or run a command" aria-label="Command">
    </label>
    <div class="tray-command__list">
      <div data-group>
        <div class="tray-list__label">Go to</div>
        <button type="button" class="tray-option" role="option" data-value="orders">
          <span class="tray-option__text">Orders</span>
        </button>
      </div>
      <div class="tray-list__empty" hidden>Nothing matches. Try another word.</div>
    </div>
  </div>
</dialog>
```

```css
.palette { inline-size: min(100% - 2rem, 38rem); margin: 12vh auto auto; padding: 0; border: 0; background: none; overflow: visible; }
.palette::backdrop { background: var(--scrim); }
.palette .tray-command { inline-size: 100%; }
```

These are the rules of this site's search dialog: the `tray-command` is already a raised panel, so the dialog around it draws nothing of its own. `data-tray="dialog"` adds closing on a click on the veil.

The script does what the script above does: the field becomes a `combobox` with `aria-expanded="true"`, `aria-controls` and `autocomplete="off"`, the list a `listbox`, each `data-group` a `group` named by its `tray-list__label`, and every option gets an `id` and `tabindex="-1"`. The highlight is `data-active`, drawn as the fill of a hovered option, and `aria-activedescendant` on the field; the search row draws the 2px ink ring of a field while focus is in it. Enter or a click fires `tray:select` with `detail.value` on the `tray-command`, and you close the dialog and act on it.

Two things differ. The filter reads all the text of an option, shortcut keys included, so "go" finds an option that shows the keys G and O; and `detail.value` falls back to that same text, so give every option a `data-value`. And the Command has no status line: its `tray-list__empty` sentence appears in the list, where nothing reads it while focus is in the field. The [Combobox](#c-combobox) says its own no-match sentence through a status line beside its list.

The search of this site is a Command in a [Dialog](#c-dialog) named "Search the site", with one group per section and every page of the site in it. Opening it empties the field and filters again; a choice closes the dialog and goes to the page. A button in the header opens it too. [Installation](#d-installation) has the three files.
