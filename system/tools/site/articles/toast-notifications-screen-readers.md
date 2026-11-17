# Toast notifications that screen readers announce

How to make toast notifications that screen readers announce: a live region in the page first, polite or assertive, timing, focus and reduced motion.

## A toast is a status message

A toast says that something just happened: an order archived, a receipt sent, an export that failed. WCAG 2.2 calls this a status message: a change in content that is not a change of context, and that tells the person about the result of an action, a wait, the progress of a process or an error.

Success criterion 4.1.3 Status Messages (level AA) asks that such a message "can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus". So a toast sits in a live region, marked by `role="status"` or `aria-live="polite"`, and does not take focus. The Understanding document lists `role="status"` as a sufficient technique (ARIA22), and treats a message that takes focus, such as a dialog, as a change of context instead.

## Why many toasts are never announced

A screen reader announces a change inside a live region it already knows. The region has to be in the accessibility tree first; text added to it afterwards is what gets read.

Much toast code does both at once: it makes an element with a role and its words, and puts it in the page.

```js
// Often not announced: the region and its words arrive in the same change
const toast = document.createElement('div');
toast.setAttribute('role', 'status');
toast.textContent = 'Order archived';
document.body.append(toast);
```

For the browser this is a new element, not a change inside a live region. MDN's page on the `alert` role says that adding an element "already populated with the alert message you want announced" "generally does not lead to an announcement, as it is not a content change". A toast container mounted together with the first toast has the same problem.

Make the region first and fill it later. MDN's guide to live regions: "The most reliable way to ensure that live regions are registered is to include them in the initial markup." Put an empty container in the page and add each toast to it as a child.

```html
<div id="toasts" aria-live="polite"></div>
```

```js
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.getElementById('toasts').append(toast);
  return toast;
}
```

Keep the empty container rendered: content inside `display: none` or `hidden` is not exposed to assistive technologies. Place it in its corner with CSS instead.

When a script has to make the region itself, MDN advises to "defer the content update to a later event-loop task, for example using `setTimeout()`". Tray UI shows the first toast at once, so nobody waits to see it, and 150 milliseconds later takes its words out and puts them back, a new addition to a region that is now known.

```js
let region = document.querySelector('.tray-toasts'), fresh = false;
if (!region) {
  region = document.createElement('div');
  region.className = 'tray-toasts';
  region.setAttribute('role', 'region');
  region.setAttribute('aria-label', 'Notifications');
  document.body.appendChild(region);
}
if (region.getAttribute('aria-live') !== 'polite') {
  region.setAttribute('aria-live', 'polite');
  fresh = true;
}
region.appendChild(toast);
if (fresh && tone !== 'danger') setTimeout(() => {
  const body = toast.querySelector('.tray-toast__body');
  if (body && toast.isConnected) toast.insertBefore(body, body.nextSibling);
}, 150);
```

`insertBefore(body, body.nextSibling)` puts the node back where it was. In the DOM that is a removal and an addition, and the addition is what the live region reports. Later toasts need nothing more: the region is already live. The named `role="region"` also makes the container a landmark, so the person can move to the toasts directly after hearing them.

## Polite and assertive

A live region is polite or assertive. MDN says a polite region is spoken "whenever the user is idle", while a change to an assertive one "will interrupt any announcement a screen reader is currently making", which keeps assertive for "time-sensitive/critical notifications". Two roles carry these values with them.

| Role | Same as | For |
| --- | --- | --- |
| `role="status"` | `aria-live="polite"` and `aria-atomic="true"` | The result of an action: saved, sent, archived. |
| `role="alert"` | `aria-live="assertive"` and `aria-atomic="true"` | An important, time-sensitive message: a failure, a lost connection. |

`aria-atomic="true"` presents the whole region whenever any part of it changes. That suits a region with one message at a time, not a stack: each new toast would have the whole stack read again. Tray UI therefore puts a plain `aria-live="polite"` on the container. Its `aria-atomic` stays at the default, `false`, and only what was added is read.

A danger toast is the exception: Tray UI gives `role="alert"` to the toast itself, and no timer. That a populated alert is read on insertion is not in the specification: MDN's guide notes that browsers and assistive technologies "in most cases" announce it anyway, and MDN's page on the role advises against counting on it. In Tray UI this matters only when a danger toast is the first toast in a region that has only just become live. Write the region into the page, as the last section shows, and no toast depends on it.

Use assertive sparingly. The Understanding document for 4.1.3 lists `role="alert"` or `aria-live="assertive"` "on content which is not important and time-sensitive" among its failures. "Receipt sent" is polite; "The export failed" is an alert.

## A toast with an action

"Undo" is the best action a toast can have: the person acts, sees the result, and can take it back, with no confirmation asked beforehand. It is also where a timer becomes a problem.

WCAG 2.2.1 Timing Adjustable (level A) covers every time limit the content sets: the person must be able to turn it off, adjust it to at least ten times the default, or be warned and given at least 20 seconds to extend it, unless an exception applies. Its Understanding document uses a toast as an example. A new-mail message that leaves after 5 seconds sets no time limit, because the inbox shows the same thing. But "if the user has no other means of discovering the same information (or performing the same function)", each message has to meet the criterion.

An Undo button that exists only in the toast is such a function. In Tray UI the region is at the end of the page, so a keyboard user reaches Undo with `Tab` after everything else. A screen reader user hears a polite toast only once they are idle, then has to find the button. Five seconds is not enough for either.

Tray UI sets no time limit at all on a toast with an action. It stays until the person runs the action or dismisses it, and so does a danger toast.

```js
const life = opts.duration != null
  ? opts.duration
  : (tone === 'danger' || opts.action ? 0 : 5000);
```

