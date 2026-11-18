# An accessible product tour that closes on Escape

A product tour in HTML and JavaScript: non-modal steps that point at the page, move focus with each step, close on Escape, can be skipped and hand focus back.

A product tour points at the parts of a screen one at a time: a small panel beside each part, with a count, a sentence or two and a Next button. The WAI-ARIA Authoring Practices Guide has no pattern for it, so a tour is put together from parts that do have rules, starting with the non-modal dialog. Each behaviour below is what Tray UI's [Tour](#c-tour) does, next to a short version you can write yourself.

## Each step is a non-modal dialog

A step is a panel with a title and buttons that appears over the page, which makes it a dialog: `role="dialog"`, named by its heading through `aria-labelledby`. MDN's page on the role says a name "is not a requirement", but "labeling it is strongly recommended", and calls `aria-labelledby` the best way when the dialog has a visible title.

The step is not modal. MDN: "For non-modal dialogs it is still possible to interact with content outside of the dialog while the dialog is showing." A tour points at things the person may want to try, and a modal step would make the very part it points at inert. So no `aria-modal`, no backdrop, and no dimmed page; Tray UI's own rule is "Don't dim the page behind it. The ring is enough, and the screen stays usable."

```html
<div class="tour-area">
  <button type="button" id="tour-start">Take the tour</button>
  <label for="orders-filter">Status</label>
  <select id="orders-filter">…</select>
  <button type="button" id="orders-export">Export</button>
  …the rest of the screen…

  <div class="tour-step" role="dialog" aria-labelledby="step-1" data-for="#orders-filter" hidden>
    <p>1 of 2</p>
    <h2 id="step-1">Filter by status</h2>
    <p>Show only the orders that still need packing.</p>
    <button type="button" data-tour="skip">Skip the tour</button>
    <button type="button" data-tour="next">Next</button>
  </div>
  <div class="tour-step" role="dialog" aria-labelledby="step-2" data-for="#orders-export" hidden>
    <p>2 of 2</p>
    <h2 id="step-2">Take the list with you</h2>
    <p>Export what you see as a spreadsheet.</p>
    <button type="button" data-tour="back">Back</button>
    <button type="button" data-tour="skip">Skip the tour</button>
    <button type="button" data-tour="next">Done</button>
  </div>
</div>
```

- **One step at a time.** The steps not shown are `hidden`, so they are out of the Tab order and the accessibility tree.
- **After the screen.** The steps come after the parts they point at in the markup, so Tab reaches a step after its part, and reading order matches the order of the tour.
- **The count in words.** "1 of 2" is plain text inside the step. It is not a live region: focus brings the person into the step, where the count sits with the rest of its text.
- **The words name the part.** A sighted person sees the ring on the target; a screen reader user hears only the step. "Filter by status" works for both; "Click here" works for neither.

## Moving focus with each step

Next hides the step that holds focus. In Chrome 157, when a focused element is hidden, `document.activeElement` becomes the `body`, and the next Enter goes nowhere. So each move puts focus on the Next button of the new step, and Enter again goes on through the tour. The person stays in the tour, and their focus is in the step the screen shows.

```js
const steps = [...document.querySelectorAll('.tour-step')];
const start = document.getElementById('tour-start');
let at = -1;

const target = (step) => document.querySelector(step.dataset.for);

function place(step) {
  const area = step.offsetParent.getBoundingClientRect();
  const r = target(step).getBoundingClientRect();
  step.style.top = `${r.bottom - area.top + 14}px`;
  step.style.left = `${Math.max(8, Math.min(r.left - area.left, area.width - step.offsetWidth - 8))}px`;
}

function show(i) {
  steps.forEach((step, n) => {
    step.hidden = n !== i;
    target(step).toggleAttribute('data-tour-on', n === i);
  });
  at = i;
  if (i < 0) return;
  place(steps[i]);
  steps[i].querySelector('[data-tour="next"]').focus();
}

// The tour ends: focus in the step goes back to the button that started it
function end() {
  if (steps[at].contains(document.activeElement)) start.focus();
  show(-1);
  localStorage.setItem('tour-seen', '1');
}

start.addEventListener('click', () => show(0));

document.addEventListener('click', (e) => {
  const act = e.target.closest('.tour-step [data-tour]')?.dataset.tour;
  if (act === 'next' && at < steps.length - 1) show(at + 1);
  else if (act === 'back' && at > 0) show(at - 1);
  else if (act === 'next' || act === 'skip') end();
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || at < 0 || !steps[at].contains(e.target)) return;
  e.preventDefault();
  end();
});
```

The area needs `position: relative` and each step `position: absolute`, so that `place()` can set them below their part. Back moves focus the same way, to the Next button of the earlier step.

## Starting the tour

MDN's page on the dialog role: "When the dialog appears on the screen, keyboard focus (whose control depends upon the dialog's purpose) should be moved to the default focusable control inside the dialog." A tour started from a "Take the tour" button does that: `show(0)` focuses the first Next.

A tour that comes with the page is a different case. Tray UI shows its first step as the page loads and leaves focus where the page put it; because the steps come after the screen in the markup, a keyboard user meets the first step after the parts of the screen it points at. A person who ignores it loses nothing: the page around it works as before.

