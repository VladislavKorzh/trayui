# A slider that says its unit with aria-valuetext

A native range input that says "30 km" where it would say "30": aria-valuetext, a visible value, words for the steps, the keys, and Tray UI's slider.

## A number without its unit

A slider in HTML is `<input type="range">`, and MDN gives its implicit ARIA role as `slider`. Its value is a number. A delivery radius of 30 kilometres reaches the accessibility tree as 30, and MDN's page on `aria-valuetext` says why that can fall short: "Assistive technologies present `aria-valuenow` as numeric values." The number does not say whether it counts kilometres, minutes or per cent.

`aria-valuetext` gives the value as a person would say it. MDN: "When both the `aria-valuetext` and `aria-valuenow` are included, the `aria-valuetext` is announced." On a native range input the browser supplies the number, and you add the words:

```html
<label for="radius">Delivery radius</label>
<input type="range" id="radius" min="0" max="50" step="10" value="30" aria-valuetext="30 km">
```

The attribute is only needed when the number alone does not say enough. MDN's example of a number that does is a spinner for "how many pizza slices you want to order": 3 is 3 slices. Tray UI follows the same rule: its slider sets `aria-valuetext` only when you give it a unit, and a slider for "Jars per month" says its plain number.

## Start from the native range input

`<input type="range">` comes with most of a slider already working: the role, the value and its limits, the keys, focus, a `disabled` state that leaves it out of the Tab order, and a value sent with the form. A `div` with `role="slider"` needs all of that written by hand, as the [APG slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) lists it.

The native element has its own limits, so leave them to it. ARIA in HTML says authors "SHOULD NOT use the aria-valuemax or aria-valuemin attributes on input type=range"; `min`, `max` and `value` already set them. `aria-valuetext` is one of the slider's attributes that it allows.

Name the slider with a `<label for>`. A seek bar inside a video player, where no visible label fits, can take an `aria-label`, as Tray UI's player does with "Position in the film".

## The keys

These are the keys of a range input in Chrome, measured on sliders from 0 to 50 in steps of 10, from 0 to 100 in steps of 1, and from 0 to 1000 in steps of 50.

| Key | What happens |
| --- | --- |
| ArrowRight, ArrowUp | One step up. |
| ArrowLeft, ArrowDown | One step down. |
| PageUp, PageDown | About a tenth of the range, at least one step: 10 on the 0 to 100 slider, 100 on the 0 to 1000 one. |
| Home, End | The minimum and the maximum. |

Under `dir="rtl"`, Chrome swaps ArrowLeft and ArrowRight, so the arrow that points towards the higher end raises the value. The APG pattern lists the same keys and marks Page Up and Page Down as optional, moving by "an amount larger than the step".

A slider whose step suits the pointer may be too fine for a key. Tray UI's video player has a seek range in tenths of a second; it catches the arrows itself and moves five seconds, mirrored right to left, and Page Up and Page Down move a tenth of the film. Home and End are left to the browser.

## From units to words

The value text can carry more than a unit.

| Value | `aria-valuetext` | What it adds |
| --- | --- | --- |
| 30 | "30 km" | The unit, from Tray UI's `data-unit`. |
| 3, on a scale of 1 to 5 | "Hot, 3 of 5" | A name for each step, and where it sits. |
| 83.4, in seconds | "1:23 of 4:56" | A time, and the length of the whole. Tray UI's video player writes it. |
| 120 | "Up to $120" | A unit before the number, and what the value means. Tray UI's catalogue block writes it. |

The third and fourth are why a unit alone is not always enough. A time in seconds is unreadable as 83.4, and "$" goes in front of the number, where Tray UI's `data-unit`, which adds its text after the value, cannot put it. The catalogue with a filter column, `catalog-02`, sets its own `aria-valuetext` from its own script instead.

Write the words in the page's language. Tray UI's player takes the word between the two times from `data-of`, so a page in another language puts its own word there.

## A visible value beside it

Show the value next to the label as well. Tray UI's rule for the slider is that "a slider with no number beside it is a guess", and its examples print the two ends of the scale under the track.

The element for a value worked out from inputs is `<output for>`. MDN gives `<output>` the implicit role `status`, and adds: "Many browsers implement this element as an `aria-live` region." Chrome does: in its accessibility tree an `<output>` is a status with a polite live setting. Every change to its text is then a status message of its own, on top of the slider's value text, and the same words can reach a screen reader twice.

Tray UI's [Slider](#c-slider) writes the value into an `<output for>`, and since version 0.3.0 marks it `aria-hidden="true"`, so the words are read once, from the slider. The catalogue block, `catalog-02`, shows its price in a plain `span` marked `aria-hidden="true"` and leaves the speaking to the slider's `aria-valuetext` in the same way. When a slider says its own value, a plain element beside it, which is not a live region, is the quieter choice, and the examples below use a `span`. Keep `<output>` for a result that no single control says, such as a total worked out from several fields.

## Keep the text in step

`aria-valuetext` is a fixed string. The browser changes the value as keys are pressed and the thumb is dragged, and nothing changes the text unless a script does. Update it on the `input` event: in Chrome it fires on every step, from a key or a drag, while `change` fires on a drag only once the thumb is let go.

```html
<label for="weight">Parcel weight</label>
<span id="weight-shown"></span>
<input type="range" id="weight" min="0" max="70" step="5" value="40">

<label for="heat">Heat</label>
<span id="heat-shown"></span>
<input type="range" id="heat" min="1" max="5" value="3">
```

