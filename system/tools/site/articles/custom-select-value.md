# A custom select that says its value

A custom select in HTML and JavaScript whose button says its label and its value, the keys of its list, and when the native select element is the better choice.

A custom select is a button that shows the chosen option and opens a list of the others: Jar size, 50 g. The `<select>` element already does this, and Tray UI's own advice is to use it by default. A custom one earns its place when an option needs a second line, an icon, or a group heading the native menu cannot draw. Where one goes wrong is often the button: the value is on the screen and missing from its name.

## A label replaces the button's text

A `<button>` is named by its content, so `<button>50 g</button>` is a button named "50 g". Give it a label, with a `<label for>`, `aria-labelledby` or `aria-label`, and the label becomes the name in place of the content. In Chrome, `<label for="jar">Jar size</label>` and `<button id="jar">50 g</button>` make a button named "Jar size". The value is still drawn on the button, and it is no part of the name.

The native element keeps the two apart. Chrome exposes a `<select>` as a combobox with two separate properties: the name "Jar size" and the value "50 g". A button has no value of its own, so whatever it should say has to be in its name.

## Put the value in the name

`aria-labelledby` takes a list of ids, and the name is the text of each, in order. Point it at the label and at the element that shows the value, and the button is named "Jar size 50 g". When a choice changes the text of that element, the name follows, with no ARIA to update.

```html
<span id="jar-label">Jar size</span>
<div class="select">
  <button type="button" aria-haspopup="listbox" aria-expanded="false"
          aria-controls="jar-list" aria-labelledby="jar-label jar-value">
    <span id="jar-value">Choose a jar</span>
  </button>
  <div role="listbox" id="jar-list" aria-labelledby="jar-label" hidden>
    <button type="button" role="option" tabindex="-1" aria-selected="false" data-value="30">30 g</button>
    <button type="button" role="option" tabindex="-1" aria-selected="false" data-value="50">50 g</button>
    <button type="button" role="option" tabindex="-1" aria-selected="false" data-value="100">100 g</button>
    <button type="button" role="option" tabindex="-1" aria-selected="false" data-value="500"
            aria-disabled="true">500 g</button>
  </div>
  <input type="hidden" name="jar">
</div>
```

- **The button says what it opens.** `aria-haspopup="listbox"` names the kind of popup, `aria-expanded` says whether it is open, and `aria-controls` points at it.
- **The list takes the label alone.** The APG's listbox pattern asks that a listbox outside another widget have "either a visible label referenced by aria-labelledby or a value specified for aria-label." Chrome names the open list "Jar size".
- **Every option says whether it is chosen.** The APG: "All options that are selectable but not selected have either aria-selected or aria-checked set to false." The chosen one has `aria-selected="true"`.
- **Options are buttons.** `role="option"` is allowed on a `<button>`, and a button fires `click` on Enter and on Space, so one click handler chooses an option from the mouse and from the keyboard.
- **The hidden input carries the value** in the form, under its `name`.

Until a choice is made, the button is named "Jar size Choose a jar", which says that nothing is chosen yet.

## Focus in the list

A list can be worked in two ways. The script can move focus to each option in turn, as here and in Tray UI: every option has `tabindex="-1"`, and `focus()` both styles it through `:focus-visible` and scrolls it into view. Or focus can stay on the trigger while `aria-activedescendant` points at the option under the keyboard; the APG notes that the listbox role supports it as "an alternative to moving DOM focus among option elements". The APG's [select-only combobox example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) takes that second way, with a `div` of `role="combobox"` as the trigger. Both are valid. Moving focus keeps the trigger a plain button and draws the focus ring where focus really is.

| Key | Where | What happens |
| --- | --- | --- |
| Enter, Space, ArrowDown, ArrowUp | On the button | Opens the list on the chosen option, or on the first. |
| ArrowDown, ArrowUp | In the list | The next or the previous option, wrapping at the ends and passing over disabled ones. |
| Home, End | In the list | The first or the last option. |
| A letter | In the list | The next option that starts with it. |
| Enter or Space | On an option | Chooses it, closes the list and returns focus to the button. |
| Escape | In the list | Closes the list and returns focus to the button; the value stays. |
| Tab | In the list | Closes the list; focus moves on. |
| Shift+Tab | In the list | Closes the list and returns focus to the button. |

The APG's listbox pattern recommends type-ahead for every listbox, "especially those with more than seven options", and moves focus "to the next item with a name that starts with the typed character". The next one, counted from the option with focus: a second press of the same letter goes on to the following match.

## A script from scratch

This runs the markup above, with every key in the table.