## Escape, Skip and the end

Every step offers a way out. Tray UI's rule for a tour: "Do keep a tour to three or four steps, and let it be skipped from every step." Skip ends the tour at once, and so does Escape in a step, the key that closes menus, popovers and dialogs.

The script listens for Escape only while focus is inside the shown step. Escape pressed in a field or a menu elsewhere on the page belongs to that control, and the tour leaves it alone. When the key does end the tour, `preventDefault()` keeps it from also closing a dialog around the tour.

The end needs a focus move of its own. The step that held focus is hidden, and without a move focus falls to the `body`. MDN again: "After the dialog is dismissed, keyboard focus should be moved back to where it was before it moved into the dialog."

- **A tour started from a button:** back to that button, as the script above does.
- **A tour that came with the page:** there is no "before". Tray UI sends focus to the part the step was pointing at, or to the first control inside it, so the person lands on the thing they have been reading about.

Both versions move focus only when it is inside the step. A click does not focus a button in every browser (MDN: "Safari does not, by design"), so a pointer user who clicks Skip there keeps their place, and a tour that ends while focus is elsewhere leaves it there. Tray UI does this with `TrayUI.rescue(el, to)`, described in [Toast notifications that screen readers announce](#a-toast-notifications-screen-readers). The tour skipped was one of the cases in version 0.2.0: "A control that hides or turns off while it has focus … now hands focus to the control beside it."

Store that the tour was seen, or it starts again on every visit. The script above writes to `localStorage`; Tray UI fires `tray:complete` with `{ finished }`, `true` after the last Next and `false` after Skip or Escape.

## Pointing at the part

A ring marks the part the step speaks of. It has to differ from the focus ring, because focus moves between the step and the page while both are on screen. Tray UI draws it dashed and further out, and hides it while the part itself shows focus:

```css
[data-tour-on]:not(:focus-visible) {
  outline: 2px dashed var(--ink);
  outline-offset: 6px;
  border-radius: var(--radius-control);
}
```

The ring is drawn by CSS and is not read, which is one more reason for the step's words to name the part.

The step sits 14 pixels under its part, kept at least 8 pixels inside the sides of the area. Tray UI's own placement puts it above the part when there is no room below, and places it again whenever the area changes size.

## Steps that cover the page

A step stays on screen while the person works, and it can cover a control beside its part. WCAG 2.2 success criterion 2.4.11 Focus Not Obscured (Minimum), level AA, asks that "When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content." A step that appears with the page is author-created content, and the Understanding document lists pressing Escape to dismiss the covering content as one way for the person to reveal the control.

- Keep steps short, and place them where they cover no control, under a heading or beside the part.
- In Tray UI a step is up to 21rem wide, nearly the whole width of a phone. Check each step at 320 pixels.
- If a step can cover a control, listen for Escape on the whole area while the tour is open, not only inside the step, so that a person on the covered control can clear it. Leave alone a key that a menu or a field has already used: `e.defaultPrevented` is then `true`.

## The tour in Tray UI

Tray UI's [Tour](#c-tour) needs the stylesheet and the script from [Installation](#d-installation). Put `data-tray="tour"` on an area that holds both the screen and the steps:

```html
<div class="tray-tour-area" data-tray="tour">
  …the screen, with ids on the parts the tour points at…

  <div class="tray-tour tray-raised" role="dialog" aria-labelledby="tour-1" data-for="#orders-filter">
    <p class="tray-tour__count"></p>
    <h2 class="nav" id="tour-1">Filter by status</h2>
    <p class="tray-pop__text">Show only the orders that still need packing.</p>
    <div class="tray-tour__foot">
      <button class="tray-btn tray-btn--link" type="button" data-tour="skip">Skip the tour</button>
      <button class="tray-btn tray-btn--dark tray-btn--xs" type="button" data-tour="next">Next</button>
    </div>
  </div>
  <div class="tray-tour tray-raised" role="dialog" aria-labelledby="tour-2" data-for="#orders-export" hidden>…</div>
</div>
```

- The step that is not `hidden` is shown when the page loads. Each step names its part with `data-for`, a selector inside the area.
- Buttons carry `data-tour="next"`, `"back"` or `"skip"`. Next on the last step ends the tour as finished; label it "Done". Back on the first step does nothing (in 0.2.0 it ended the tour as finished).
- The script writes the count ("2 of 3"), sets `data-tour-on` on the current part and places the step. On Next and Back it moves focus to the new step's Next button.
- Escape ends the tour as Skip does. Since the next release the script listens on the whole area, as advised above, so a person on a control that a step covers can clear it; in 0.2.0 only Escape in a step did. At the end, focus inside the step moves to the part the step pointed at, or the first control inside it.
- `tray:change` fires with `{ step }` on each move, and `tray:complete` with `{ finished }` at the end.

To start a tour later, from a button, add its markup when the person asks, call `TrayUI.init(area)` and move focus to the first Next yourself. Don't start a tour over a screen that is still empty: Tray UI's rule is to show the [Empty](#c-empty) state or the [Onboarding Checklist](#c-onboarding-checklist) first.