```js
// words(value) gives the value as a person would say it, unit and all
function speak(input, words) {
  const shown = document.getElementById(`${input.id}-shown`);
  function update() {
    const text = words(Number(input.value));
    input.setAttribute('aria-valuetext', text);
    if (shown) shown.textContent = text;
  }
  input.addEventListener('input', update);
  update();
}

const HEAT = ['Mild', 'Medium', 'Hot', 'Very hot', 'Fierce'];
speak(document.getElementById('weight'), (v) => `${v} kg`);
speak(document.getElementById('heat'), (v) => `${HEAT[v - 1]}, ${v} of ${HEAT.length}`);
```

`speak()` also runs `update()` once at load, or the text would be missing until the first move. A value set from a script, `input.value = 10`, fires no event at all, so fire one yourself. Tray UI's catalogue does this when its filters are cleared:

```js
price.value = price.max;
price.dispatchEvent(new Event('input', { bubbles: true }));
```

## Two thumbs

A price filter often has two thumbs on one track, a lowest and a highest price. Tray UI has no two-thumb slider. The APG's [multi-thumb slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/) asks that "each thumb is in the page tab sequence", that "the tab order remains constant regardless of thumb value", and that a thumb's limits follow the other thumb's value.

Two native range inputs, with a label each, give you the first two:

```html
<fieldset>
  <legend>Price</legend>
  <label for="lo">Lowest price</label>
  <input type="range" id="lo" min="10" max="120" step="5" value="20">
  <label for="hi">Highest price</label>
  <input type="range" id="hi" min="10" max="120" step="5" value="90">
</fieldset>
```

```js
const lo = document.getElementById('lo'), hi = document.getElementById('hi');
lo.addEventListener('input', () => { if (+lo.value > +hi.value) lo.value = hi.value; });
hi.addEventListener('input', () => { if (+hi.value < +lo.value) hi.value = lo.value; });
speak(lo, (v) => `$${v}`);
speak(hi, (v) => `$${v}`);
```

For the third, the two inputs keep the full range as their `min` and `max`, and the script stops one passing the other. Add the listeners that hold the thumbs apart before `speak()`: listeners run in the order they were added, so the text is written after the value is corrected.

## Drawing the track

Tray UI draws the slider with `appearance: none` and its own track and thumb: an 8px pill track in the `track` colour, filled in `ink` up to a 28px ink knob. WebKit and Blink have no element for the filled part, so the script writes the share of the range to a custom property, `--tray-v`, and the track paints a gradient that long. Firefox has `::-moz-range-progress`, which fills itself.

```css
.tray-slider { --tray-v: 50%; appearance: none; display: block; inline-size: 100%; block-size: 28px; margin: 0; background: none; cursor: pointer; }
.tray-slider::-webkit-slider-runnable-track { block-size: 8px; border-radius: var(--radius-pill); background: linear-gradient(var(--ink) 0 0) 0 / var(--tray-v) 100% no-repeat, var(--track); }
.tray-slider::-moz-range-progress { block-size: 8px; border-radius: var(--radius-pill); background: var(--ink); }
.tray-slider::-webkit-slider-thumb { appearance: none; inline-size: 28px; block-size: 28px; margin-block-start: -10px; border: 0; border-radius: 50%; background: var(--ink); }
.tray-slider:focus-visible { outline: none; }
.tray-slider:focus-visible::-webkit-slider-thumb { outline: 3px solid var(--ink); outline-offset: 5px; }
.tray-slider:dir(rtl)::-webkit-slider-runnable-track { background-position: 100% 0; }
```

```js
input.style.setProperty('--tray-v', ((+input.value - min) / (max - min) * 100) + '%');
```

The focus ring goes on the thumb, where the eye looks, and only for `:focus-visible`. Write the WebKit and the Firefox pseudo-elements in separate rules. A selector list that names both is dropped whole by a browser that does not know one of them: Chrome keeps no rule written as `.a::-webkit-slider-thumb, .a::-moz-range-thumb`. Right to left, the gradient starts from the right edge, where the minimum is.

In forced colours the track becomes `Canvas` with a `CanvasText` edge, and the fill and the knob take `SelectedItem`.

## The slider in Tray UI

Write the field, the label, the output and the range, with `data-tray="slider"` on the range:

```html
<div class="tray-slider-field">
  <div class="tray-slider-field__head">
    <label class="tray-label tray-label--inline" for="radius">Delivery radius</label>
    <output for="radius"></output>
  </div>
  <input class="tray-slider" id="radius" type="range" min="0" max="50" step="10" value="30" data-unit=" km" data-tray="slider">
  <div class="tray-slider-field__scale"><span>0</span><span>50</span></div>
</div>
```

The script paints the fill, writes the value and its unit into the field's `<output>`, which it hides from screen readers, and, with `data-unit`, sets `aria-valuetext` to the same words: "30 km". The unit is added as you write it, so put the space in it, `" km"`, or leave it out, `"%"`. For a unit that goes in front, or for words in place of numbers, leave out `data-unit` and set `aria-valuetext` from your own `input` listener, as the [catalogue with a filter column](#b-catalog-02) does.

Use a slider for coarse values, such as a budget or a radius. When the exact number matters, such as a quantity of 3, the [Stepper](#c-stepper) is the better control. The [Slider](#c-slider) page has the live examples, and the [Video Player](#c-video-player) has the seek bar with its time. A slider's unit was added in version 0.2.0, checked in Chrome and its accessibility tree, not in a screen reader.