```js
const root = document.querySelector('.select');
const button = root.querySelector('[aria-haspopup="listbox"]');
const list = root.querySelector('[role="listbox"]');
const value = document.getElementById('jar-value');
const field = root.querySelector('input[type="hidden"]');
const all = () => [...list.querySelectorAll('[role="option"]')];
const live = () => all().filter((o) => o.getAttribute('aria-disabled') !== 'true');

function open() {
  list.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  (live().find((o) => o.getAttribute('aria-selected') === 'true') || live()[0]).focus();
}

function close(back) {
  if (list.hidden) return;
  list.hidden = true;
  button.setAttribute('aria-expanded', 'false');
  if (back) button.focus();
}

function choose(option) {
  all().forEach((o) => o.setAttribute('aria-selected', String(o === option)));
  value.textContent = option.textContent;  // the name becomes "Jar size 50 g"
  field.value = option.dataset.value;
  close(true);
}

// Enter and Space click the button: they open the list as a click does
button.addEventListener('click', () => (list.hidden ? open() : close()));
button.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  e.preventDefault();
  open();
});

// Enter and Space click the focused option too
list.addEventListener('click', (e) => {
  const option = e.target.closest('[role="option"]');
  if (option && option.getAttribute('aria-disabled') !== 'true') choose(option);
});

list.addEventListener('keydown', (e) => {
  const options = live(), i = options.indexOf(document.activeElement);
  const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: options.length - 1 }[e.key];
  if (to !== undefined) {
    e.preventDefault();
    options[(to + options.length) % options.length].focus();
  } else if (e.key.length === 1 && e.key !== ' ') {
    // type-ahead: the next option, after this one, that starts with the letter
    const next = [...options.slice(i + 1), ...options.slice(0, i + 1)]
      .find((o) => o.textContent.trim().toLowerCase().startsWith(e.key.toLowerCase()));
    if (next) next.focus();
  } else if (e.key === 'Tab' && e.shiftKey) {
    e.preventDefault();
    close(true);
  }
});

root.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !list.hidden) { e.preventDefault(); close(true); }
});
root.addEventListener('focusout', (e) => {
  if (e.relatedTarget && !root.contains(e.relatedTarget)) close();
});
document.addEventListener('pointerdown', (e) => {
  if (!root.contains(e.target)) close();
});
```

- **`live()` serves every key.** The arrows, Home, End and type-ahead all work on the options that are not disabled, so none of them can land on 500 g.
- **Shift+Tab needs its own line.** From an option, Shift+Tab would land on the button, which is inside the wrapper, and `focusout` would leave the list open. The script closes it on that key and sends focus to the button itself.
- **Escape keeps the value.** Only a choice changes `aria-selected`, the text and the hidden input.

## When to keep the native select

The `<select>` element is a form control. Its value is sent with the form under its `name`, `required` stops a submit while an empty first option is chosen, a reset restores the option chosen in the markup, and `<optgroup>` groups the options. A phone opens its own picker for it, and none of it needs a script. A custom select gets none of this for free: the hidden input above is sent with the form, and that is all.

The native element can now be styled much further. With `appearance: base-select` on the `select` and on `::picker(select)`, Chrome lets you write the button and put markup such as an icon or a second line inside each `<option>`:

```html
<label for="jar">Jar size</label>
<select id="jar" name="jar">
  <button><selectedcontent></selectedcontent></button>
  <option value="30">30 g</option>
  <option value="50">50 g <small>most chosen</small></option>
</select>
```

```css
select, ::picker(select) { appearance: base-select; }
```

MDN marks [customizable select elements](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select) as limited availability, not Baseline, because they do not work "in some of the most widely-used browsers". Elsewhere the element falls back to a classic select, so it can be added as an enhancement. MDN also warns that what you put in an option "can alter the accessible value exposed to assistive technology": in Chrome, choosing the second option above makes the value "50 g most chosen". Give icons in an option `aria-hidden="true"`, as MDN's example does.

Tray UI's rule is the same in other words. [Native Select](#c-native-select): "Use this one by default: it is accessible everywhere and opens the platform's picker on a phone." Use [Select](#c-select) when options need a second line, an icon or grouping the native menu cannot show, and [Combobox](#c-combobox) when the list is long enough to search, past about ten options. A list of actions, such as "Add new", is a [Dropdown Menu](#c-dropdown-menu), not a select.

## The Select in Tray UI

```html
<span class="tray-label" id="jar-label">Jar size</span>
<div class="tray-anchor tray-anchor--block" data-tray="select">
  <button class="tray-select-trigger" type="button" data-placeholder aria-labelledby="jar-label">
    <span class="tray-select-trigger__value">Choose a jar</span>
    <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chevrons-up-down"/></svg>
  </button>
  <div class="tray-pop">
    <div class="tray-list">
      <button type="button" class="tray-option" role="option" data-value="30">
        <span class="tray-option__text">30 g</span>
        <svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg>
      </button>
      <!-- …more options… -->
    </div>
  </div>
  <input type="hidden" name="jar">
</div>
```

The script makes the panel a `listbox`, gives the trigger `aria-haspopup="listbox"`, `aria-controls` and `aria-expanded`, and names the list as the trigger is named. Then it adds the `tray-select-trigger__value` to the trigger's `aria-labelledby`, after the label. It finds the label wherever it is: an `aria-labelledby` of your own, a `<label for>`, or an `aria-label`, in which case the trigger's `aria-labelledby` points at the trigger itself and then at the value. In Chrome, each of the three gives a name such as "Jar size 50 g". A trigger with no label at all is named by its content, value included.

Each option gets `tabindex="-1"` and `aria-selected="false"`. A choice sets `aria-selected`, writes the option's text (or its `data-label`) into the trigger, removes `data-placeholder`, which drew the placeholder in the hint colour, fills the hidden input and fires `tray:change` with `detail.value`. The chosen option is semibold with a tick, so it does not rest on colour. Write a group of options as a `role="group"` named by its `tray-list__label`. The value went into the name in version 0.2.0, under "Easier to hear".

Tray UI's list differs from the script above in three places. A letter goes to the first option that starts with it, not the next, and it can land on a disabled option, which then cannot be chosen. Shift+Tab from an option moves focus to the trigger and leaves the list open. [Installation](#d-installation) has the three files.
