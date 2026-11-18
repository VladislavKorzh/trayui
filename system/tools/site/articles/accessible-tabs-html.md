# Accessible tabs in HTML: roles and arrow keys

Tabs in plain HTML and JavaScript: tablist, tab and tabpanel, aria-selected, a roving tabindex, the arrow keys, Home and End, and when tabs should be links.

## Tabs or links

Two things on the web look like a row of tabs. One swaps panels of content in place: the items, the delivery and the messages of one order. The other is a row of links to other pages, or to the sections of a long page. Only the first is what the WAI-ARIA Authoring Practices (APG) call [tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): "a set of layered sections of content, known as tab panels, that display one panel of content at a time".

A row of links stays a row of links. Put it in a `<nav>` with an `aria-label`, and mark the link to the page you are on with `aria-current="page"`, which MDN describes as "the current page within a set of pages". Tab moves through the links one by one, each one can be opened in a new browser tab, and the address changes when one is followed. Giving the links `role="tab"` would replace their role, so they would no longer be exposed as links, and it would promise arrow keys and panels that a link to another page does not have.

The two attributes do not swap either. MDN's page on `aria-current` warns against using it "as a substitute for `aria-selected`" on a `tab`, among other roles. A tab says it is selected, and a link says it is current.

Tray UI's own site has both kinds, drawn with the same `tray-tabs` strip. The Articles page lists its topics as a `<nav aria-label="Topics">` of links, each topic its own page under `/articles/topics/`, the current one marked `aria-current="page"`. Every component page has a Preview and a Markup tab above its example, and every block page a Preview and a Code tab; those are real tablists, because both panels live on the same page.

## The markup

```html
<div class="tabs">
  <div role="tablist" aria-label="Order PL-20418">
    <button type="button" role="tab" id="tab-items" aria-controls="panel-items" aria-selected="true">Items</button>
    <button type="button" role="tab" id="tab-delivery" aria-controls="panel-delivery" aria-selected="false" tabindex="-1">Delivery</button>
    <button type="button" role="tab" id="tab-messages" aria-controls="panel-messages" aria-selected="false" tabindex="-1">Messages</button>
  </div>
  <div role="tabpanel" id="panel-items" aria-labelledby="tab-items" tabindex="0">Two jars of 50 g and a gift box.</div>
  <div role="tabpanel" id="panel-delivery" aria-labelledby="tab-delivery" tabindex="0" hidden>Courier, today between 14:00 and 18:00.</div>
  <div role="tabpanel" id="panel-messages" aria-labelledby="tab-messages" tabindex="0" hidden>Three messages from the courier.</div>
</div>
```

- **The tablist has a name.** The APG asks for `aria-labelledby` when a visible label exists, and `aria-label` when it does not.
- **Each tab is a `<button type="button">`.** It takes focus, Enter and Space click it, and `type="button"` keeps it from submitting a form it sits in.
- **Every tab says whether it is selected.** In the APG's words, "The active tab element has the state aria-selected set to true and all other tab elements have it set to false."
- **Tab and panel point at each other.** The tab names its panel with `aria-controls`; the panel takes its name from its tab with `aria-labelledby`.
- **The panels that are not shown are `hidden`**, which takes them out of the accessibility tree as well as off the screen.
- **A panel takes `tabindex="0"`** when it holds nothing focusable, or when its first content is not focusable. The APG puts it this way, and MDN adds that if any panel needs it, all of them should have it, "so that screen reader users can navigate to the panel content consistently". On Tray UI's site the Markup and Code panels have it, since they hold text; the Preview panel does not, since it holds the live example and its own controls.

## One Tab stop: the roving tabindex

A tablist is one stop in the Tab order, however many tabs it has. The selected tab carries `tabindex="0"`, every other tab `tabindex="-1"`, and the script moves the 0 when the selection moves. MDN: "These two attributes must always be coordinated", meaning `tabindex` and `aria-selected`.

So Tab from the page before lands on the selected tab, and the next Tab goes into its panel: the APG sends focus to "the next element in the page tab sequence outside the tablist, which is the tabpanel" unless the panel starts with something focusable. A person who does not want this tab set passes it with one key press, and a person who does reaches the content in two.

## The keys

| Key | What happens |
| --- | --- |
| ArrowRight | The next tab, wrapping from the last to the first. |
| ArrowLeft | The previous tab, wrapping from the first to the last. |
| Home, End | The first or the last tab. |
| Enter or Space | Shows the tab's panel, where arrows do not show it already. |
| Tab | Leaves the tablist for the selected tab's panel. |

The APG marks Home and End as optional; Tray UI has both. In a page written right to left the tabs run from right to left, so the two arrows swap: Tray UI reads the strip's `direction` on each key press and turns ArrowLeft into "next".

A vertical tablist takes `aria-orientation="vertical"` and moves with ArrowUp and ArrowDown. A horizontal one does not listen for those two keys, the APG says, so they keep scrolling the page while focus is on a tab. Tray UI's tabs are horizontal only.