A `duration` you pass wins over the default, so give a toast with an action none, unless the same action is also available in the page. `duration: 0` keeps any toast until it is dismissed.

## Pausing on hover and focus

A toast without an action leaves after 5 seconds. In Tray UI its timer stops while the pointer or focus is on it, and starts again from the full duration when the pointer leaves or focus moves out.

```js
let timer = null;
function arm() {
  clearTimeout(timer);
  if (life) timer = setTimeout(dismiss, life);
}
toast.addEventListener('pointerenter', () => clearTimeout(timer));
toast.addEventListener('pointerleave', arm);
toast.addEventListener('focusin', () => clearTimeout(timer));
toast.addEventListener('focusout', arm);
arm();
```

`focusin` and `focusout` bubble, unlike `focus` and `blur`, so they catch every button in the toast; moving between its buttons fires `focusout`, then `focusin`, and the toast stays.

Pausing helps the person reading the toast or reaching for its button. It does not settle 2.2.1, since a screen reader user may never put the pointer or focus on the toast.

## Focus when a toast is dismissed

A keyboard user who tabs into a toast and presses its close button is on an element about to be removed. When the focused element leaves the page, `document.activeElement` becomes `body`, and the person has lost their place.

Tray UI moves focus before the toast goes, with `rescue()`:

```js
function rescue(el, to) {
  const active = document.activeElement;
  if (!el || !active || (el !== active && !el.contains(active))) return;
  const target = typeof to === 'function' ? to() : to;
  if (!target || !target.focus || !target.isConnected) return;
  if (!target.matches('a[href], button, input, select, textarea, summary, [tabindex]')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
}
```

It does nothing unless focus is inside the element that is going, so a toast that times out while the person types elsewhere leaves their focus alone. The target can be a function, worked out at the last moment. For a toast it gives, in this order:

1. the first button of the next toast, or of the one before it when the dismissed toast was the last;
2. the element focus came from before it entered the toasts.

Each toast notes where focus came from (the `relatedTarget` of its `focusin`), and a toast reached from another keeps that toast's origin. Dismiss two toasts in a row and focus ends on the button the person started from. Running the action dismisses the toast too, so Undo hands focus on the same way. `TrayUI.rescue(el, to)` is public, for your own scripts.

## Reduced motion

In Tray UI a toast rises in and sinks out only for a person who has not asked for less motion:

```css
@media (prefers-reduced-motion: no-preference) {
  .tray-toast[data-enter] { animation: tray-rise var(--duration-in) var(--ease); }
  .tray-toast[data-leaving] { animation: tray-sink var(--duration-out) var(--ease-exit) forwards; }
}
@keyframes tray-rise { from { opacity: 0; translate: 0 12px; scale: .97; } }
@keyframes tray-sink { to { opacity: 0; translate: 0 10px; scale: .97; } }
```

Writing the animation inside `no-preference`, instead of taking it away inside `reduce`, makes stillness the default. The script reads the same setting: a leaving toast waits for its exit animation, a second at most, before it is taken out, and under `reduce` it is removed at once.

```js
function calm() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
// in dismiss()
if (calm()) { toast.remove(); return; }
toast.setAttribute('data-leaving', '');
```

## What not to put in a toast

- **An error the person must act on.** A wrong value belongs under its field, where it stays until it is fixed and is read when the field takes focus: see [Field](#c-field). Something to read or decide on goes in an [Alert](#c-alert) in the page or an [Alert Dialog](#c-alert-dialog), and news about the whole account in a [Banner](#c-banner).
- **Long text.** A title of three or four words, and one more line at most. A polite announcement waits for a pause, and the toast may be gone before a long message is read through.
- **More than one action.** A second choice turns the toast into a decision.
- **A burst.** One toast per event, and no more than three on screen: each one is another announcement.

## Toasts in Tray UI

[Toast](#c-toast) needs only the stylesheet and the script from [Installation](#d-installation). `TrayUI.toast()` makes the region on its first call, at the end of the page. To have it live from page load, write it yourself at the end of `body`. The script finds it by its class, sees that it is already live, and skips the second insertion.

```html
<body>
  …your page…
  <div class="tray-toasts" role="region" aria-label="Notifications" aria-live="polite"></div>
  <script src="trayui/components/bundle.js"></script>
</body>
```

```js
TrayUI.toast({ tone: 'success', title: 'Receipt sent', text: 'To dana@example.com' });

const archived = TrayUI.toast({
  title: 'Order archived',
  action: { label: 'Undo', onClick: restore }
});

TrayUI.toast({ tone: 'danger', title: 'The export failed', text: 'Check the connection and try again.' });
```

| Option | Meaning |
| --- | --- |
| `title` | What happened, in three or four words. |
| `text` | One more line, when needed. |
| `tone` | `'success'` or `'danger'` add an icon in that colour; a danger toast is an alert. Leave it out for a neutral toast. |
| `action` | One button, `{ label, onClick }`. The toast stays until it is dismissed. |
| `duration` | Milliseconds on screen, 5000 by default. `0`, the default for a danger toast and a toast with an action, keeps it until it is dismissed. |

The call returns `{ dismiss, element }`: `archived.dismiss()` takes the toast away and hands focus on if it was inside. Title and text are set as text, not HTML. The close button is named "Dismiss", the tone icon is hidden from assistive technologies, and a tone always comes with words, so colour is never the only sign.

Toasts moved into a live region in version 0.2.0. Like the rest of that release, this was checked in Chrome and its accessibility tree, not yet in a screen reader. The [Accessibility](#g-accessibility) guide has the rules every component follows.
