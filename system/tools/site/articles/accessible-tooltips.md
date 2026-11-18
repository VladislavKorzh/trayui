# Accessible tooltips that pass WCAG 1.4.13

A tooltip in plain HTML and JavaScript that meets WCAG 1.4.13: hoverable, dismissible with Escape, persistent, tied to its control, and what to use instead.

A tooltip is a short line that appears beside a control while the pointer rests on it or keyboard focus is on it: "Copy the link" over an icon button. MDN calls it "a contextual text bubble that displays a description for an element that appears on pointer hover or keyboard focus." The WAI-ARIA Authoring Practices Guide has a [tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/), marked as work in progress that "does not yet have task force consensus". Its rules agree with MDN's and with WCAG's success criterion 1.4.13 Content on Hover or Focus.

## What 1.4.13 asks

[Success criterion 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) is level AA. It covers content that pointer hover or keyboard focus makes visible, and that goes again when the hover or focus is removed. Such content has to meet three conditions.

- **Dismissible.** "A mechanism is available to dismiss the additional content without moving pointer hover or keyboard focus", unless the content is an input error or covers nothing else. The Understanding document names the usual mechanism: "such as pressing the Esc key."
- **Hoverable.** "If pointer hover can trigger the additional content, then the pointer can be moved over the additional content without the additional content disappearing."
- **Persistent.** The content "remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid."

The Understanding document explains them through a person who magnifies the screen. A bubble may cover the words they were reading, and Escape takes it away while their pointer stays put. In a magnified view, a long bubble may need panning to read, which "is impossible unless the user is able to move their pointer off the trigger without the additional content disappearing." And it has to stay while they read: no timer takes it away. The Understanding document lists two failures by number: F95, content shown on hover that is not hoverable, and F114, content that cannot be dismissed without moving the pointer or the focus.

The `title` attribute is outside the criterion, whose exception covers content "controlled by the user agent". It is no tooltip for a keyboard either. MDN: "One cannot activate this feature through either keyboard focus or through touch interaction, making this feature inaccessible."

## The markup

The APG gives two rules for the markup: "The element that serves as the tooltip container has role tooltip", and "The element that triggers the tooltip references the tooltip element with aria-describedby." The tooltip never takes focus, and "Focus stays on the triggering element while the tooltip is displayed." Since it never has focus, nothing inside it can be clicked: MDN says it "cannot contain interactive elements like links, inputs, or buttons."

`aria-describedby` makes the tooltip's words the control's description, read after its name. That suits words that add to the name. On an icon button, though, the tooltip usually says the name itself. Give the button `aria-label="Copy the link"` and a tooltip of the same words through `aria-describedby`, and Chrome's accessibility tree shows the button with the name "Copy the link" and the description "Copy the link".

For a tooltip that is the name, point `aria-labelledby` at it instead. A name is computed from an element that `aria-labelledby` refers to even while that element is hidden, so the words are read once, as the name.

```html
<span class="tip-anchor">
  <button type="button" aria-labelledby="copy-tip">
    <svg aria-hidden="true" width="20" height="20">…</svg>
  </button>
  <span role="tooltip" id="copy-tip" hidden>Copy the link</span>
</span>
```

For a tooltip that adds to the name, keep the name in `aria-label` and point `aria-describedby` at the tooltip, as the APG has it. Either way, the words exist once in the page.

## Hoverable: a bridge over the gap

The tooltip sits inside the anchor, with the control. For `pointerenter` and `pointerleave`, a descendant counts as part of its ancestor, so the pointer can move from the button onto the bubble without leaving the anchor. The 8px gap between them belongs to neither, and a pointer crossing it would leave. A transparent pseudo-element on the bubble fills the gap:

```css
.tip-anchor { position: relative; display: inline-block; }
.tip-anchor [role="tooltip"] {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  translate: -50% 0;
  padding: 8px 12px;
  border-radius: 12px;
  background: #1c1c1c;
  color: #fff;
  white-space: nowrap;
}
/* The 8px gap belongs to the tooltip, so the pointer can cross it */
.tip-anchor [role="tooltip"]::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  top: 100%;
  height: 8px;
}
```

`left: 50%` with `translate: -50% 0` centres the bubble over its control in either direction of text, so it needs no rule for right to left. The rule sets no `display`, so the `hidden` attribute still hides the bubble.

## The script

