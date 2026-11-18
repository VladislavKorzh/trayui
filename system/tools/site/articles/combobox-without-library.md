# An autocomplete combobox without a library

An autocomplete combobox in plain HTML and JavaScript: role="combobox", a listbox, aria-activedescendant, filtering, the keys and a spoken count.

A combobox is a text field with a list of suggestions under it. Type "iv" and the list narrows to Kharkiv, Kyiv and Lviv; Enter takes the highlighted one. People search for it as an autocomplete, an autosuggest or a searchable select. The WAI-ARIA Authoring Practices Guide (APG) describes it as the [combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), "an input widget that has an associated popup". Below, each part of it is built in plain HTML and JavaScript, next to what Tray UI's [Combobox](#c-combobox) does.

## Four kinds of autocomplete

The APG sorts comboboxes by what the list does as you type. `aria-autocomplete` on the field tells assistive technologies which kind they are in.

| Kind | What the list does | `aria-autocomplete` |
| --- | --- | --- |
| No autocomplete | Shows the same suggestions whatever is typed. | `none` |
| List, manual selection | Narrows as you type; nothing is highlighted until an arrow key moves into it. | `list` |
| List, automatic selection | Narrows, and the first match is highlighted, so Enter takes it. | `list` |
| List with inline completion | Also writes the rest of the first match into the field after the caret. | `both` |

Tray UI's Combobox, and the script further down, are the third kind.

## A combobox, a select or a datalist

A combobox earns its script when the list is longer than a screen: cities, countries, people. Tray UI's rule for it: "Don't use it for five options; a Select or a Radio Group is faster." A [Select](#c-select) lists every choice, and a [Radio Group](#c-radio-group) shows them without opening anything.

HTML has a combobox of its own. An `<input list="cities">` with a `<datalist id="cities">` of `<option>` elements offers suggestions with no script. MDN lists what it costs: the options do not zoom with the page, they cannot be styled for high contrast, and "some screen reader/browser combinations, including NVDA and Firefox, do not announce the contents of the autosuggest popup". The field also accepts any value, since `<datalist>` "is not a replacement for `<select>`". Use it when the suggestions are a convenience and any typed answer will do. When the answer must be one of the options, build the pattern.

## The markup

- The field is a real `<input>` with `role="combobox"`. Typing, the caret, selection and paste then work as in any text field, and the browser handles them.
- `aria-expanded` says whether the list is shown: `"false"` until it opens.
- `aria-controls` names the list by its `id`.
- `aria-autocomplete="list"` says the list narrows to what is typed.
- `autocomplete="off"` keeps the browser's own suggestions of past entries from opening over your list.
- The list is `role="listbox"`, named by the same label as the field, so it is clear which list has opened.
- Each suggestion is `role="option"` with an `id`. The script refers to options by their ids.
- A `role="status"` element beside the list, visually hidden, speaks the count. It sits outside the listbox, which may hold only options and groups of options.

```html
<label id="city-label" for="city">City</label>
<div class="combo">
  <input id="city" type="text" role="combobox" aria-autocomplete="list"
         aria-expanded="false" aria-controls="city-list" autocomplete="off">
  <ul id="city-list" role="listbox" aria-labelledby="city-label" hidden>
    <li id="city-1" role="option" aria-selected="false">Dnipro</li>
    <li id="city-2" role="option" aria-selected="false">Kharkiv</li>
    <li id="city-3" role="option" aria-selected="false">Kyiv</li>
    <li id="city-4" role="option" aria-selected="false">Lviv</li>
    <li id="city-5" role="option" aria-selected="false">Odesa</li>
  </ul>
  <p id="city-status" class="visually-hidden" role="status"></p>
</div>
```

Give the field a visible `<label>`. A placeholder such as "Find a city" disappears as soon as someone types, and, as Tray UI's README puts it, "a placeholder is not a name".

## Focus stays in the field