A `disabled` button cannot take focus, so the arrows pass over a disabled tab. In Tray UI's example, End from Items goes to Messages, the last tab that can be used, and skips Refunds, which is turned off.

The APG has two more keys for special cases: Delete, for tab sets where a tab can be closed, and Shift+F10, for a tab that opens a menu. A plain tab set has neither.

## Automatic or manual activation

With automatic activation, the arrow that moves focus to a tab also shows its panel. With manual activation, the arrows move focus only, and Enter or Space shows the panel.

The APG recommends the first "as long as their associated tab panels are displayed without noticeable latency". When a panel has to be fetched from a server or takes long to draw, automatic activation "slows focus movement", since the person who wants the third tab waits for the second to load on the way. Manual activation suits those panels.

Tray UI's tabs activate automatically: an arrow key selects the tab, shows its panel and moves focus, in one step. MDN's own tab example does the opposite, and says so: it chose "to not activate the tab when the user navigates with the arrow keys, but instead only move focus".

## A script from scratch

This runs the markup above, and any other tablist on the page. Put `data-manual` on a tablist to make it manual.

```js
for (const list of document.querySelectorAll('[role="tablist"]')) {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const manual = list.hasAttribute('data-manual');

  function select(tab) {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    }
  }

  // A click, or Enter or Space on a focused tab, selects it
  list.addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab && !tab.disabled) select(tab);
  });

  list.addEventListener('keydown', (e) => {
    const usable = tabs.filter((t) => !t.disabled);
    const i = usable.indexOf(document.activeElement);
    if (i < 0) return;
    const back = getComputedStyle(list).direction === 'rtl' ? 1 : -1;
    const step = { ArrowLeft: back, ArrowRight: -back }[e.key];
    let to;
    if (step) to = usable[(i + step + usable.length) % usable.length];
    else if (e.key === 'Home') to = usable[0];
    else if (e.key === 'End') to = usable[usable.length - 1];
    else return;
    e.preventDefault();
    to.focus();
    if (!manual) select(to);
  });
}
```

- **Enter and Space need no handler.** Both click a focused `<button>`, and the click handler selects the tab, so the mouse and the keyboard share one path.
- **In manual mode `tabindex` stays with the selected tab.** A person can arrow to a tab, decide against it and press Tab; focus then goes on to the panel that is still shown.
- **`preventDefault()` only for the keys the script uses.** Every other key, Tab included, keeps doing what it does.

## What to leave out

- **`aria-current` on a tab.** Tabs use `aria-selected`; `aria-current` is for links.
- **`role="tab"` on links to other pages.** Navigation is a `<nav>` of links, as above.
- **`aria-expanded`.** It is not in the APG's list for tabs. The selected tab already says it is selected.
- **`aria-haspopup`**, unless the tab opens a menu, which is the one case where the APG uses it.
- **Tabs for steps.** Steps that must be done in order are a stepper or a progress bar of steps; tabs let the person go anywhere. Tray UI's rule for tabs: "Don't use tabs for steps that must be done in order".
- **A strip inside a panel of another strip.** Tray UI's rule: "Don't nest a strip inside a panel of another strip."

## Tabs in Tray UI

Write the strip and the panels, with `data-tray="tabs"` on the wrapper:

```html
<div data-tray="tabs">
  <div class="tray-tabs" role="tablist" aria-label="Order PL-20418">
    <button class="tray-tab" type="button" role="tab" aria-selected="true" aria-controls="p-items" id="t-items">Items</button>
    <button class="tray-tab" type="button" role="tab" aria-controls="p-delivery" id="t-delivery">Delivery</button>
  </div>
  <div class="tray-tabpanel" role="tabpanel" id="p-items" aria-labelledby="t-items" tabindex="0">…</div>
  <div class="tray-tabpanel" role="tabpanel" id="p-delivery" aria-labelledby="t-delivery" tabindex="0" hidden>…</div>
</div>
```

The script writes `aria-selected` and `tabindex` on every tab, so the tabs you leave unmarked start as `false` and `-1`, shows the panel of the tab marked `aria-selected="true"` (or of the first), and handles the keys above, automatic activation and right to left. It fires `tray:change` on the wrapper with `detail.tab`, the selected tab's `id`, after each choice; since version 0.3.0 the tab it starts on fires nothing (0.2.0 fired once at load for it).

The tabs are 44px high. Focus draws the 3px ring inside the tab, and the selected tab is solid ink: a pill behind it slides to the next tab chosen, following `aria-selected`, so a tab selected from your own script moves it too. A panel chosen by a press fades in; under `prefers-reduced-motion: reduce` the pill moves at once and the panel appears without fading. For navigation, write `<nav class="tray-tabs" aria-label="…">` with `<a class="tray-tab">` links and `aria-current` on the current one; it needs no script. A strip that may not fit takes `data-tray="strip"`: it scrolls sideways and fades at its end while tabs run past it.

The [Tabs](#c-tabs) page has the live example, with a count on a tab and a disabled one. The [table with status tabs](#b-table-03) uses tabs with counts over a table each, and [Installation](#d-installation) has the three files to link.