```js
function tooltip(anchor) {
  const control = anchor.querySelector('button, a, input');
  const tip = anchor.querySelector('[role="tooltip"]');
  let timer;

  function show() {
    clearTimeout(timer);
    tip.hidden = false;
    document.addEventListener('keydown', onEscape);
  }

  function hide() {
    clearTimeout(timer);
    tip.hidden = true;
    document.removeEventListener('keydown', onEscape);
  }

  // Escape hides it wherever focus is, and only it: a dialog around it stays open
  function onEscape(e) {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    hide();
  }

  anchor.addEventListener('pointerenter', show);
  anchor.addEventListener('pointerleave', () => {
    if (anchor.contains(document.activeElement)) return; // focus keeps it shown
    timer = setTimeout(hide, 150);
  });
  control.addEventListener('focus', show);
  control.addEventListener('blur', () => {
    if (!anchor.matches(':hover')) hide();
  });
}

document.querySelectorAll('.tip-anchor').forEach(tooltip);
```

- **Escape is heard on the document.** A bubble shown by the pointer alone has to go on Escape too, and focus may then be anywhere: in a text field across the page, for instance. A listener on the control would only hear Escape while the control has focus. The listener exists only while the bubble is shown, so Escape at any other time goes where it would have gone.
- **One press does one thing.** In Chrome, `preventDefault()` on that keydown keeps a `<dialog>` around the control open: the first Escape hides the bubble, the second closes the dialog.
- **The bubble waits 150 milliseconds** after the pointer leaves the anchor. The bridge covers the gap; the wait covers a pointer that cuts a corner.
- **Focus keeps it.** While the control has focus, the pointer coming and going does not hide the bubble, and leaving the control with Tab hides it unless the pointer is on it. The APG says the same: a tooltip invoked by focus "is dismissed when it no longer has focus".
- **No timer while it is shown.** That is the persistent condition: a tooltip that leaves after a few seconds fails it.
- **Dismissed stays dismissed**, until the pointer enters again or focus comes back. Moving the pointer within the button after Escape fires no new `pointerenter`, so the bubble does not jump back.

## When a tooltip is the wrong choice

A tooltip is for words that help but can be done without: what an icon means, a shortcut. A touch screen has no hover, so a tooltip only appears there when the control is pressed, and the press usually runs it as well. Whatever a person must know belongs somewhere else.

- **A hint or a rule for a field.** Write it as visible text under the field and point `aria-describedby` at it, as [Field](#c-field) does with its hint: it is read when the field takes focus and seen at all times. MDN: "If the information is important enough to include as a tooltip or title, consider including it in visible text."
- **An explanation, or anything with a link.** Use a toggletip: a button, such as "What is a batch?", that opens a small panel on click. The APG: "A hover that contains focusable elements can be made using a non-modal dialog." A click works on a touch screen, and Escape or a second click closes it.
- **A control that cannot take focus.** A disabled button never receives focus, so a keyboard user never sees its tooltip. Say why it is disabled in text beside it.
- **A button with a visible label.** The tooltip would show what the button already says.

## Tooltips in Tray UI

A [Tooltip](#c-tooltip) is an anchor around one control, with the words in `data-tip`:

```html
<span class="tray-anchor" data-tray="tooltip" data-tip="Search" data-keys="Ctrl K">
  <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" aria-label="Search">
    <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg>
  </button>
</span>
```

The script builds the bubble, a `span` with `role="tooltip"` and an `id`, and points the control's `aria-describedby` at it. `data-keys` adds a key cap for each word, and `data-side="bottom"` puts the bubble under the control. The bubble is solid `ink` with text in the page's colour and 12px corners. Change `data-tip` and the bubble follows, so a copy button can say "Copied" after a click.

Tray UI keeps `aria-describedby` and solves the repeated name another way. When the words of `data-tip` are the control's name, the script writes them into an attribute, and CSS draws them as generated content with an empty text alternative:

```css
.tray-tooltip__said::before { content: attr(data-said); content: attr(data-said) / ""; }
```

The eye sees "Search" and the key caps; the description holds only the keys. Chrome's accessibility tree shows the button above with the name "Search" and the description "Ctrl K". `aria-hidden` would not do it: while the bubble is hidden, Chrome computes the description from all of it, `aria-hidden` parts included, and gives "Search Ctrl K". The first `content` line is for a browser that does not know the `/ ""` form.

The bubble shows at once on hover and on focus. Its `::after` bridges the 8px gap, and it goes 150 milliseconds after the pointer has left the control and the bubble both, unless the control has focus. Version 0.2.0 brought this: "a tooltip stays while the pointer moves onto it." Escape hides it while focus stays on the control. Its Escape listener is on the anchor, so it hears the key only while focus is inside; a bubble shown by the pointer alone goes when the pointer leaves. It does not stop the key either, so in a dialog the same press closes the dialog too. Under `prefers-reduced-motion: reduce` it only fades, in a tenth of a second.

For a toggletip, use a [Popover](#c-popover). A popover of text alone has no control to take focus, so its script makes the panel a `dialog`, named by its title and described by its text, and moves focus to it, so the explanation is read as it opens. The [sidebar that collapses to icons](#b-sidebar-06) shows a tooltip on each item of its rail.