In a [dropdown menu](#a-accessible-dropdown-menu), the arrow keys move focus from item to item. In a combobox they cannot: the person is still typing, and the caret has to stay in the field. The APG's rule is that "DOM focus is placed on the combobox element" and stays there while the arrows move through the list.

`aria-activedescendant` carries the rest. Set it on the field to the `id` of the highlighted option, and assistive technologies treat that option as the focused element while the real focus stays in the input. Three details follow from it.

- **Only a visible option.** Options that do not match are hidden with the `hidden` attribute, which also takes them out of the accessibility tree. `aria-activedescendant` should never point at one of them; when nothing matches, remove the attribute.
- **Scroll it into view yourself.** The APG's example notes that browsers do not scroll an active descendant into view as they scroll a focused element. Call `scrollIntoView({ block: 'nearest' })` on each option you highlight.
- **Mark the highlight as selected.** In the APG's list example, the highlighted option carries `aria-selected="true"`, and only while `aria-activedescendant` points at it.

A click on an option is the last trap. A press on an element that cannot take focus moves focus out of the field, the field's `blur` closes the list, and the click lands on nothing. Calling `preventDefault()` on the list's `pointerdown` keeps focus, and the caret, in the field.

## The keys

| Key | What happens |
| --- | --- |
| Typing | Opens the list, narrows it and highlights the first match. |
| ArrowDown | On a closed list, opens it on the first match; on an open list, the next match, wrapping at the end. |
| ArrowUp | The previous match, wrapping at the start. |
| Enter | Takes the highlighted match: it goes into the field and the list closes. |
| Escape | Closes the list and leaves the text as it is. |
| Tab | Moves on to the next control; the list closes. |
| Home, End, ArrowLeft, ArrowRight | Move the caret in the field, as in any text field. |

The APG marks two more keys as optional. Alt+ArrowDown opens the list without moving the highlight, and Escape on a closed list clears the field. The script below has neither.

## Filtering as you type

Decide what a match is. The APG's example keeps the names that start with what was typed. Tray UI and the script below keep the options that contain it anywhere, so "iv" finds Kyiv and Lviv as well as Kharkiv. Containing suits names whose middle people remember; starting with keeps long lists short. Either way, trim the text and compare it in lower case.

When nothing matches, say so on the screen as well as aloud. Tray UI shows a sentence in the list, and its advice is to say what to do next: "No city by that name. Check the spelling."

A list too long to keep in the page can come from the server instead: fetch the matches as the person types and write the options again. The rest of the script stays as it is.

## Speaking the count

A sighted person sees the list grow and shrink. `aria-activedescendant` gives a screen reader the highlighted option, but nothing in the pattern gives it the number of matches: one of three, or one of three hundred.

WCAG 2.2 calls such a message a status message. Success criterion 4.1.3 asks that it can be presented "without receiving focus", and the Understanding document gives "18 results returned" as an example. Write the count into the `role="status"` element. That element has to be in the page before the first message arrives, empty: [Toast notifications that screen readers announce](#a-toast-notifications-screen-readers) explains why a live region added together with its text is often not read.

Write the count once typing pauses, not after every key, so that a fast typist is not handed a count for every letter. GOV.UK's accessible-autocomplete waits 1400 milliseconds after the last change, then writes "3 results are available." It also writes into two status elements in turn, so that a message identical to the last one still arrives as a change. The script below waits 500 milliseconds.

## A script from scratch

This runs the markup above. It covers the keys in the table, the pointer, filtering and the count.

```js
const input = document.getElementById('city');
const list = document.getElementById('city-list');
const status = document.getElementById('city-status');
const options = [...list.querySelectorAll('[role="option"]')];
let active = null, timer = 0;

const shown = () => options.filter((o) => !o.hidden);

function highlight(option) {
  active?.classList.remove('active');
  active?.setAttribute('aria-selected', 'false');
  active = option || null;
  if (!active) { input.removeAttribute('aria-activedescendant'); return; }
  active.classList.add('active');
  active.setAttribute('aria-selected', 'true');
  input.setAttribute('aria-activedescendant', active.id);
  active.scrollIntoView({ block: 'nearest' }); // the browser does not scroll to it
}

function open() {
  list.hidden = false;
  input.setAttribute('aria-expanded', 'true');
}

function close() {
  list.hidden = true;
  input.setAttribute('aria-expanded', 'false');
  highlight(null);
  clearTimeout(timer);
  status.textContent = '';
}

function filter() {
  const q = input.value.trim().toLowerCase();
  for (const o of options) o.hidden = !o.textContent.toLowerCase().includes(q);
  const n = shown().length;
  highlight(shown()[0]);
  // Say the count once typing pauses, not after every key
  clearTimeout(timer);
  timer = setTimeout(() => {
    status.textContent = n ? `${n} ${n === 1 ? 'city' : 'cities'}` : 'No city by that name';
  }, 500);
}

function choose(option) {
  input.value = option.textContent;
  close();
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

input.addEventListener('input', () => { open(); filter(); });

input.addEventListener('keydown', (e) => {
  const items = shown(), i = items.indexOf(active);
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (list.hidden) { open(); filter(); }
    else if (items.length) highlight(items[(i + 1) % items.length]);
  } else if (e.key === 'ArrowUp' && !list.hidden && items.length) {
    e.preventDefault();
    highlight(items[(i - 1 + items.length) % items.length]);
  } else if (e.key === 'Enter' && !list.hidden && active) {
    e.preventDefault();
    choose(active);
  } else if (e.key === 'Escape' && !list.hidden) {
    e.preventDefault();
    close();
  }
});

// A press on an option must not take focus away from the field
list.addEventListener('pointerdown', (e) => e.preventDefault());
list.addEventListener('click', (e) => {
  const option = e.target.closest('[role="option"]');
  if (option) choose(option);
});
input.addEventListener('blur', close);
```

- **Style the highlight.** The script puts the class `active` on the highlighted option; give it a fill, such as `background: Highlight; color: HighlightText`. The `visually-hidden` class keeps the status element in the accessibility tree while hiding it from sight: `position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap`.
- **Keep the hidden attribute working.** Any `display` your CSS gives the options beats the browser's own `[hidden]` rule. Add `[hidden] { display: none !important; }` if they need one.
- **Enter only takes a highlight.** With the list closed, Enter goes on to the form, which submits as usual.
- **More than one on a page.** Wrap the code in a function that takes the field, and run it once for each combobox.

## The combobox in Tray UI

Write the field and the list, with `data-tray="combobox"` on the anchor around them:

```html
<label class="tray-label" for="city">City</label>
<div class="tray-anchor tray-anchor--block" data-tray="combobox" id="city-box">
  <div class="tray-input-group">
    <span class="tray-input-group__addon">
      <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg>
    </span>
    <input class="tray-input" id="city" placeholder="Find a city">
  </div>
  <div class="tray-pop">
    <div class="tray-list">
      <button type="button" class="tray-option" role="option" data-value="kyiv">
        <span class="tray-option__text">Kyiv</span>
        <svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg>
      </button>
      <button type="button" class="tray-option" role="option" data-value="lviv">
        <span class="tray-option__text">Lviv</span>
        <svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg>
      </button>
      <div class="tray-list__empty">No city by that name. Check the spelling.</div>
    </div>
  </div>
</div>
```

The script writes the ARIA: `role="combobox"`, `aria-autocomplete="list"`, `aria-controls`, `aria-expanded` and `autocomplete="off"` on the field, `role="listbox"` and a name from the field's label on the panel, and an `id` on every option. The keys are the ones in the table, and a press on an option keeps focus in the field. Its filter keeps the options whose text contains what was typed, in any case, and highlights the first.

Two things differ from the script above. `aria-selected="true"` marks the option that was taken, which also shows a tick, and the highlight is a fill without it. And the hidden status line holds only the no-match sentence, written once and not again at each key while nothing matches (since the next release); the README says plainly that the number of matches is not announced. Add a count of your own beside it if your lists run long.

Taking an option puts its `data-label`, or its text, into the field and fires `tray:change` on the anchor, with `detail.value` set to the option's `data-value`:

```js
document.getElementById('city-box').addEventListener('tray:change', (e) => {
  console.log(e.detail.value); // "kyiv"
});
```

When names repeat, give options a second line with `tray-option--two`, and a `data-label` that holds the name alone. The filter reads both lines, kept apart, so "kp" does not match "Anna Melnyk" over "Packing"; 0.2.0 ran them together. For markup added after the page has loaded, call `TrayUI.init(root)`. The [Command](#c-command) palette uses the same pattern with a list that is always open, so its field keeps `aria-expanded="true"`.

The [Combobox](#c-combobox) page has a live example with a single line and with two, and [Installation](#d-installation) has the lines that link the stylesheet and the script.
