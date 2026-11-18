# prefers-reduced-motion beyond animation

What prefers-reduced-motion should change besides keyframe animations: presses, turning chevrons, filling bars, a folding sidebar and overlays that fade.

## What the setting asks for

`prefers-reduced-motion` reports a setting of the person's system. MDN's page on [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) describes it as a request "to minimize the amount of non-essential motion", for an interface "that removes, reduces, or replaces motion-based animations", and names the reason: such animations "can trigger discomfort for those with vestibular motion disorders". On macOS and iOS it is Reduce motion in the Accessibility settings, on Windows 11 Animation effects turned off, and on Android Remove animations. The query has two values, `reduce` and `no-preference`.

WCAG 2.2 sets the bar at level AAA. [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) asks that "motion animation triggered by interaction can be disabled", unless it is essential. Its definition of motion animation is wide: the "addition of steps between conditions to create the illusion of movement or to give a sense of a smooth transition". It leaves out "changes of color, blurring, or opacity" that do not change the perceived size, shape or position of an element.

Code often wraps its `@keyframes` in the media query and stops there. By that definition a CSS transition is motion animation too, and so is a smooth scroll and an element animated from a script.

## Where motion hides

These are the movements an interface makes in answer to a press, and what each becomes when less motion is asked for:

| What | How it moves | With less motion |
| --- | --- | --- |
| A pressed button | `scale` on `:active`, eased | Keeps its size; its fill still changes. |
| A chevron or a plus | `rotate` when its section opens, eased | Stands at its new angle at once. |
| A bar that fills | A transition on its width | Shows its new value at once. |
| A sidebar that folds to icons | A transition on its width | Takes its new width at once. |
| A switch | The knob slides across | The knob is on its new side at once. |
| A segmented control | A pill slides to the new choice | The pill is under the new choice at once. |
| A section that unfolds | Its height eases open | Opens at once. |
| A dialog, a sheet, a drawer | Rises, or slides in from an edge | Fades in place. |
| A list that scrolls to its end | `scroll-behavior: smooth`, `scrollTo()` | Jumps. |

None of these is a `@keyframes` animation. Each one moves, turns or changes size over a few hundred milliseconds, every time the person acts. A height that eases open is newer than the rest: `interpolate-size: allow-keywords` lets a transition run to `auto`, and MDN's compatibility data lists it in Chrome from version 129, not yet in Firefox or Safari. Where it is missing the section opens at once, so the reduced version is also what those browsers show.

## Two ways to write it

There are two places for the motion. Put it inside `@media (prefers-reduced-motion: no-preference)`, and stillness is the default: a browser that knows nothing of the query gets none. Or write the motion in the component's own rules and take it back inside `reduce`, which suits motion that is part of how a component is drawn. This example takes the second way, for a press, a chevron and a bar:

```html
<button class="btn" type="button">Order a jar</button>
<details>
  <summary>Shop <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></summary>
  <p>Orders</p>
</details>
<div class="bar" role="progressbar" aria-label="Upload" aria-valuenow="42" style="--value: 42%"><span></span></div>
```

```css
html { scroll-behavior: smooth; }
.btn { padding: 12px 20px; border: 0; border-radius: 14px; background: #ffd426; color: #141414; font: inherit;
  transition: filter .15s ease, scale .15s ease; }
.btn:hover { filter: brightness(.95); }
.btn:active { scale: .97; }
.chevron { transition: rotate .2s ease; }
details[open] .chevron { rotate: 90deg; }
.bar { block-size: 8px; border-radius: 4px; background: #d9d7d0; }
.bar > span { display: block; inline-size: var(--value); block-size: 100%; border-radius: inherit; background: #141414;
  transition: inline-size .2s ease; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .btn { transition-property: filter; }
  .btn:active { scale: none; }
  .chevron, .bar > span { transition: none; }
}
```

- **Trim the transition, keep the colour.** `transition-property: filter` keeps the hover darkening eased and drops the scale. A darker fill is not motion by WCAG's definition, and it still tells the person the press landed.
- **Reset the scale alone.** The press uses the `scale` property, so `scale: none` resets the press and leaves any other transform alone. A button centred with `translate: -50% 0` keeps its place when pressed. Tested in Chrome: under `reduce`, a pressed button kept its width and position, centred or not. A `transform: none` would have removed the centring with the press.
- **Keep the end state.** The chevron still turns to 90 degrees when the section opens: tested, it stood at 90 degrees as soon as the section opened. The angle says the section is open, so it stays; only the travel goes. The bar shows its new value the same way.

## What stays

The setting asks for less non-essential motion, and WCAG counts colour and opacity outside motion. So a change of fill, a change of colour and a fade can stay, and so can every end state: the knob on its new side, the pill under the new choice, the tick in the box.

**Overlays fade.** A dialog that appears in one frame changes most of the screen at once. A fade of about a tenth of a second keeps that change soft and moves nothing. This is the shape of Tray UI's dialog, shortened:

```css
.dialog {
  opacity: 0;
  transition-property: opacity, scale, translate, display, overlay;
  transition-duration: var(--duration-out);
  transition-behavior: allow-discrete;
}
.dialog[open] { opacity: 1; transition-duration: var(--duration-in); }
@starting-style { .dialog[open] { opacity: 0; } }

@media (prefers-reduced-motion: no-preference) {
  .dialog { translate: 0 12px; scale: .97; }
  .dialog[open] { translate: 0 0; scale: 1; }
  @starting-style { .dialog[open] { translate: 0 12px; scale: .97; } }
}
@media (prefers-reduced-motion: reduce) {
  .dialog, .dialog[open] { transition-duration: .1s; }
}
```

The rise and the scale exist only inside `no-preference`. Tested in Chrome under `reduce`, the dialog went from transparent to opaque in about a tenth of a second, with no `translate` and no `scale` at any point.

**Activity still shows.** Tray UI's accessibility guide keeps its spinner turning, so that it still reads as activity: it slows from one turn in 0.8 seconds to one in 2.4. The pulse of a skeleton and the sliding segment of a busy bar stop.

A common reset sets every animation and transition to 0.01 milliseconds under `reduce`. It is quick to add, and it also stops the fades and colour changes that WCAG does not count as motion.

## Motion in scripts

CSS does not reach a script. `scrollTo({ behavior: 'smooth' })` scrolls smoothly whatever `scroll-behavior` says, and `element.animate()` runs whatever the media query says. Read the setting in the script, at the moment of the action, so a change made while the page is open counts:

```js
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function toEnd(list) {
  list.scrollTo({ top: list.scrollHeight, behavior: calm() ? 'auto' : 'smooth' });
}
```

Tested in Chrome: under `reduce` the list was at its end as soon as `toEnd()` returned; without it, the scroll was still on its way. A script that waits for an exit animation before it removes an element should not wait under `reduce`: remove the element at once.

## Test it

- **DevTools.** In Chrome's Rendering tab, set "Emulate CSS media feature prefers-reduced-motion" to `reduce`.
- **Playwright.** `browser.new_context(reduced_motion="reduce")`. To see a press, hold the pointer down with `page.mouse.down()` and read `getComputedStyle(button).scale`.

Then go through the interface and press everything: buttons, switches, the parts that open and close, the controls that scroll. Anything that grows, shrinks, slides, turns or scrolls by itself under `reduce` is left to fix.

## Reduced motion in Tray UI

Tray UI times every change with tokens: `--duration-press` (.15s) for a press, `--duration-fill` (.18s) for a change of fill, `--duration-move` (.2s) for something that travels, `--duration-in` (.22s) for something that appears and `--duration-out` (.14s) for its going. `92-motion.css` writes movement and scale only inside `no-preference`. Under `reduce`, menus, popovers, tooltips, dialogs, sheets and drawers fade in a tenth of a second, and the rest changes at once: the pill of a segmented control or a strip of [Tabs](#c-tabs) stands under the new choice, the drawn tick of a checkbox is there, and an [Accordion](#c-accordion) opens to its full height. That was in 0.1.0.

Version 0.2.0 took the same care to the motion written in the components' own rules, under "Less motion when asked for": "presses, turning icons, filling bars and a folding sidebar change at once". It is the last block of `92-motion.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .tray-btn:active, .tray-btn-group__item:active, .tray-toggle:active, .tray-input-group__btn:active { transform: none; }
  .tray-btn, .tray-btn-group__item, .tray-toggle, .tray-input-group__btn, .tray-switch__track::before, .tray-tile .tray-icon,
  summary.tray-sidebar__label > .tray-icon, .tray-sidebar__caret, .tray-trace-group > summary .tray-icon { transition-property: background-color, color, filter; }
  .tray-progress__bar::before, .tray-checklist *, .tray-sidebar, .tray-app__side { transition: none; }
}
```

The block above is as the next release has it. In 0.2.0 the button inside an [Input Group](#c-input-group) still shrank under a press, and the block reset a press on a segment's `span` that nothing set. The "Latest" button of a message scroller was centred with `transform: translateX(-50%)`, so the reset took the centring away with the press, and the button jumped 38 pixels sideways; it is now centred by its margins.

Measured in Chrome under `reduce`: a pressed button keeps its size, the knob of a [Switch](#c-switch) and the chevrons of a [Sidebar](#c-sidebar) carry no transform transition, a [Progress](#c-progress) bar and a folding sidebar have no transition at all, and a [Spinner](#c-spinner) takes 2.4 seconds a turn. The scripts read the setting too: a carousel, a lightbox and the "Latest" button of a message scroller jump instead of scrolling, and a [Toast](#c-toast) appears and goes at once, as [Toast notifications that screen readers announce](#a-toast-notifications-screen-readers) shows. The [Accessibility](#g-accessibility) guide lists what changes under `reduce`.
